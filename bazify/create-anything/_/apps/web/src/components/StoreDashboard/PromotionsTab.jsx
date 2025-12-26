import { Plus, Percent, Calendar, Tag, TrendingUp } from "lucide-react";

export function PromotionsTab({
  promotions,
  onAddPromotion,
  onEditPromotion,
  onToggleActive,
}) {
  const activePromotions = promotions.filter((p) => {
    const now = new Date();
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    return p.is_active && now >= start && now <= end;
  });

  const upcomingPromotions = promotions.filter((p) => {
    const now = new Date();
    const start = new Date(p.start_date);
    return p.is_active && now < start;
  });

  const expiredPromotions = promotions.filter((p) => {
    const now = new Date();
    const end = new Date(p.end_date);
    return !p.is_active || now > end;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDiscountText = (promotion) => {
    if (promotion.discount_type === "percentage") {
      return `-${promotion.discount_value}%`;
    } else {
      return `-${Number(promotion.discount_value).toLocaleString()} so'm`;
    }
  };

  const PromotionCard = ({ promotion, status }) => (
    <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-black dark:text-white font-sora">
              {promotion.name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === "active"
                  ? "bg-[#DCFCE7] text-[#16A34A] dark:bg-[#14532D] dark:text-[#4ADE80]"
                  : status === "upcoming"
                    ? "bg-[#FEF3C7] text-[#D97706] dark:bg-[#78350F] dark:text-[#FCD34D]"
                    : "bg-[#F3F4F6] text-[#6B7280] dark:bg-[#374151] dark:text-[#9CA3AF]"
              }`}
            >
              {status === "active"
                ? "Faol"
                : status === "upcoming"
                  ? "Kutilmoqda"
                  : "Tugagan"}
            </span>
          </div>
          {promotion.description && (
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter mb-3">
              {promotion.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#EFF6FF] dark:bg-[#1E3A5F] rounded-lg flex items-center justify-center">
            <Percent size={16} className="text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Chegirma
            </p>
            <p className="text-sm font-bold text-black dark:text-white font-inter">
              {getDiscountText(promotion)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F0FDF4] dark:bg-[#14532D] rounded-lg flex items-center justify-center">
            <Tag size={16} className="text-[#16A34A]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Mahsulotlar
            </p>
            <p className="text-sm font-bold text-black dark:text-white font-inter">
              {promotion.apply_to === "all"
                ? "Barchasi"
                : `${promotion.product_ids?.length || 0} ta`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FEF3C7] dark:bg-[#78350F] rounded-lg flex items-center justify-center">
            <Calendar size={16} className="text-[#D97706]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Boshlanish
            </p>
            <p className="text-sm font-bold text-black dark:text-white font-inter">
              {formatDate(promotion.start_date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FEE2E2] dark:bg-[#7F1D1D] rounded-lg flex items-center justify-center">
            <Calendar size={16} className="text-[#DC2626]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Tugash
            </p>
            <p className="text-sm font-bold text-black dark:text-white font-inter">
              {formatDate(promotion.end_date)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEditPromotion(promotion)}
          className="flex-1 px-4 py-2 bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] text-sm font-medium rounded-lg hover:bg-[#DBEAFE] dark:hover:bg-[#1E40AF] transition-colors font-inter"
        >
          Tahrirlash
        </button>
        <button
          onClick={() => onToggleActive(promotion.id, !promotion.is_active)}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors font-inter ${
            promotion.is_active
              ? "bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#FCA5A5] hover:bg-[#FECACA] dark:hover:bg-[#991B1B]"
              : "bg-[#DCFCE7] dark:bg-[#14532D] text-[#16A34A] dark:text-[#4ADE80] hover:bg-[#BBF7D0] dark:hover:bg-[#166534]"
          }`}
        >
          {promotion.is_active ? "O'chirish" : "Yoqish"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white font-sora mb-2">
            Aksiyalar
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            Chegirmalar va maxsus takliflar
          </p>
        </div>
        <button
          onClick={onAddPromotion}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white font-medium rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 transition-all font-inter shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} />
          Aksiya qo'shish
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-[#EFF6FF] dark:bg-[#1E3A5F] rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-[#3B82F6]" />
          </div>
          <h3 className="text-lg font-bold text-black dark:text-white font-sora mb-2">
            Hozircha aksiyalar yo'q
          </h3>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter mb-4">
            Birinchi aksiyangizni yarating va mijozlarni jalb qiling!
          </p>
          <button
            onClick={onAddPromotion}
            className="px-6 py-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white font-medium rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 transition-all font-inter"
          >
            Aksiya yaratish
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activePromotions.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white font-sora mb-3">
                Faol aksiyalar ({activePromotions.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activePromotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    status="active"
                  />
                ))}
              </div>
            </div>
          )}

          {upcomingPromotions.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white font-sora mb-3">
                Kutilayotgan aksiyalar ({upcomingPromotions.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingPromotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    status="upcoming"
                  />
                ))}
              </div>
            </div>
          )}

          {expiredPromotions.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white font-sora mb-3">
                Tugagan aksiyalar ({expiredPromotions.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {expiredPromotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    status="expired"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
