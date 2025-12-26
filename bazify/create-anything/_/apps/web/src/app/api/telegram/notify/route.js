export async function POST(request) {
  try {
    const {
      chatId,
      customerName,
      customerPhone,
      productName,
      productPrice,
      pickupTime,
      storeName,
      storeAddress,
      googleMapsUrl,
      code,
      productId,
    } = await request.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.warn("TELEGRAM_BOT_TOKEN not configured");
      return Response.json({
        success: false,
        message: "Telegram bot token not configured",
      });
    }

    if (!chatId) {
      console.warn("Chat ID not provided");
      return Response.json({ success: false, message: "Chat ID not provided" });
    }

    // Check if product has active promotion
    let promotionText = "";
    if (productId) {
      try {
        const promoResponse = await fetch(
          `${process.env.APP_URL}/api/promotions?productId=${productId}`,
          { headers: { "Content-Type": "application/json" } },
        );

        if (promoResponse.ok) {
          const promotion = await promoResponse.json();
          if (promotion) {
            promotionText = "\n\n🎉 AKSIYALI BRON! 🎉";
            if (promotion.discount_type === "percentage") {
              promotionText += `\n💰 Chegirma: -${promotion.discount_value}%`;
            } else {
              promotionText += `\n💰 Chegirma: -${Number(promotion.discount_value).toLocaleString()} so'm`;
            }
            if (promotion.name) {
              promotionText += `\n📌 ${promotion.name}`;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching promotion:", error);
      }
    }

    const formattedPrice = productPrice
      ? Number(productPrice).toLocaleString()
      : "N/A";

    const message = `🔔 Yangi bron!${promotionText}

👤 Mijoz: ${customerName}
📱 Telefon: ${customerPhone}
📦 Mahsulot: ${productName}
💰 Narx: ${formattedPrice} so'm
⏰ Olib ketish vaqti: ${pickupTime}

🏪 Do'kon: ${storeName}
📍 Manzil: ${storeAddress}

${googleMapsUrl ? `🗺 Google Maps: ${googleMapsUrl}` : ""}

🔢 Bron kodi: ${code}

✅ Dashboard'da tasdiqlang: ${process.env.APP_URL}/store/dashboard`;

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
      return Response.json({ success: false, error: errorData });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Telegram notify error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
