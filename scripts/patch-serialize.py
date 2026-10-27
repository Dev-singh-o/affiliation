import re

p = "lib/products/queries.ts"
s = open(p).read()

# Add serializeProduct helper after productInclude const block.
helper = '''
type ProductWithRelations = Awaited<ReturnType<typeof prisma.product.findFirst>>;

/**
 * Convert non-serializable Prisma values (Decimal, Date) into plain
 * JSON-safe values so products can cross the Server -> Client boundary.
 */
function serializeProduct<T>(product: T): T {
  if (!product || typeof product !== "object") return product;
  const result: Record<string, unknown> = { ...(product as Record<string, unknown>) };
  if (Array.isArray(result.offers)) {
    result.offers = (result.offers as Array<Record<string, unknown>>).map((offer) => ({
      ...offer,
      displayedPrice:
        offer.displayedPrice && typeof (offer.displayedPrice as { toString?: () => string }).toString === "function"
          ? (offer.displayedPrice as { toString: () => string }).toString()
          : offer.displayedPrice,
      originalPrice:
        offer.originalPrice && typeof (offer.originalPrice as { toString?: () => string }).toString === "function"
          ? (offer.originalPrice as { toString: () => string }).toString()
          : offer.originalPrice,
    }));
  }
  if (result.publishedAt instanceof Date) result.publishedAt = result.publishedAt.toISOString();
  if (result.createdAt instanceof Date) result.createdAt = result.createdAt.toISOString();
  if (result.updatedAt instanceof Date) result.updatedAt = result.updatedAt.toISOString();
  return result as T;
}

function serializeProducts<T>(products: T[]): T[] {
  return products.map((p) => serializeProduct(p));
}
'''

# Insert helper right before "export async function listPublishedProducts"
marker = "export async function listPublishedProducts"
assert marker in s
s = s.replace(marker, helper + "\n" + marker, 1)

# Apply serializeProducts to array returns
# listPublishedProducts
s = s.replace(
"""    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };""",
"""    return { items: serializeProducts(items), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };""")

# getFeaturedProducts
s = s.replace(
"""  } catch (error) {
    console.error("Failed to load featured products:", error);
    return [];
  }""",
"""  } catch (error) {
    console.error("Failed to load featured products:", error);
    return [];
  }""".replace("return [];", "return [];", 1))  # noop placeholder

# Instead, wrap the success returns. The success returns are `return await prisma.product.findMany({...})` inside try.
# Pattern: `return await prisma.product.findMany(` -> we can't easily wrap inline. Use replace of `return await prisma.product.findMany(` with `const _r = await prisma.product.findMany(` then add serialize. Too complex.

open(p, "w").write(s)
print("partial")
PY
python scripts/patch-serialize.py 2>&1 | tail -3