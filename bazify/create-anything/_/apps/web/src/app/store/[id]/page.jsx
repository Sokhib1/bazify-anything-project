"use client";

import { useState } from "react";
import { Store, ArrowLeft, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ReservationModal from "@/components/ReservationModal";

export default function StoreProductsPage({ params }) {
  const storeId = params.id;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores?storeId=${storeId}`);
      if (!response.ok) throw new Error("Do'kon topilmadi");
      return response.json();
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["store-products", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/products?storeId=${storeId}`);
      if (!response.ok) throw new Error("Mahsulotlar topilmadi");
      return response.json();
    },
  });

  const handleReserve = (product) => {
    setSelectedProduct({
      ...product,
      store_id: parseInt(storeId),
      store_name: store?.name,
    });
    setShowModal(true);
  };

  const isLoading = storeLoading || productsLoading;

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-[#E6E6E6] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center gap-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#3B82F6] dark:hover:text-[#3B82F6] mb-4 font-inter"
          >
            <ArrowLeft size={20} />
            Orqaga
          </button>

          {!storeLoading && store && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
                  <Store size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white font-sora">
                    {store.name}
                  </h1>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    {store.owner_name} • {store.phone}
                  </p>
                </div>
              </div>

              {store.address && (
                <div className="bg-[#F3F3F3] dark:bg-[#262626] rounded-lg p-4">
                  <div className="flex items-start gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter mb-3">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{store.address}</span>
                  </div>
                  {store.google_maps_url ? (
                    <button
                      onClick={() =>
                        window.open(
                          store.google_maps_url,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="flex items-center gap-2 text-sm px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors font-inter font-medium"
                    >
                      <MapPin size={16} />
                      Google Mapsda ochish
                    </button>
                  ) : (
                    <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] font-inter">
                      Manzil mavjud emas
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Bu do'konda hozircha mahsulotlar yo'q
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-black dark:text-white mb-6 font-sora">
              Barcha mahsulotlar ({products.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-[#F3F3F3] dark:bg-[#262626] overflow-hidden">
                    <img
                      src={
                        product.image_url ||
                        "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-base text-black dark:text-white mb-1 font-inter line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 font-inter line-clamp-2 h-10">
                      {product.description || "Mahsulot tavsifi"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#3B82F6] font-sora">
                        {Number(product.price).toLocaleString()} so'm
                      </span>
                      <button
                        onClick={() => handleReserve(product)}
                        className="px-4 py-2 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white text-sm font-medium rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 transition-all font-inter"
                      >
                        Bron qilish
                      </button>
                    </div>
                    {product.stock > 0 && (
                      <p className="text-xs text-[#10B981] dark:text-[#34D399] mt-2 font-inter">
                        Omborda: {product.stock} dona
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Reservation Modal */}
      {showModal && selectedProduct && (
        <ReservationModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
