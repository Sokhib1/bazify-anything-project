import { AlertCircle } from "lucide-react";

export function TelegramWarningBanner({ onSettings }) {
  return (
    <div className="mb-6 bg-[#FEF3C7] dark:bg-[#78350F] border border-[#FDE68A] dark:border-[#F59E0B] rounded-xl p-4 flex items-start gap-3">
      <AlertCircle
        className="text-[#F59E0B] dark:text-[#FCD34D] flex-shrink-0 mt-0.5"
        size={20}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-[#92400E] dark:text-[#FEF3C7] font-inter">
          Telegram xabarnomalar o'rnatilmagan – Bron xabarnomalarini olish uchun
          sozlamalarga o'ting va Telegram Chat ID ni qo'shing.
        </p>
      </div>
      <button
        onClick={onSettings}
        className="px-4 py-2 bg-[#F59E0B] dark:bg-[#D97706] text-white text-sm font-medium rounded-lg hover:bg-[#D97706] dark:hover:bg-[#B45309] transition-colors font-inter flex-shrink-0"
      >
        Sozlamalar
      </button>
    </div>
  );
}
