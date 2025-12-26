import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("storeId");
    const productId = url.searchParams.get("productId");

    if (productId) {
      // Get active promotion for a specific product
      const now = new Date().toISOString();
      const promotions = await sql`
        SELECT * FROM promotions
        WHERE store_id IN (
          SELECT store_id FROM products WHERE id = ${productId}
        )
        AND is_active = true
        AND start_date <= ${now}
        AND end_date >= ${now}
        AND (
          apply_to = 'all'
          OR ${productId}::INTEGER = ANY(product_ids)
        )
        ORDER BY created_at DESC
        LIMIT 1
      `;

      return Response.json(promotions[0] || null);
    } else if (storeId) {
      // Get all promotions for a store
      const promotions = await sql`
        SELECT * FROM promotions
        WHERE store_id = ${storeId}
        ORDER BY created_at DESC
      `;

      return Response.json(promotions);
    } else {
      return Response.json({ error: "Store ID kerak" }, { status: 400 });
    }
  } catch (error) {
    console.error("Get promotions error:", error);
    return Response.json(
      { error: "Aksiyalarni olishda xatolik" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const {
      storeId,
      name,
      description,
      discountType,
      discountValue,
      applyTo,
      productIds,
      startDate,
      endDate,
    } = await request.json();

    if (
      !storeId ||
      !name ||
      !discountType ||
      !discountValue ||
      !applyTo ||
      !startDate ||
      !endDate
    ) {
      return Response.json(
        { error: "Majburiy maydonlarni to'ldiring" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO promotions (
        store_id, name, description, discount_type, discount_value,
        apply_to, product_ids, start_date, end_date
      )
      VALUES (
        ${storeId}, ${name}, ${description || ""}, ${discountType}, ${discountValue},
        ${applyTo}, ${applyTo === "selected" && productIds ? productIds : null}, ${startDate}, ${endDate}
      )
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Create promotion error:", error);
    return Response.json(
      { error: "Aksiya qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const {
      id,
      name,
      description,
      discountType,
      discountValue,
      applyTo,
      productIds,
      startDate,
      endDate,
      isActive,
    } = await request.json();

    if (!id) {
      return Response.json({ error: "Aksiya ID kerak" }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (discountType !== undefined) {
      updates.push(`discount_type = $${paramCount}`);
      values.push(discountType);
      paramCount++;
    }
    if (discountValue !== undefined) {
      updates.push(`discount_value = $${paramCount}`);
      values.push(discountValue);
      paramCount++;
    }
    if (applyTo !== undefined) {
      updates.push(`apply_to = $${paramCount}`);
      values.push(applyTo);
      paramCount++;
    }
    if (productIds !== undefined) {
      updates.push(`product_ids = $${paramCount}`);
      values.push(productIds);
      paramCount++;
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      values.push(startDate);
      paramCount++;
    }
    if (endDate !== undefined) {
      updates.push(`end_date = $${paramCount}`);
      values.push(endDate);
      paramCount++;
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(isActive);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json(
        { error: "Yangilanish uchun ma'lumot yo'q" },
        { status: 400 },
      );
    }

    values.push(id);
    const result = await sql(
      `UPDATE promotions SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json({ error: "Aksiya topilmadi" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Update promotion error:", error);
    return Response.json(
      { error: "Aksiyani yangilashda xatolik" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Aksiya ID kerak" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM promotions WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Aksiya topilmadi" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete promotion error:", error);
    return Response.json(
      { error: "Aksiyani o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
