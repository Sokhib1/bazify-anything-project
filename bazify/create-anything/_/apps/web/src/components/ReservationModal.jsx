"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  MapPin,
  Send,
  XCircle,
  User,
  Phone,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { isStoreOpen, getStoreStatus } from "@/utils/businessHours";

export default function ReservationModal({ product, store, onClose }) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    pickupTime: "",
  });
  const [reservation, setReservation] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Check if store is open
  const storeStatus = getStoreStatus(store?.business_hours);
  const isOpen = storeStatus.isOpen;

  const createReservation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Bron qilishda xatolik");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      setReservation(data);
      const qrData = `Bron kodi: ${data.code}\nMahsulot: ${product.name}\nDo'kon: ${store.name}\nManzil: ${store.address}\nMijoz: ${data.customer_name}\nTelefon: ${data.customer_phone}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrUrl);
      setStep(2);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isOpen) {
      setError("Do'kon hozir yopiq. Ochiq vaqtda qayta urinib ko'ring.");
      return;
    }

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.pickupTime
    ) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    createReservation.mutate({
      productId: product.id,
      storeId: product.store_id,
      ...formData,
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `bron-${reservation.code}.png`;
    link.target = "_blank";
    link.click();
  };

  const openInGoogleMaps = () => {
    if (store?.google_maps_url) {
      window.open(store.google_maps_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#E6E6E6] dark:border-[#333333]">
        <div className="flex items-center justify-between p-6 border-b border-[#E6E6E6] dark:border-[#333333]">
          <h2 className="text-xl font-bold text-black dark:text-white font-sora">
            {step === 1 ? "Mahsulotni bron qilish" : "Bron muvaffaqiyatli!"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F3F3] dark:hover:bg-[#262626] transition-colors"
          >
            <X size={20} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Product Info */}
            <div className="bg-[#F3F3F3] dark:bg-[#262626] p-4 rounded-lg">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1 font-inter">
                Mahsulot
              </p>
              <p className="font-semibold text-black dark:text-white font-inter">
                {product.name}
              </p>
              <p className="text-lg font-bold text-[#3B82F6] mt-1 font-sora">
                {Number(product.price).toLocaleString()} so'm
              </p>
            </div>

            {/* Store Info with Status */}
            <div
              className={`p-4 rounded-lg ${
                isOpen
                  ? "bg-[#D1FAE5] dark:bg-[#065F46] border border-[#A7F3D0] dark:border-[#10B981]"
                  : "bg-[#FEE2E2] dark:bg-[#7F1D1D] border border-[#FCA5A5] dark:border-[#DC2626]"
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <Clock
                  size={18}
                  className={
                    isOpen
                      ? "text-[#10B981] dark:text-[#34D399]"
                      : "text-[#EF4444] dark:text-[#F87171]"
                  }
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold font-inter ${
                      isOpen
                        ? "text-[#065F46] dark:text-[#D1FAE5]"
                        : "text-[#7F1D1D] dark:text-[#FCA5A5]"
                    }`}
                  >
                    {storeStatus.text}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#1E40AF] dark:text-[#BFDBFE] mb-2 font-inter">
                📍 Olib ketish joyi:
              </p>
              <p className="font-semibold text-black dark:text-white mb-1 font-inter">
                {store.name}
              </p>
              {store.address && (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 font-inter">
                  {store.address}
                </p>
              )}
              {store.google_maps_url ? (
                <button
                  type="button"
                  onClick={openInGoogleMaps}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors font-inter font-medium"
                >
                  <MapPin size={16} />
                  Google Mapsda ochish
                </button>
              ) : (
                <p className="text-xs text-center text-[#9CA3AF] dark:text-[#6B7280] font-inter">
                  Manzil mavjud emas
                </p>
              )}
            </div>

            {/* Show warning if store is closed */}
            {!isOpen && (
              <div className="bg-[#FEF3C7] dark:bg-[#78350F] border border-[#FDE68A] dark:border-[#F59E0B] rounded-lg p-4 flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-[#F59E0B] flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-[#92400E] dark:text-[#FEF3C7] text-sm font-inter mb-1">
                    Bu do'kon hozir yopiq
                  </p>
                  <p className="text-xs text-[#92400E] dark:text-[#FDE68A] font-inter">
                    Iltimos, do'kon ochiq vaqtda qayta urinib ko'ring.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                <User size={16} className="inline mr-1" />
                Ismingiz *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors font-inter"
                placeholder="To'liq ismingizni kiriting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                <Phone size={16} className="inline mr-1" />
                Telefon raqamingiz *
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors font-inter"
                placeholder="+998901234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                <Clock size={16} className="inline mr-1" />
                Olib ketish vaqti *
              </label>
              <select
                value={formData.pickupTime}
                onChange={(e) =>
                  setFormData({ ...formData, pickupTime: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors font-inter"
              >
                <option value="">Tanlang</option>
                <option value="Bugun 18:00 gacha">Bugun 18:00 gacha</option>
                <option value="Ertaga ertalab">Ertaga ertalab</option>
                <option value="Ertaga tushdan keyin">
                  Ertaga tushdan keyin
                </option>
              </select>
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
              disabled={createReservation.isPending || !isOpen}
              className="w-full py-3 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-inter"
            >
              {!isOpen
                ? "Do'kon yopiq"
                : createReservation.isPending
                  ? "Bronlanmoqda..."
                  : "Tasdiqlash"}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-[#D1FAE5] dark:bg-[#065F46] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle
                size={32}
                className="text-[#10B981] dark:text-[#34D399]"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2 font-sora">
                Bronlash muvaffaqiyatli yakunlandi!
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                Sizning bron kodingiz:
              </p>
              <p className="text-3xl font-bold text-[#3B82F6] my-4 font-jetbrains tracking-wider">
                {reservation?.code}
              </p>
            </div>

            {reservation?.telegram_notification_sent ? (
              <div className="bg-[#D1FAE5] dark:bg-[#065F46] border border-[#A7F3D0] dark:border-[#10B981] rounded-lg p-4 flex items-start gap-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 bg-[#10B981] dark:bg-[#047857] rounded-full flex items-center justify-center">
                  <Send size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#065F46] dark:text-[#D1FAE5] font-inter">
                    Bron muvaffaqiyatli yuborildi!
                  </p>
                  <p className="text-xs text-[#047857] dark:text-[#A7F3D0] mt-1 font-inter">
                    Do'kon egasiga Telegram orqali xabar jo'natildi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#FEE2E2] dark:bg-[#7F1D1D] border border-[#FECACA] dark:border-[#DC2626] rounded-lg p-4 flex items-start gap-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 bg-[#DC2626] dark:bg-[#991B1B] rounded-full flex items-center justify-center">
                  <XCircle size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#7F1D1D] dark:text-[#FCA5A5] font-inter">
                    Bron qabul qilindi, lekin do'kon egasiga Telegram xabar
                    yuborilmadi.
                  </p>
                  {reservation?.telegram_notification_error && (
                    <p className="text-xs text-[#991B1B] dark:text-[#FECACA] mt-1 font-inter">
                      Sabab: {reservation.telegram_notification_error}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-[#F3F3F3] dark:bg-[#262626] p-4 rounded-lg text-left">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2 font-inter">
                📍 Olib ketish joyi:
              </p>
              <p className="font-semibold text-black dark:text-white mb-1 font-inter">
                {store.name}
              </p>
              {store.address && (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 font-inter">
                  {store.address}
                </p>
              )}
              {store.google_maps_url ? (
                <button
                  onClick={openInGoogleMaps}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors font-inter font-medium"
                >
                  <MapPin size={16} />
                  Google Mapsda ochish
                </button>
              ) : (
                <p className="text-xs text-center text-[#9CA3AF] dark:text-[#6B7280] font-inter">
                  Manzil mavjud emas
                </p>
              )}
            </div>

            <div className="bg-[#F3F3F3] dark:bg-[#262626] p-6 rounded-xl">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto w-64 h-64"
              />
              <button
                onClick={handleDownloadQR}
                className="mt-4 text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium font-inter"
              >
                QR kodni yuklab olish
              </button>
            </div>

            <div className="text-left bg-[#EFF6FF] dark:bg-[#1E3A5F] p-4 rounded-lg">
              <p className="text-sm text-[#1E40AF] dark:text-[#BFDBFE] font-inter">
                <strong>Eslatma:</strong> Mahsulotni olish uchun ushbu kodni
                yoki QR kodni do'konda ko'rsating.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#F3F3F3] dark:bg-[#262626] text-black dark:text-white font-medium rounded-lg hover:bg-[#E5E7EB] dark:hover:bg-[#333333] transition-colors font-inter"
            >
              Yopish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
