"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Settings as SettingsIcon,
  MapPin,
  ExternalLink,
  Mail,
  MessageSquare,
  Clock,
} from "lucide-react";
import useUser from "@/utils/useUser";
import {
  DAYS_UZ,
  DAYS_ORDER,
  getDefaultBusinessHours,
} from "@/utils/businessHours";

export default function StoreSettings() {
  const { user, loading: userLoading } = useUser();
  const [store, setStore] = useState(null);
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [customerEmailEnabled, setCustomerEmailEnabled] = useState(true);
  const [customerSmsEnabled, setCustomerSmsEnabled] = useState(false);
  const [businessHours, setBusinessHours] = useState(getDefaultBusinessHours());
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [testMessage, setTestMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storeData = localStorage.getItem("store");
      if (!storeData) {
        window.location.href = "/store/login";
        return;
      }
      setStore(JSON.parse(storeData));
    }
  }, []);

  useEffect(() => {
    if (store?.id) {
      loadStoreSettings();
    }
  }, [store]);

  async function loadStoreSettings() {
    try {
      const response = await fetch(`/api/stores?storeId=${store.id}`);
      if (response.ok) {
        const data = await response.json();
        setAddress(data.address || "");
        setGoogleMapsUrl(data.google_maps_url || "");
        setLatitude(data.latitude || "");
        setLongitude(data.longitude || "");
        setTelegramChatId(data.telegram_chat_id || "");
        setCustomerEmailEnabled(data.customer_email_enabled !== false);
        setCustomerSmsEnabled(data.customer_sms_enabled === true);
        setBusinessHours(data.business_hours || getDefaultBusinessHours());
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: store.id,
          address: address || null,
          googleMapsUrl: googleMapsUrl || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          telegram_chat_id: telegramChatId || null,
          customer_email_enabled: customerEmailEnabled,
          customer_sms_enabled: customerSmsEnabled,
          business_hours: businessHours,
        }),
      });

      if (response.ok) {
        setSaveMessage({ type: "success", text: "Sozlamalar saqlandi!" });
      } else {
        const data = await response.json();
        setSaveMessage({
          type: "error",
          text: data.error || "Xatolik yuz berdi",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage({ type: "error", text: "Xatolik yuz berdi" });
    } finally {
      setSaving(false);
    }
  }

  const updateDayHours = (day, field, value) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  function handleTestLink() {
    if (!googleMapsUrl.trim()) {
      setTestMessage({
        type: "error",
        text: "Google Maps havolasini kiriting",
      });
      return;
    }
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    setTestMessage({ type: "success", text: "Havola yangi tabda ochildi" });
    setTimeout(() => setTestMessage(null), 3000);
  }

  async function handleTestTelegram() {
    if (!telegramChatId.trim()) {
      setTestMessage({ type: "error", text: "Chat ID ni kiriting" });
      return;
    }

    setTesting(true);
    setTestMessage(null);

    try {
      const response = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: telegramChatId }),
      });

      const data = await response.json();

      if (data.success) {
        setTestMessage({ type: "success", text: data.message });
      } else {
        setTestMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Test error:", error);
      setTestMessage({ type: "error", text: "Xatolik yuz berdi" });
    } finally {
      setTesting(false);
    }
  }

  if (userLoading || !store) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = "/store/dashboard")}
            className="flex items-center gap-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-black dark:hover:text-white mb-4 font-inter transition-colors"
          >
            <ArrowLeft size={20} />
            Dashboard'ga qaytish
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
              <SettingsIcon size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-white font-sora">
              Sozlamalar
            </h1>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4 font-sora">
            Do'kon Ma'lumotlari
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Manzil
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi 1-uy"
                rows="2"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors font-inter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Google Maps Havolasi
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=Toshkent, Chilonzor"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors font-inter"
              />
              <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                Google Maps'da do'koningiz manzilini topib, havolasini bu yerga
                qo'ying
              </p>

              {googleMapsUrl && (
                <button
                  onClick={handleTestLink}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] dark:bg-[#262626] text-black dark:text-white rounded-lg hover:bg-[#E5E7EB] dark:hover:bg-[#333333] transition-colors font-inter text-sm"
                >
                  <ExternalLink size={16} />
                  Linkni sinab ko'rish
                </button>
              )}
            </div>

            <div className="bg-[#EFF6FF] dark:bg-[#1E3A5F] border border-[#3B82F6] rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <MapPin size={20} className="text-[#3B82F6] mt-0.5" />
                <div>
                  <h3 className="font-semibold text-black dark:text-white font-inter mb-1">
                    Do'kon koordinatalari (Yaqin do'konlar funksiyasi uchun)
                  </h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    Google Maps'dan do'koningiz joylashuvini toping va
                    koordinatalarni ko'chiring
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2 font-inter">
                    Latitude (Kenglik)
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-inter"
                    placeholder="41.311151"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2 font-inter">
                    Longitude (Uzunlik)
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-inter"
                    placeholder="69.279737"
                  />
                </div>
              </div>

              <details className="mt-3">
                <summary className="text-sm text-[#3B82F6] cursor-pointer font-inter hover:underline">
                  Qanday topish mumkin?
                </summary>
                <ol className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter space-y-1 ml-4 list-decimal">
                  <li>Google Maps'ga kiring</li>
                  <li>Do'koningiz joylashuvini toping</li>
                  <li>Joyga sichqonchaning o'ng tugmasini bosing</li>
                  <li>
                    Birinchi raqamlar (latitude), ikkinchi raqamlar (longitude)
                  </li>
                  <li>Misol: 41.311151, 69.279737</li>
                </ol>
              </details>
            </div>
          </div>
        </div>

        {/* Business Hours Section */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={24} className="text-[#3B82F6]" />
            <h2 className="text-xl font-bold text-black dark:text-white font-sora">
              Ish Vaqti
            </h2>
          </div>

          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6 font-inter">
            Do'koningiz qachon ochiq ekanligini belgilang. Mijozlar faqat ochiq
            vaqtlarda bron qilishlari mumkin.
          </p>

          <div className="space-y-3">
            {DAYS_ORDER.map((day) => (
              <div
                key={day}
                className="flex items-center gap-4 p-4 bg-[#F9FAFB] dark:bg-[#262626] rounded-lg"
              >
                <div className="w-28 flex-shrink-0">
                  <span className="font-medium text-black dark:text-white font-inter">
                    {DAYS_UZ[day]}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-1">
                  {businessHours[day]?.closed ? (
                    <span className="text-sm text-[#9CA3AF] dark:text-[#6B7280] font-inter">
                      Dam olish kuni
                    </span>
                  ) : (
                    <>
                      <input
                        type="time"
                        value={businessHours[day]?.open || "09:00"}
                        onChange={(e) =>
                          updateDayHours(day, "open", e.target.value)
                        }
                        className="px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] font-inter text-sm"
                      />
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                        -
                      </span>
                      <input
                        type="time"
                        value={businessHours[day]?.close || "18:00"}
                        onChange={(e) =>
                          updateDayHours(day, "close", e.target.value)
                        }
                        className="px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] font-inter text-sm"
                      />
                    </>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={businessHours[day]?.closed || false}
                    onChange={(e) =>
                      updateDayHours(day, "closed", e.target.checked)
                    }
                    className="w-4 h-4 accent-[#EF4444] cursor-pointer"
                  />
                  <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    Yopiq
                  </span>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-[#FFFBEB] dark:bg-[#78350F] border border-[#FDE68A] dark:border-[#F59E0B] rounded-lg">
            <p className="text-sm text-[#92400E] dark:text-[#FEF3C7] font-inter">
              <strong>💡 Maslahat:</strong> Ish vaqtingizni aniq belgilang.
              Mijozlar faqat do'kon ochiq bo'lganda bron qilishlari mumkin.
            </p>
          </div>
        </div>

        {/* Customer Confirmations Section */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4 font-sora">
            Mijozlarga Tasdiqlash Xabarlari
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] dark:bg-[#262626] rounded-lg">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-[#3B82F6] mt-0.5" />
                <div>
                  <p className="font-semibold text-black dark:text-white font-inter">
                    Email Tasdiqlash
                  </p>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    Mijoz bron qilganda email orqali tasdiqlash xabari yuborish
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCustomerEmailEnabled(!customerEmailEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  customerEmailEnabled
                    ? "bg-[#3B82F6]"
                    : "bg-[#D1D5DB] dark:bg-[#404040]"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    customerEmailEnabled ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] dark:bg-[#262626] rounded-lg">
              <div className="flex items-start gap-3">
                <MessageSquare size={20} className="text-[#10B981] mt-0.5" />
                <div>
                  <p className="font-semibold text-black dark:text-white font-inter">
                    SMS Tasdiqlash
                  </p>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    Mijoz bron qilganda SMS orqali tasdiqlash xabari yuborish
                    (demo rejim)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCustomerSmsEnabled(!customerSmsEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  customerSmsEnabled
                    ? "bg-[#10B981]"
                    : "bg-[#D1D5DB] dark:bg-[#404040]"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    customerSmsEnabled ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div className="p-4 bg-[#FFFBEB] dark:bg-[#78350F] border border-[#FDE68A] dark:border-[#F59E0B] rounded-lg">
              <p className="text-sm text-[#92400E] dark:text-[#FEF3C7] font-inter">
                <strong>💡 Eslatma:</strong> Mijozlar bron qilayotganda email
                manzilini kiritishlari kerak. SMS esa demo rejimda ishlaydi va
                haqiqiy xabar yubormaydi.
              </p>
            </div>
          </div>
        </div>

        {/* Telegram Section */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4 font-sora">
            Telegram Bildirishnomalar
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="123456789"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors font-inter"
              />
              <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                Telegram'da{" "}
                <code className="bg-[#F3F3F3] dark:bg-[#262626] px-2 py-0.5 rounded font-jetbrains text-xs">
                  @userinfobot
                </code>{" "}
                ga{" "}
                <code className="bg-[#F3F3F3] dark:bg-[#262626] px-2 py-0.5 rounded font-jetbrains text-xs">
                  /start
                </code>{" "}
                yuboring va o'z Chat ID'ingizni oling.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-inter font-medium"
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                Saqlash
              </button>

              <button
                onClick={handleTestTelegram}
                disabled={testing || !telegramChatId.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#10B981] dark:bg-[#047857] text-white rounded-lg hover:bg-[#059669] dark:hover:bg-[#065F46] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-inter font-medium"
              >
                {testing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                Test Xabar Yuborish
              </button>
            </div>

            {saveMessage && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg border ${
                  saveMessage.type === "success"
                    ? "bg-[#D1FAE5] dark:bg-[#065F46] border-[#A7F3D0] dark:border-[#10B981]"
                    : "bg-[#FEE2E2] dark:bg-[#7F1D1D] border-[#FECACA] dark:border-[#DC2626]"
                }`}
              >
                {saveMessage.type === "success" ? (
                  <CheckCircle
                    size={20}
                    className="text-[#10B981] dark:text-[#34D399] flex-shrink-0"
                  />
                ) : (
                  <XCircle
                    size={20}
                    className="text-[#DC2626] dark:text-[#F87171] flex-shrink-0"
                  />
                )}
                <span
                  className={`text-sm font-inter ${
                    saveMessage.type === "success"
                      ? "text-[#065F46] dark:text-[#D1FAE5]"
                      : "text-[#7F1D1D] dark:text-[#FCA5A5]"
                  }`}
                >
                  {saveMessage.text}
                </span>
              </div>
            )}

            {testMessage && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg border ${
                  testMessage.type === "success"
                    ? "bg-[#D1FAE5] dark:bg-[#065F46] border-[#A7F3D0] dark:border-[#10B981]"
                    : "bg-[#FEE2E2] dark:bg-[#7F1D1D] border-[#FECACA] dark:border-[#DC2626]"
                }`}
              >
                {testMessage.type === "success" ? (
                  <CheckCircle
                    size={20}
                    className="text-[#10B981] dark:text-[#34D399] flex-shrink-0"
                  />
                ) : (
                  <XCircle
                    size={20}
                    className="text-[#DC2626] dark:text-[#F87171] flex-shrink-0"
                  />
                )}
                <span
                  className={`text-sm font-inter ${
                    testMessage.type === "success"
                      ? "text-[#065F46] dark:text-[#D1FAE5]"
                      : "text-[#7F1D1D] dark:text-[#FCA5A5]"
                  }`}
                >
                  {testMessage.text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
