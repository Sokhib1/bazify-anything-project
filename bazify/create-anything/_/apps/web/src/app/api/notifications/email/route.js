// Email sending utility for customer booking confirmations

export async function POST(request) {
  try {
    const {
      to,
      customerName,
      productName,
      productPrice,
      storeName,
      storeAddress,
      googleMapsUrl,
      pickupTime,
      bookingCode,
      qrCodeUrl,
      productId,
    } = await request.json();

    if (!to || !customerName || !bookingCode) {
      return Response.json(
        { error: "Email manzil, mijoz ismi va bron kodi kerak" },
        { status: 400 },
      );
    }

    // Check if product has active promotion
    let promotion = null;
    if (productId) {
      try {
        const promoResponse = await fetch(
          `${process.env.APP_URL}/api/promotions?productId=${productId}`,
          { headers: { "Content-Type": "application/json" } },
        );

        if (promoResponse.ok) {
          promotion = await promoResponse.json();
        }
      } catch (error) {
        console.error("Error fetching promotion:", error);
      }
    }

    const emailHtml = generateBookingEmailTemplate({
      customerName,
      productName,
      productPrice,
      storeName,
      storeAddress,
      googleMapsUrl,
      pickupTime,
      bookingCode,
      qrCodeUrl,
      promotion,
    });

    // Send email using Resend
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return Response.json(
        { error: "Email xizmati sozlanmagan" },
        { status: 500 },
      );
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bazify <noreply@bozorchi.com>",
          to,
          subject: `Bron tasdiqlandi - ${bookingCode}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Resend API error:", errorData);
        return Response.json(
          {
            success: false,
            error: "Email yuborishda xatolik",
            details: errorData,
          },
          { status: response.status },
        );
      }

      const result = await response.json();
      console.log("✅ Email sent successfully via Resend:", result.id);

      return Response.json({
        success: true,
        message: "Email muvaffaqiyatli yuborildi",
        emailId: result.id,
      });
    } catch (fetchError) {
      console.error("Resend fetch error:", fetchError);
      return Response.json(
        { error: "Email yuborishda xatolik", details: fetchError.message },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Email sending error:", error);
    return Response.json(
      { error: "Email yuborishda xatolik", details: error.message },
      { status: 500 },
    );
  }
}

function generateBookingEmailTemplate({
  customerName,
  productName,
  productPrice,
  storeName,
  storeAddress,
  googleMapsUrl,
  pickupTime,
  bookingCode,
  qrCodeUrl,
  promotion,
}) {
  const formattedPrice = productPrice
    ? Number(productPrice).toLocaleString()
    : "N/A";

  let promotionBanner = "";
  if (promotion) {
    const discountText =
      promotion.discount_type === "percentage"
        ? `-${promotion.discount_value}%`
        : `-${Number(promotion.discount_value).toLocaleString()} so'm`;

    promotionBanner = `
          <!-- Promotion Banner -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 24px; color: #ffffff; font-weight: bold;">
                      🎉 AKSIYALI BRON! 🎉
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 28px; color: #FEF3C7; font-weight: bold;">
                      ${discountText}
                    </p>
                    ${
                      promotion.name
                        ? `
                    <p style="margin: 0; font-size: 14px; color: #FECACA;">
                      ${promotion.name}
                    </p>
                    `
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bron Tasdiqlandi</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🎉 Bron muvaffaqiyatli!
              </h1>
              <p style="margin: 10px 0 0 0; color: #DBEAFE; font-size: 16px;">
                Bazify
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Assalomu alaykum, <strong>${customerName}</strong>!
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Sizning bronlashingiz muvaffaqiyatli qabul qilindi. Quyida batafsil ma'lumot berilgan:
              </p>
            </td>
          </tr>

          ${promotionBanner}

          <!-- Booking Code -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #EFF6FF; border-radius: 12px; border: 2px dashed #3B82F6;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #1E40AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Bron Kodi
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 36px; color: #1E3A8A; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 4px;">
                      ${bookingCode}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Product Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F9FAFB; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px 0; font-size: 18px; color: #111827; font-weight: bold;">
                      📦 Mahsulot ma'lumotlari
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Mahsulot:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${productName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Narx:</td>
                        <td style="padding: 8px 0; font-size: 16px; color: #3B82F6; font-weight: bold; text-align: right;">${formattedPrice} so'm</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Olib ketish vaqti:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${pickupTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Store Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F9FAFB; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px 0; font-size: 18px; color: #111827; font-weight: bold;">
                      🏪 Do'kon ma'lumotlari
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 16px; color: #111827; font-weight: 600;">
                      ${storeName}
                    </p>
                    ${
                      storeAddress
                        ? `
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #6B7280; line-height: 1.5;">
                      📍 ${storeAddress}
                    </p>
                    `
                        : ""
                    }
                    ${
                      googleMapsUrl
                        ? `
                    <a href="${googleMapsUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 8px;">
                      🗺 Google Mapsda ochish
                    </a>
                    `
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code -->
          ${
            qrCodeUrl
              ? `
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; font-weight: 600;">
                QR Kod (Do'konda ko'rsating)
              </p>
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 250px; height: 250px; border-radius: 12px; border: 3px solid #E5E7EB;" />
            </td>
          </tr>
          `
              : ""
          }

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.6;">
                      <strong>⚠️ Eslatma:</strong><br/>
                      Mahsulotni olish uchun ushbu bron kodini yoki QR kodni do'kon xodimlariga ko'rsating. Bronlash tasdiqlangandan so'ng sizga xabar beriladi.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #111827; font-weight: 600;">
                Rahmat, xaridingiz uchun! 🙏
              </p>
              <p style="margin: 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
                Agar savollaringiz bo'lsa, to'g'ridan-to'g'ri do'kon bilan bog'laning.
              </p>
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #9CA3AF;">
                © 2024 Bazify. Barcha huquqlar himoyalangan.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
