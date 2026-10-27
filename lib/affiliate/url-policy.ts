/**
 * Affiliate destination URL policy.
 *
 * Only http(s) URLs are allowed. When approved retailer domains are configured
 * in affiliate settings, the destination host must match one of them.
 * This endpoint is never fed arbitrary user input from a query parameter —
 * only URLs stored by an authenticated admin, re-validated before redirect.
 */

export type UrlPolicyResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export function parseExternalUrl(raw: string): UrlPolicyResult {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "Not a valid URL." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "Only http(s) URLs are allowed." };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "URLs with embedded credentials are not allowed." };
  }
  return { ok: true, url };
}

function hostMatches(host: string, domain: string): boolean {
  const d = domain.toLowerCase().replace(/^\*\./, "");
  const h = host.toLowerCase();
  return h === d || h.endsWith(`.${d}`);
}

/**
 * Validate an affiliate destination against the approved-domain list.
 * An empty approved list means "any valid http(s) URL is allowed".
 */
export function validateAffiliateUrl(
  raw: string,
  approvedDomains: string[],
): UrlPolicyResult {
  const parsed = parseExternalUrl(raw);
  if (!parsed.ok) return parsed;
  if (approvedDomains.length > 0) {
    const allowed = approvedDomains.some((d) =>
      hostMatches(parsed.url.hostname, d),
    );
    if (!allowed) {
      return {
        ok: false,
        reason: `Domain "${parsed.url.hostname}" is not in the approved retailer domain list.`,
      };
    }
  }
  return parsed;
}
