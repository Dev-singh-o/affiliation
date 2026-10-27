import { describe, it, expect } from "vitest";

import { slugify, isValidSlug } from "@/lib/slug";
import { validateAffiliateUrl } from "@/lib/affiliate/url-policy";
import { discountPercent, formatPrice } from "@/lib/utils";
import { validateUpload } from "@/lib/storage";

describe("slugify", () => {
  it("produces url-friendly slugs", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  A---B  ")).toBe("a-b");
    expect(slugify("Café")).toBe("cafe");
  });

  it("validates slugs", () => {
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("Hello")).toBe(false);
    expect(isValidSlug("a_b")).toBe(false);
  });
});

describe("affiliate url policy", () => {
  it("rejects non-http schemes", () => {
    const result = validateAffiliateUrl("javascript:alert(1)", []);
    expect(result.ok).toBe(false);
  });

  it("rejects embedded credentials", () => {
    const result = validateAffiliateUrl("https://user:pass@example.com/x", []);
    expect(result.ok).toBe(false);
  });

  it("enforces approved domains", () => {
    expect(validateAffiliateUrl("https://evil.com/x", ["amazon.com"]).ok).toBe(false);
    expect(validateAffiliateUrl("https://www.amazon.com/x", ["amazon.com"]).ok).toBe(true);
    expect(validateAffiliateUrl("https://x.com/y", []).ok).toBe(true);
  });
});

describe("utils", () => {
  it("computes discount percent", () => {
    expect(discountPercent(80, 100)).toBe(20);
    expect(discountPercent(100, 80)).toBeNull();
    expect(discountPercent(null, 100)).toBeNull();
  });

  it("formats prices", () => {
    expect(formatPrice(12.5, "USD")).toBe("$12.50");
    expect(formatPrice(null, "USD")).toBeNull();
  });
});

describe("upload validation", () => {
  it("rejects unsupported types and oversized files", () => {
    expect(validateUpload({ contentType: "text/plain", size: 100 }).ok).toBe(false);
    expect(validateUpload({ contentType: "image/png", size: 10 * 1024 * 1024 }).ok).toBe(false);
    expect(validateUpload({ contentType: "image/png", size: 1024 }).ok).toBe(true);
  });
});
