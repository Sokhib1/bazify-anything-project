import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function POST(request) {
  try {
    const { email, password, isAdmin } = await request.json();

    // Admin login
    if (isAdmin) {
      if (email === "admin" && password === "123456") {
        return Response.json({
          success: true,
          user: {
            id: 0,
            email: "admin",
            role: "admin",
          },
        });
      } else {
        return Response.json(
          { error: "Noto'g'ri login yoki parol" },
          { status: 401 },
        );
      }
    }

    // Store login
    const stores = await sql`
      SELECT id, name, email, password_hash, approved
      FROM stores
      WHERE email = ${email}
    `;

    if (stores.length === 0) {
      return Response.json({ error: "Do'kon topilmadi" }, { status: 404 });
    }

    const store = stores[0];

    // Verify password
    const validPassword = await argon2.verify(store.password_hash, password);
    if (!validPassword) {
      return Response.json({ error: "Noto'g'ri parol" }, { status: 401 });
    }

    // Check if approved
    if (!store.approved) {
      return Response.json(
        {
          error:
            "Sizning do'koningiz hali tasdiqlanmagan. Admin tasdiqlashini kuting.",
        },
        { status: 403 },
      );
    }

    return Response.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Tizimga kirishda xatolik" },
      { status: 500 },
    );
  }
}
