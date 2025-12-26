// SMS sending utility for customer booking confirmations

export async function POST(request) {
  try {
    const { to, customerName, productName, storeName, bookingCode } =
      await request.json();

    if (!to || !bookingCode) {
      return Response.json(
        { error: "Telefon raqam va bron kodi kerak" },
        { status: 400 },
      );
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = to.replace(/[^0-9+]/g, "");

    // Generate SMS message
    const smsMessage = generateBookingSMS({
      customerName,
      productName,
      storeName,
      bookingCode,
    });

    // TODO: Integrate with SMS gateway
    // Popular options in Uzbekistan:
    // - Playmobile SMS API: https://playmobile.uz/
    // - UCELL SMS API
    // - Beeline SMS API
    // - MyTaxi SMS (if available)

    // Example with a generic SMS API:
    /*
    const response = await fetch('https://api.smsgateway.uz/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: cleanPhone,
        message: smsMessage,
        sender: 'TexnikaBozori'
      })
    });
    
    if (!response.ok) {
      throw new Error('SMS yuborishda xatolik');
    }
    */

    console.log("📱 SMS would be sent to:", cleanPhone);
    console.log("Message:", smsMessage);

    // Simulate successful send
    return Response.json({
      success: true,
      message: "SMS yuborildi (demo rejim)",
      preview: smsMessage,
      phone: cleanPhone,
    });
  } catch (error) {
    console.error("SMS sending error:", error);
    return Response.json(
      { error: "SMS yuborishda xatolik", details: error.message },
      { status: 500 },
    );
  }
}

function generateBookingSMS({
  customerName,
  productName,
  storeName,
  bookingCode,
}) {
  // Keep SMS short and concise (160 characters recommended for single SMS)
  return `Texnika Bozori: Bronlash muvaffaqiyatli!
Mahsulot: ${productName}
Do'kon: ${storeName}
Kod: ${bookingCode}
Rahmat!`;
}
