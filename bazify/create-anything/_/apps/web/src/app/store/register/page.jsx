"use client";

import { useState } from "react";
import { Store, ArrowLeft, Send, MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function StoreRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    googleMapsUrl: "",
    telegramChatId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ro'yxatdan o'tishda xatolik");
      }
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.ownerName ||
      !formData.phone ||
      !formData.email ||
      !formData.password ||
      !formData.address
    ) {
      setError("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    registerMutation.mutate(formData);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#D1FAE5] dark:bg-[#065F46] rounded-full flex items-center justify-center mx-auto mb-6">
            <Store size={32} className="text-[#10B981] dark:text-[#34D399]" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-3 font-sora">
            Muvaffaqiyatli ro'yxatdan o'tdingiz!
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6 font-inter">
            Sizning so'rovingiz administratorga yuborildi. Tasdiqlanishini
            kuting.
          </p>
          <button
            onClick={() => (window.location.href = "/store/login")}
            className="w-full py-3 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] transition-all font-inter"
          >
            Kirish sahifasiga o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2 font-sora">
            Do'kon Ro'yxatdan O'tish
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            O'z do'koningizni platformaga qo'shing
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Do'kon nomi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                placeholder="Texno Savdo"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Egasi ismi *
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                placeholder="Akmal Aliyev"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Telefon raqam *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                placeholder="+998901234567"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                placeholder="store@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Parol *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                placeholder="••••••••"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Do'kon manzili *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                rows="2"
                placeholder="Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi 1-uy"
              />
            </div>

            {/* Google Maps URL */}
            <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#1E3A5F] dark:to-[#1E40AF] border border-[#3B82F6] dark:border-[#60A5FA] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin
                  size={18}
                  className="text-[#3B82F6] dark:text-[#60A5FA]"
                />
                <label className="text-sm font-medium text-black dark:text-white font-inter">
                  Google Maps havolasi (ixtiyoriy)
                </label>
              </div>
              <input
                type="url"
                value={formData.googleMapsUrl}
                onChange={(e) =>
                  setFormData({ ...formData, googleMapsUrl: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter mb-2"
                placeholder="https://maps.google.com/?q=Toshkent, Chilonzor"
              />
              <p className="text-xs text-[#1E40AF] dark:text-[#BFDBFE] font-inter">
                📍 Google Maps'da do'koningiz manzilini topib, havolasini bu
                yerga qo'ying. Mijozlar manzilni osongina topadi!
              </p>
            </div>

            {/* Telegram Chat ID */}
            <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#1E3A5F] dark:to-[#1E40AF] border border-[#3B82F6] dark:border-[#60A5FA] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Send
                  size={18}
                  className="text-[#3B82F6] dark:text-[#60A5FA]"
                />
                <label className="text-sm font-medium text-black dark:text-white font-inter">
                  Telegram Chat ID (ixtiyoriy)
                </label>
              </div>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) =>
                  setFormData({ ...formData, telegramChatId: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter mb-2"
                placeholder="123456789"
              />
              <p className="text-xs text-[#1E40AF] dark:text-[#BFDBFE] font-inter mb-1">
                📱 Chat ID ni olish uchun Telegramda{" "}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  @userinfobot
                </a>
                ga /start yozing
              </p>
              <p className="text-xs text-[#10B981] dark:text-[#34D399] font-inter">
                ✅ Chat ID qo'shsangiz, har bir bron haqida Telegram orqali
                xabar olasiz
              </p>
            </div>

            {error && (
              <div className="bg-[#FEE2E2] dark:bg-[#7F1D1D] border border-[#FCA5A5] dark:border-[#DC2626] rounded-lg p-3">
                <p className="text-sm text-[#DC2626] dark:text-[#FCA5A5] font-inter">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-[0.98] transition-all disabled:opacity-50 font-inter"
            >
              {registerMutation.isPending
                ? "Ro'yxatdan o'tkazilmoqda..."
                : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => (window.location.href = "/store/login")}
              className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium font-inter flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} />
              Kirish sahifasiga qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
