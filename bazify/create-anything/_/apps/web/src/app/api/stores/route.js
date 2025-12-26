import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("storeId");

    if (storeId) {
      // Get single store
      const stores = await sql`
        SELECT id, name, owner_name, phone, email, address, google_maps_url, latitude, longitude, telegram_chat_id, customer_email_enabled, customer_sms_enabled, business_hours, approved
        FROM stores
        WHERE id = ${storeId}
      `;

      if (stores.length === 0) {
        return Response.json({ error: "Do'kon topilmadi" }, { status: 404 });
      }

      return Response.json(stores[0]);
    } else {
      // Get all approved stores with coordinates and business hours
      const stores = await sql`
        SELECT id, name, owner_name, phone, email, address, google_maps_url, latitude, longitude, telegram_chat_id, customer_email_enabled, customer_sms_enabled, business_hours
        FROM stores
        WHERE approved = true
        ORDER BY created_at DESC
      `;

      return Response.json(stores);
    }
  } catch (error) {
    console.error("Get stores error:", error);
    return Response.json(
      { error: "Do'konlarni olishda xatolik" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const {
      id,
      address,
      googleMapsUrl,
      latitude,
      longitude,
      telegram_chat_id,
      customer_email_enabled,
      customer_sms_enabled,
      business_hours,
    } = await request.json();

    if (!id) {
      return Response.json({ error: "ID kerak" }, { status: 400 });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (address !== undefined) {
      updates.push(`address = $${paramCount}`);
      values.push(address);
      paramCount++;
    }

    if (googleMapsUrl !== undefined) {
      updates.push(`google_maps_url = $${paramCount}`);
      values.push(googleMapsUrl);
      paramCount++;
    }

    if (latitude !== undefined) {
      updates.push(`latitude = $${paramCount}`);
      values.push(latitude);
      paramCount++;
    }

    if (longitude !== undefined) {
      updates.push(`longitude = $${paramCount}`);
      values.push(longitude);
      paramCount++;
    }

    if (telegram_chat_id !== undefined) {
      updates.push(`telegram_chat_id = $${paramCount}`);
      values.push(telegram_chat_id);
      paramCount++;
    }

    if (customer_email_enabled !== undefined) {
      updates.push(`customer_email_enabled = $${paramCount}`);
      values.push(customer_email_enabled);
      paramCount++;
    }

    if (customer_sms_enabled !== undefined) {
      updates.push(`customer_sms_enabled = $${paramCount}`);
      values.push(customer_sms_enabled);
      paramCount++;
    }

    if (business_hours !== undefined) {
      updates.push(`business_hours = $${paramCount}`);
      values.push(JSON.stringify(business_hours));
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json(
        { error: "Yangilanishi kerak bo'lgan ma'lumot yo'q" },
        { status: 400 },
      );
    }

    values.push(id);
    const query = `
      UPDATE stores
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, name, owner_name, phone, email, address, google_maps_url, latitude, longitude, telegram_chat_id, customer_email_enabled, customer_sms_enabled, business_hours, approved, created_at
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Do'kon topilmadi" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Update store error:", error);
    return Response.json(
      { error: "Do'konni yangilashda xatolik" },
      { status: 500 },
    );
  }
}
