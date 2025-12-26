import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function GET(request) {
  try {
    const stores = await sql`
      SELECT id, name, owner_name, phone, email, address, approved, created_at
      FROM stores
      ORDER BY created_at DESC
    `;

    return Response.json(stores);
  } catch (error) {
    console.error("Get all stores error:", error);
    return Response.json(
      { error: "Do'konlarni olishda xatolik" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { name, address, ownerName, phone, email } = await request.json();

    if (!name || !address) {
      return Response.json(
        { error: "Do'kon nomi va manzil majburiy" },
        { status: 400 },
      );
    }

    // Generate a default password or make it optional
    const defaultPassword = "changeme123";
    const passwordHash = await argon2.hash(defaultPassword);

    const result = await sql`
      INSERT INTO stores (name, address, owner_name, phone, email, password_hash, approved)
      VALUES (
        ${name},
        ${address},
        ${ownerName || "Admin"},
        ${phone || ""},
        ${email || `store${Date.now()}@temp.com`},
        ${passwordHash},
        true
      )
      RETURNING id, name, address, owner_name, phone, email, approved
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Create store error:", error);
    return Response.json(
      { error: "Do'kon qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const { storeId, name, address } = await request.json();

    if (!storeId) {
      return Response.json({ error: "Do'kon ID kerak" }, { status: 400 });
    }

    const result = await sql`
      UPDATE stores
      SET 
        name = COALESCE(${name}, name),
        address = COALESCE(${address}, address)
      WHERE id = ${storeId}
      RETURNING id, name, address, owner_name, phone, email, approved
    `;

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

export async function PUT(request) {
  try {
    const { storeId, approved } = await request.json();

    if (!storeId || approved === undefined) {
      return Response.json(
        { error: "Do'kon ID va tasdiqlash holati kerak" },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE stores
      SET approved = ${approved}
      WHERE id = ${storeId}
      RETURNING id, name, approved
    `;

    if (result.length === 0) {
      return Response.json({ error: "Do'kon topilmadi" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Update store approval error:", error);
    return Response.json(
      { error: "Do'konni tasdiqlashda xatolik" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { storeId } = await request.json();

    if (!storeId) {
      return Response.json({ error: "Do'kon ID kerak" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM stores
      WHERE id = ${storeId}
      RETURNING id, name
    `;

    if (result.length === 0) {
      return Response.json({ error: "Do'kon topilmadi" }, { status: 404 });
    }

    return Response.json({ success: true, store: result[0] });
  } catch (error) {
    console.error("Delete store error:", error);
    return Response.json(
      { error: "Do'konni o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
