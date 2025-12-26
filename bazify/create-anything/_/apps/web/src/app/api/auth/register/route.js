import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function POST(request) {
  try {
    const {
      name,
      ownerName,
      phone,
      email,
      password,
      address,
      googleMapsUrl,
      telegramChatId,
    } = await request.json();

    // Validate inputs
    if (!name || !ownerName || !phone || !email || !password) {
      return Response.json(
        { error: "Barcha maydonlarni to'ldiring" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingStore = await sql`
      SELECT id FROM stores WHERE email = ${email}
    `;

    if (existingStore.length > 0) {
      return Response.json(
        { error: "Bu email allaqachon ro'yxatdan o'tgan" },
        { status: 400 },
      );
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create store
    const result = await sql`
      INSERT INTO stores (
        name,
        owner_name,
        phone,
        email,
        password_hash,
        address,
        google_maps_url,
        telegram_chat_id
      )
      VALUES (
        ${name},
        ${ownerName},
        ${phone},
        ${email},
        ${passwordHash},
        ${address || null},
        ${googleMapsUrl || null},
        ${telegramChatId || null}
      )
      RETURNING id, name, email, approved
    `;

    return Response.json({
      success: true,
      store: result[0],
      message: "Ro'yxatdan o'tdingiz! Admin tasdiqlashini kuting.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { error: "Ro'yxatdan o'tishda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
