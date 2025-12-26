import sql from "@/app/api/utils/sql";

// Generate random 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send Telegram notification directly
async function sendTelegramNotification({
  chatId,
  customerName,
  customerPhone,
  productId,
  productName,
  productPrice,
  pickupTime,
  storeName,
  storeAddress,
  googleMapsUrl,
  code,
  isReturningCustomer,
  totalBookings,
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN not configured");
    return { success: false, error: "Telegram bot token not configured" };
  }

  if (!chatId) {
    console.warn("Chat ID not provided for store:", storeName);
    return { success: false, error: "Chat ID not provided" };
  }

  try {
    const formattedPrice = productPrice
      ? Number(productPrice).toLocaleString()
      : "N/A";

    const message = `🔔 Yangi bron!

👤 Mijoz: ${customerName}
📱 Telefon: ${customerPhone}
📦 Mahsulot: ${productName}
💰 Narx: ${formattedPrice} so'm
⏰ Olib ketish vaqti: ${pickupTime}

🏪 Do'kon: ${storeName}
📍 Manzil: ${storeAddress}

${googleMapsUrl ? `🗺 Google Maps: ${googleMapsUrl}` : ""}

🔢 Bron kodi: ${code}

✅ Dashboard'da tasdiqlang`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
      return { success: false, error: JSON.stringify(errorData) };
    }

    return { success: true };
  } catch (error) {
    console.error("Telegram notification error:", error);
    return { success: false, error: error.message };
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("storeId");
    const code = url.searchParams.get("code");

    if (code) {
      // Get reservation by code
      const reservations = await sql`
        SELECT r.*, p.name as product_name, p.price, s.name as store_name
        FROM reservations r
        JOIN products p ON r.product_id = p.id
        JOIN stores s ON r.store_id = s.id
        WHERE r.code = ${code}
      `;

      if (reservations.length === 0) {
        return Response.json({ error: "Bron topilmadi" }, { status: 404 });
      }

      return Response.json(reservations[0]);
    } else if (storeId) {
      // Get reservations for a specific store
      const reservations = await sql`
        SELECT r.*, p.name as product_name, p.price
        FROM reservations r
        JOIN products p ON r.product_id = p.id
        WHERE r.store_id = ${storeId}
        ORDER BY r.created_at DESC
      `;

      return Response.json(reservations);
    } else {
      // Get all reservations
      const reservations = await sql`
        SELECT r.*, p.name as product_name, s.name as store_name
        FROM reservations r
        JOIN products p ON r.product_id = p.id
        JOIN stores s ON r.store_id = s.id
        ORDER BY r.created_at DESC
      `;

      return Response.json(reservations);
    }
  } catch (error) {
    console.error("Get reservations error:", error);
    return Response.json(
      { error: "Bronlarni olishda xatolik" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const {
      productId,
      storeId,
      customerName,
      customerPhone,
      customerEmail,
      pickupTime,
    } = await request.json();

    if (
      !productId ||
      !storeId ||
      !customerName ||
      !customerPhone ||
      !pickupTime
    ) {
      return Response.json(
        { error: "Barcha majburiy maydonlarni to'ldiring" },
        { status: 400 },
      );
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing =
        await sql`SELECT id FROM reservations WHERE code = ${code}`;
      if (existing.length === 0) break;
      code = generateCode();
      attempts++;
    }

    // Check for returning customer - count previous bookings from this store
    const previousBookings = await sql`
      SELECT COUNT(*) as booking_count
      FROM reservations
      WHERE customer_phone = ${customerPhone}
        AND store_id = ${storeId}
    `;

    const bookingCount = parseInt(previousBookings[0].booking_count) || 0;
    const isReturningCustomer = bookingCount > 0;
    const totalBookings = bookingCount + 1; // Including current booking

    // Get product and store details
    const [productResult, storeResult] = await sql.transaction([
      sql`SELECT name, price FROM products WHERE id = ${productId}`,
      sql`SELECT name, address, google_maps_url, telegram_chat_id, customer_email_enabled, customer_sms_enabled FROM stores WHERE id = ${storeId}`,
    ]);

    if (productResult.length === 0) {
      return Response.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    }

    if (storeResult.length === 0) {
      return Response.json({ error: "Do'kon topilmadi" }, { status: 404 });
    }

    const product = productResult[0];
    const store = storeResult[0];

    // Track Telegram notification status
    let telegramSent = false;
    let telegramError = null;

    // Send Telegram notification to the specific store's chat ID
    if (store.telegram_chat_id) {
      const telegramResult = await sendTelegramNotification({
        chatId: store.telegram_chat_id,
        customerName,
        customerPhone,
        productId,
        productName: product.name,
        productPrice: product.price,
        pickupTime,
        storeName: store.name,
        storeAddress: store.address,
        googleMapsUrl: store.google_maps_url,
        code,
        isReturningCustomer,
        totalBookings,
      });

      if (telegramResult.success) {
        telegramSent = true;
      } else {
        telegramError = telegramResult.error;
      }
    } else {
      console.warn("Store has no telegram_chat_id configured:", store.name);
      telegramError = "Telegram chat ID not configured";
    }

    // Generate QR code URL for customer
    const qrData = `Bron kodi: ${code}\nMahsulot: ${product.name}\nDo'kon: ${store.name}\nManzil: ${store.address}\nMijoz: ${customerName}\nTelefon: ${customerPhone}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

    // Track customer confirmation status
    let emailSent = false;
    let smsSent = false;

    // Send email confirmation if enabled and email provided
    if (store.customer_email_enabled && customerEmail) {
      try {
        const emailResponse = await fetch(
          `${process.env.APP_URL}/api/notifications/email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: customerEmail,
              customerName,
              productId,
              productName: product.name,
              productPrice: product.price,
              storeName: store.name,
              storeAddress: store.address,
              googleMapsUrl: store.google_maps_url,
              pickupTime,
              bookingCode: code,
              qrCodeUrl,
            }),
          },
        );

        if (emailResponse.ok) {
          emailSent = true;
          console.log("✅ Email sent to customer:", customerEmail);
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    // Send SMS confirmation if enabled
    if (store.customer_sms_enabled && customerPhone) {
      try {
        const smsResponse = await fetch(
          `${process.env.APP_URL}/api/notifications/sms`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: customerPhone,
              customerName,
              productId,
              productName: product.name,
              storeName: store.name,
              bookingCode: code,
            }),
          },
        );

        if (smsResponse.ok) {
          smsSent = true;
          console.log("✅ SMS sent to customer:", customerPhone);
        }
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
      }
    }

    // Create reservation with all notification statuses
    const reservation = await sql`
      INSERT INTO reservations (
        product_id,
        store_id,
        customer_name,
        customer_phone,
        customer_email,
        pickup_time,
        code,
        status,
        telegram_notification_sent,
        telegram_notification_error,
        email_sent,
        sms_sent
      ) VALUES (
        ${productId},
        ${storeId},
        ${customerName},
        ${customerPhone},
        ${customerEmail || null},
        ${pickupTime},
        ${code},
        'Kutilmoqda',
        ${telegramSent},
        ${telegramError},
        ${emailSent},
        ${smsSent}
      )
      RETURNING *
    `;

    return Response.json({
      ...reservation[0],
      product_name: product.name,
      store_name: store.name,
      store_address: store.address,
    });
  } catch (error) {
    console.error("Create reservation error:", error);
    return Response.json({ error: "Bron qilishda xatolik" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return Response.json({ error: "ID va status kerak" }, { status: 400 });
    }

    const validStatuses = ["Kutilmoqda", "Tasdiqlangan", "Bekor qilingan"];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: "Noto'g'ri status" }, { status: 400 });
    }

    const result = await sql`
      UPDATE reservations
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Bron topilmadi" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Update reservation error:", error);
    return Response.json(
      { error: "Bronni yangilashda xatolik" },
      { status: 500 },
    );
  }
}
