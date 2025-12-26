import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("storeId");
    const productId = url.searchParams.get("productId");

    if (productId) {
      // Get single product
      const products = await sql`
        SELECT p.*, s.name as store_name
        FROM products p
        JOIN stores s ON p.store_id = s.id
        WHERE p.id = ${productId}
      `;

      if (products.length === 0) {
        return Response.json({ error: "Mahsulot topilmadi" }, { status: 404 });
      }

      return Response.json(products[0]);
    } else if (storeId) {
      // Get products for a specific store
      const products = await sql`
        SELECT * FROM products
        WHERE store_id = ${storeId}
        ORDER BY created_at DESC
      `;

      return Response.json(products);
    } else {
      // Get all products with store names
      const products = await sql`
        SELECT p.*, s.name as store_name
        FROM products p
        JOIN stores s ON p.store_id = s.id
        WHERE s.approved = true
        ORDER BY s.name, p.created_at DESC
      `;

      return Response.json(products);
    }
  } catch (error) {
    console.error("Get products error:", error);
    return Response.json(
      { error: "Mahsulotlarni olishda xatolik" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { storeId, name, price, description, imageUrl, stock, category } =
      await request.json();

    if (!storeId || !name || !price) {
      return Response.json(
        { error: "Majburiy maydonlarni to'ldiring" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO products (store_id, name, price, description, image_url, stock, category)
      VALUES (${storeId}, ${name}, ${price}, ${description || ""}, ${imageUrl || ""}, ${stock || 0}, ${category || ""})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Create product error:", error);
    return Response.json(
      { error: "Mahsulot qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { id, name, price, description, imageUrl, stock, category } =
      await request.json();

    if (!id) {
      return Response.json({ error: "Mahsulot ID kerak" }, { status: 400 });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount}`);
      values.push(imageUrl);
      paramCount++;
    }
    if (stock !== undefined) {
      updates.push(`stock = $${paramCount}`);
      values.push(stock);
      paramCount++;
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
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
      `UPDATE products SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Update product error:", error);
    return Response.json(
      { error: "Mahsulotni yangilashda xatolik" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Mahsulot ID kerak" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return Response.json(
      { error: "Mahsulotni o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
