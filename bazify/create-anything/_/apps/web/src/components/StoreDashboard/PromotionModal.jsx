import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function PromotionModal({ storeId, products, promotion, onClose }) {
  const [formData, setFormData] = useState({
    name: promotion?.name || "",
    description: promotion?.description || "",
    discountType: promotion?.discount_type || "percentage",
    discountValue: promotion?.discount_value || "",
    applyTo: promotion?.apply_to || "all",
    productIds: promotion?.product_ids || [],
    startDate: promotion?.start_date
      ? new Date(promotion.start_date).toISOString().slice(0, 16)
      : "",
    endDate: promotion?.end_date
      ? new Date(promotion.end_date).toISOString().slice(0, 16)
      : "",
  });
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = "/api/promotions";
      const method = promotion ? "PUT" : "POST";
      const body = promotion
        ? { id: promotion.id, ...data }
        : { storeId, ...data };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Xatolik yuz berdi");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["store-promotions"]);
      queryClient.invalidateQueries(["store-products"]);
      onClose();
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
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError("Majburiy maydonlarni to'ldiring");
      return;
    }

    if (formData.applyTo === "selected" && formData.productIds.length === 0) {
      setError("Kamida bitta mahsulot tanlang");
      return;
    }

    mutation.mutate(formData);
  };

  const toggleProduct = (productId) => {
    if (formData.productIds.includes(productId)) {
      setFormData({
        ...formData,
        productIds: formData.productIds.filter((id) => id !== productId),
      });
    } else {
      setFormData({
        ...formData,
        productIds: [...formData.productIds, productId],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl max-w-3xl w-full border border-[#E6E6E6] dark:border-[#333333] my-8">
        <div className="flex items-center justify-between p-6 border-b border-[#E6E6E6] dark:border-[#333333]">
          <h2 className="text-xl font-bold text-black dark:text-white font-sora">
            {promotion ? "Aksiyani tahrirlash" : "Yangi aksiya"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-black dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
              Aksiya nomi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              placeholder="Yangi yil chegirmasi"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
              Tavsif (ixtiyoriy)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              rows="2"
              placeholder="Yangi yil munosabati bilan barcha mahsulotlarga chegirma"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Chegirma turi *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              >
                <option value="percentage">Foiz (%)</option>
                <option value="fixed">Summa (so'm)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Chegirma qiymati *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                placeholder={
                  formData.discountType === "percentage" ? "20" : "500000"
                }
                min="0"
                max={formData.discountType === "percentage" ? "100" : undefined}
              />
            </div>
          </div>

          {/* Apply To */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
              Qaysi mahsulotlarga? *
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="applyTo"
                  value="all"
                  checked={formData.applyTo === "all"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applyTo: e.target.value,
                      productIds: [],
                    })
                  }
                  className="w-4 h-4 text-[#3B82F6]"
                />
                <span className="text-sm text-black dark:text-white font-inter">
                  Barcha mahsulotlar
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="applyTo"
                  value="selected"
                  checked={formData.applyTo === "selected"}
                  onChange={(e) =>
                    setFormData({ ...formData, applyTo: e.target.value })
                  }
                  className="w-4 h-4 text-[#3B82F6]"
                />
                <span className="text-sm text-black dark:text-white font-inter">
                  Tanlangan mahsulotlar
                </span>
              </label>
            </div>

            {formData.applyTo === "selected" && (
              <div className="max-h-48 overflow-y-auto border border-[#D1D5DB] dark:border-[#404040] rounded-lg p-3 space-y-2">
                {products.length === 0 ? (
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    Avval mahsulot qo'shing
                  </p>
                ) : (
                  products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-3 p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#262626] rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.productIds.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 text-[#3B82F6]"
                      />
                      <img
                        src={
                          product.image_url || "https://via.placeholder.com/50"
                        }
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black dark:text-white font-inter">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                          {Number(product.price).toLocaleString()} so'm
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Boshlanish sanasi *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                Tugash sanasi *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              />
            </div>
          </div>

          {error && (
            <div className="bg-[#FEE2E2] dark:bg-[#7F1D1D] border border-[#FCA5A5] dark:border-[#DC2626] rounded-lg p-3">
              <p className="text-sm text-[#DC2626] dark:text-[#FCA5A5] font-inter">
                {error}
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 bg-gradient-to-br from-[#10B981] to-[#059669] text-white text-lg font-bold rounded-xl hover:from-[#059669] hover:to-[#047857] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-inter shadow-lg shadow-green-500/30"
          >
            {mutation.isPending ? "Saqlanmoqda..." : "✓ Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}
