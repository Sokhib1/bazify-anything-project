import sql from "@/app/api/utils/sql.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return Response.json({ error: "Mahsulot ID kerak" }, { status: 400 });
    }

    // Get the original product
    const [originalProduct] = await sql`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.store_id
      FROM products p
      WHERE p.id = ${productId}
    `;

    if (!originalProduct) {
      return Response.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    }

    // Find similar products from other stores (same or similar name)
    const productNameWords = originalProduct.name
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2);

    let similarProducts = [];

    if (productNameWords.length > 0) {
      // Build dynamic query for similar products
      const conditions = productNameWords
        .map(() => `LOWER(p.name) LIKE ?`)
        .join(" OR ");
      const searchTerms = productNameWords.map((word) => `%${word}%`);

      // Use function form of sql for dynamic query
      const queryText = `
        SELECT 
          p.id,
          p.name,
          p.price,
          p.description,
          p.image_url,
          p.stock,
          p.store_id,
          s.name as store_name,
          s.address as store_address,
          s.google_maps_url as store_google_maps_url
        FROM products p
        JOIN stores s ON p.store_id = s.id
        WHERE s.approved = true
          AND p.id != $1
          AND (${productNameWords.map((_, i) => `LOWER(p.name) LIKE $${i + 2}`).join(" OR ")})
        ORDER BY p.price ASC
        LIMIT 20
      `;

      similarProducts = await sql(queryText, [
        productId,
        ...productNameWords.map((word) => `%${word}%`),
      ]);
    }

    // Separate exact matches from similar products
    const exactMatches = similarProducts.filter(
      (p) => p.name.toLowerCase() === originalProduct.name.toLowerCase(),
    );
    const otherSimilar = similarProducts.filter(
      (p) => p.name.toLowerCase() !== originalProduct.name.toLowerCase(),
    );

    // Find the lowest price
    let lowestPrice = originalProduct.price;
    if (exactMatches.length > 0) {
      const prices = exactMatches.map((p) => parseFloat(p.price));
      lowestPrice = Math.min(lowestPrice, ...prices);
    }

    return Response.json({
      originalProduct,
      exactMatches,
      similarProducts: otherSimilar,
      lowestPrice: lowestPrice.toString(),
    });
  } catch (error) {
    console.error("Compare error:", error);
    return Response.json(
      { error: "Taqqoslashda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
