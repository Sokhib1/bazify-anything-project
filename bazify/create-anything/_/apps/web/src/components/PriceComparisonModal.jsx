"use client";

import { X, TrendingDown, Store, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PriceComparisonModal({ product, onClose, onReserve }) {
  const { data: comparison, isLoading } = useQuery({
    queryKey: ["comparison", product.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/products/compare?productId=${product.id}`,
      );
      if (!response.ok) throw new Error("Taqqoslash amalga oshmadi");
      return response.json();
    },
  });

  const hasExactMatches = comparison?.exactMatches?.length > 0;
  const hasSimilarProducts = comparison?.similarProducts?.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E6E6] dark:border-[#333333]">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-black dark:text-white font-sora mb-1">
                Narxlarni taqqoslash
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                {product.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Current Product Price */}
          <div className="mt-4 p-4 bg-[#EFF6FF] dark:bg-[#1E3A5F] rounded-xl">
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter mb-1">
              Joriy narx
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#3B82F6] font-sora">
                {Number(product.price).toLocaleString()} so'm
              </span>
              {comparison && (
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter flex items-center gap-1">
                  <Store size={16} />
                  {product.store_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exact Matches */}
              {hasExactMatches && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="text-[#10B981]" size={20} />
                    <h3 className="text-lg font-bold text-black dark:text-white font-sora">
                      Bir xil mahsulot boshqa do'konlarda
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {comparison.exactMatches.map((item) => {
                      const isLowest = item.price === comparison.lowestPrice;
                      const priceDiff =
                        parseFloat(item.price) - parseFloat(product.price);

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isLowest
                              ? "border-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]"
                              : "border-[#E6E6E6] dark:border-[#333333] bg-white dark:bg-[#262626]"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-base text-black dark:text-white font-inter">
                                  {item.store_name}
                                </h4>
                                {isLowest && (
                                  <span className="px-2 py-1 bg-[#10B981] text-white text-xs font-medium rounded-md font-inter">
                                    Eng arzon
                                  </span>
                                )}
                              </div>
                              {item.store_address && (
                                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                                  {item.store_address}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-[#3B82F6] font-sora">
                                {Number(item.price).toLocaleString()} so'm
                              </p>
                              {priceDiff !== 0 && (
                                <p
                                  className={`text-xs font-medium font-inter ${
                                    priceDiff < 0
                                      ? "text-[#10B981]"
                                      : "text-[#EF4444]"
                                  }`}
                                >
                                  {priceDiff > 0 ? "+" : ""}
                                  {Number(priceDiff).toLocaleString()} so'm
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                onReserve(item);
                                onClose();
                              }}
                              className="flex-1 px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors font-inter"
                            >
                              Bron qilish
                            </button>
                            <button
                              onClick={() =>
                                (window.location.href = `/store/${item.store_id}`)
                              }
                              className="px-4 py-2 bg-[#F3F3F3] dark:bg-[#0A0A0A] text-[#6B7280] dark:text-[#9CA3AF] text-sm font-medium rounded-lg hover:bg-[#E6E6E6] dark:hover:bg-[#262626] transition-colors font-inter flex items-center gap-1"
                            >
                              <ExternalLink size={16} />
                              Do'kon
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Similar Products */}
              {hasSimilarProducts && (
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white font-sora mb-4">
                    O'xshash mahsulotlar
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {comparison.similarProducts.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-[#E6E6E6] dark:border-[#333333] bg-white dark:bg-[#262626]"
                      >
                        <div className="flex gap-3 mb-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg bg-[#F3F3F3] dark:bg-[#0A0A0A]"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-black dark:text-white font-inter line-clamp-1 mb-1">
                              {item.name}
                            </h4>
                            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter flex items-center gap-1">
                              <Store size={12} />
                              {item.store_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-[#3B82F6] font-sora">
                            {Number(item.price).toLocaleString()} so'm
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onReserve(item);
                            onClose();
                          }}
                          className="w-full px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors font-inter"
                        >
                          Bron qilish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasExactMatches && !hasSimilarProducts && (
                <div className="text-center py-12">
                  <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    Boshqa do'konlarda o'xshash mahsulotlar topilmadi
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
