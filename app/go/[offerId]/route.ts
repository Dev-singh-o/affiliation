import { headers } from "next/headers";

import { prisma } from "@/lib/db/prisma";
import { getSettings } from "@/lib/settings";
import { validateAffiliateUrl } from "@/lib/affiliate/url-policy";
import { rateLimit } from "@/lib/security/rate-limit";

/**
 * Bot classification (best-effort). We don't block — we record isBot=true
 * and still redirect, so analytics can filter them out.
 */
function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  const botHints = [
    "bot",
    "crawler",
    "spider",
    "slurp",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "whatsapp",
    "preview",
    "curl",
    "wget",
    "python-requests",
    "headless",
  ];
  return botHints.some((hint) => ua.includes(hint));
}

function classifySource(
  referrer: string | null,
  utmSource: string | null,
): { source: string; medium: string | null; campaign: string | null } {
  // Explicit UTM attribution wins.
  if (utmSource) {
    return {
      source: utmSource.toLowerCase().slice(0, 60),
      medium: null,
      campaign: null,
    };
  }
  if (!referrer) {
    return { source: "direct", medium: null, campaign: null };
  }
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("instagram")) return { source: "instagram", medium: "social", campaign: null };
    if (host.includes("youtube") || host.includes("youtu.be"))
      return { source: "youtube", medium: "social", campaign: null };
    if (host.includes("facebook") || host.includes("fb.com"))
      return { source: "facebook", medium: "social", campaign: null };
    if (host.includes("tiktok")) return { source: "tiktok", medium: "social", campaign: null };
    if (host.includes("twitter") || host.includes("x.com"))
      return { source: "x", medium: "social", campaign: null };
    if (host.includes("google")) return { source: "google", medium: "organic", campaign: null };
    return { source: "referral", medium: "referral", campaign: null };
  } catch {
    return { source: "direct", medium: null, campaign: null };
  }
}

/**
 * GET /go/[offerId]
 *
 * Secure affiliate redirect:
 *   1. Resolve the offer by id (validated).
 *   2. Offer must exist and be ACTIVE.
 *   3. Associated product must be PUBLISHED.
 *   4. Destination re-validated against approved domain policy.
 *   5. Record an outbound click (best-effort, never blocks redirect).
 *   6. 307 redirect to the exact stored affiliate URL (tracking params intact).
 *
 * Never accepts an arbitrary destination from a query parameter.
 */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ offerId: string }> },
) {
  const { offerId } = await ctx.params;

  // Basic id shape guard (cuid ~25 chars, alphanumeric).
  if (!/^[a-z0-9]{10,40}$/i.test(offerId)) {
    return new Response("Not found", { status: 404 });
  }

  const offer = await prisma.affiliateOffer.findUnique({
    where: { id: offerId },
    include: { product: { select: { slug: true, status: true } } },
  });

  if (!offer || offer.status !== "ACTIVE") {
    return new Response("Offer not found or inactive", { status: 404 });
  }
  if (!offer.product || offer.product.status !== "PUBLISHED") {
    return new Response("Product not available", { status: 404 });
  }

  const settings = await getSettings().catch(() => null);
  const approvedDomains = settings?.affiliate.approvedDomains ?? [];
  const validation = validateAffiliateUrl(offer.affiliateUrl, approvedDomains);
  if (!validation.ok) {
    return new Response("Invalid destination", { status: 400 });
  }
  const destination = validation.url.toString();

  const h = await headers();
  const userAgent = h.get("user-agent");
  const referrer = h.get("referer") ?? h.get("referrer");
  const forwarded = h.get("x-forwarded-for");
  const clientIp = forwarded?.split(",")[0]?.trim() ?? null;

  // Rate limit per client (best-effort, in-memory).
  const rateKey = clientIp ?? "unknown";
  const limited = rateLimit({
    namespace: "redirect",
    key: rateKey,
    limit: 60,
    windowSeconds: 60,
  });
  if (!limited.ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfterSeconds) },
    });
  }

  const url = new URL(request.url);
  const utmSource = url.searchParams.get("utm_source");
  const utmMedium = url.searchParams.get("utm_medium");
  const utmCampaign = url.searchParams.get("utm_campaign");
  const anonymousSessionId = url.searchParams.get("sid");

  const bot = isLikelyBot(userAgent);
  const { source, medium, campaign } = classifySource(referrer, utmSource);

  // Record click. Failures are logged but never block the redirect.
  try {
    await prisma.affiliateClick.create({
      data: {
        productId: offer.productId,
        affiliateOfferId: offer.id,
        referrer: referrer ? referrer.slice(0, 2048) : null,
        source: (utmSource ?? source).slice(0, 60),
        medium: (utmMedium ?? medium)?.slice(0, 60) ?? null,
        campaign: (utmCampaign ?? campaign ?? offer.trackingLabel)?.slice(0, 120) ?? null,
        userAgent: userAgent ? userAgent.slice(0, 512) : null,
        isBot: bot,
        // Pseudonymous session hash (daily salt). No raw IP retained.
        sessionHash: clientIp
          ? await hashSession(clientIp, userAgent ?? "")
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to record affiliate click:", error);
  }

  // 307 temporary redirect — preserves method and keeps tracking params intact.
  return Response.redirect(destination, 307);
}

async function hashSession(ip: string, ua: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${ua}|${day}|affiliate`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
