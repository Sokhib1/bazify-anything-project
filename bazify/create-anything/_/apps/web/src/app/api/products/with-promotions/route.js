import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("storeId");
    const category = url.searchParams.get("category");
    const now = new Date().toISOString();

    let query;
    if (storeId) {
      query = sql`
        SELECT 
          p.*,
          s.name as store_name,
          pr.id as promotion_id,
          pr.name as promotion_name,
          pr.discount_type,
          pr.discount_value,
          CASE 
            WHEN pr.discount_type = 'percentage' THEN p.price * (1 - pr.discount_value / 100)
            WHEN pr.discount_type = 'fixed' THEN p.price - pr.discount_value
            ELSE p.price
          END as discounted_price
        FROM products p
        JOIN stores s ON p.store_id = s.id
        LEFT JOIN promotions pr ON (
          pr.store_id = p.store_id
          AND pr.is_active = true
          AND pr.start_date <= ${now}
          AND pr.end_date >= ${now}
          AND (pr.apply_to = 'all' OR p.id = ANY(pr.product_ids))
        )
        WHERE p.store_id = ${storeId}
        ORDER BY p.created_at DESC
      `;
    } else if (category) {
      query = sql`
        SELECT 
          p.*,
          s.name as store_name,
          pr.id as promotion_id,
          pr.name as promotion_name,
          pr.discount_type,
          pr.discount_value,
          CASE 
            WHEN pr.discount_type = 'percentage' THEN p.price * (1 - pr.discount_value / 100)
            WHEN pr.discount_type = 'fixed' THEN p.price - pr.discount_value
            ELSE p.price
          END as discounted_price
        FROM products p
        JOIN stores s ON p.store_id = s.id
        LEFT JOIN promotions pr ON (
          pr.store_id = p.store_id
          AND pr.is_active = true
          AND pr.start_date <= ${now}
          AND pr.end_date >= ${now}
          AND (pr.apply_to = 'all' OR p.id = ANY(pr.product_ids))
        )
        WHERE s.approved = true AND p.category = ${category}
        ORDER BY 
          CASE WHEN pr.id IS NOT NULL THEN 0 ELSE 1 END,
          s.name,
          p.created_at DESC
      `;
    } else {
      query = sql`
        SELECT 
          p.*,
          s.name as store_name,
          pr.id as promotion_id,
          pr.name as promotion_name,
          pr.discount_type,
          pr.discount_value,
          CASE 
            WHEN pr.discount_type = 'percentage' THEN p.price * (1 - pr.discount_value / 100)
            WHEN pr.discount_type = 'fixed' THEN p.price - pr.discount_value
            ELSE p.price
          END as discounted_price
        FROM products p
        JOIN stores s ON p.store_id = s.id
        LEFT JOIN promotions pr ON (
          pr.store_id = p.store_id
          AND pr.is_active = true
          AND pr.start_date <= ${now}
          AND pr.end_date >= ${now}
          AND (pr.apply_to = 'all' OR p.id = ANY(pr.product_ids))
        )
        WHERE s.approved = true
        ORDER BY 
          CASE WHEN pr.id IS NOT NULL THEN 0 ELSE 1 END,
          s.name,
          p.created_at DESC
      `;
    }

    const products = await query;
    return Response.json(products);
  } catch (error) {
    console.error("Get products with promotions error:", error);
    return Response.json(
      { error: "Mahsulotlarni olishda xatolik" },
      { status: 500 },
    );
  }
}
