import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("storeId");

    if (!storeId) {
      return Response.json({ error: "Do'kon ID kerak" }, { status: 400 });
    }

    // Get total reservations
    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM reservations
      WHERE store_id = ${storeId}
    `;

    // Get this week's reservations
    const weekResult = await sql`
      SELECT COUNT(*) as week_total
      FROM reservations
      WHERE store_id = ${storeId}
        AND created_at >= NOW() - INTERVAL '7 days'
    `;

    // Get customer loyalty (phone numbers with reservation count)
    const loyaltyResult = await sql`
      SELECT customer_phone, customer_name, COUNT(*) as reservation_count
      FROM reservations
      WHERE store_id = ${storeId}
      GROUP BY customer_phone, customer_name
      ORDER BY reservation_count DESC
      LIMIT 20
    `;

    return Response.json({
      totalReservations: parseInt(totalResult[0].total),
      weekReservations: parseInt(weekResult[0].week_total),
      loyalCustomers: loyaltyResult,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return Response.json(
      { error: "Analitikani olishda xatolik" },
      { status: 500 },
    );
  }
}
