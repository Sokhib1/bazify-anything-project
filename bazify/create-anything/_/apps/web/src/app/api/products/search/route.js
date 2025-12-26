import sql from "@/app/api/utils/sql.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return Response.json({ products: [] });
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const products = await sql`
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
        AND (
          LOWER(p.name) LIKE ${searchTerm}
          OR LOWER(p.description) LIKE ${searchTerm}
        )
      ORDER BY 
        CASE 
          WHEN LOWER(p.name) LIKE ${searchTerm} THEN 1
          ELSE 2
        END,
        p.name ASC
      LIMIT 50
    `;

    return Response.json({ products });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      { error: "Qidiruvda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
