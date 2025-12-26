export async function POST(request) {
  try {
    const { chatId } = await request.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return Response.json({
        success: false,
        message:
          "Telegram bot token sozlanmagan. .env faylida TELEGRAM_BOT_TOKEN ni kiriting.",
      });
    }

    if (!chatId) {
      return Response.json({
        success: false,
        message: "Chat ID kiritilmagan",
      });
    }

    const testMessage = `✅ Test xabar!

Bu Telegram botingiz to'g'ri sozlanganligini tekshirish uchun test xabaridir.

🤖 Bot Token: Sozlangan
💬 Chat ID: ${chatId}
⏰ Vaqt: ${new Date().toLocaleString("uz-UZ")}

Agar siz bu xabarni ko'ryapsiz, demak bot to'g'ri ishlayapti! 🎉`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: "HTML",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      let errorMessage = "Xabar yuborishda xatolik";

      if (data.description) {
        if (data.description.includes("chat not found")) {
          errorMessage =
            "Chat topilmadi. Chat ID to'g'ri ekanligini tekshiring.";
        } else if (data.description.includes("bot was blocked")) {
          errorMessage =
            "Bot bloklangan. Botni /start buyrug'i bilan qayta faollashtiring.";
        } else if (data.description.includes("Unauthorized")) {
          errorMessage = "Bot token noto'g'ri. Tokenni tekshiring.";
        } else {
          errorMessage = data.description;
        }
      }

      return Response.json({
        success: false,
        message: errorMessage,
        details: data,
      });
    }

    return Response.json({
      success: true,
      message: "Test xabar muvaffaqiyatli yuborildi! Telegram'dan tekshiring.",
    });
  } catch (error) {
    console.error("Telegram test error:", error);
    return Response.json(
      {
        success: false,
        message: "Xatolik: " + error.message,
      },
      { status: 500 },
    );
  }
}
