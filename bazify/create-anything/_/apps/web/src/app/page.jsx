"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Store,
  ShoppingBag,
  MapPin,
  Search,
  X,
  TrendingUp,
  ArrowRight,
  Navigation,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ReservationModal from "@/components/ReservationModal";
import PriceComparisonModal from "@/components/PriceComparisonModal";
import {
  getUserLocation,
  sortStoresByDistance,
  formatDistance,
} from "@/utils/geolocation";
import { formatBusinessHours, getStoreStatus } from "@/utils/businessHours";

const CATEGORIES = [
  {
    name: "Konditsionerlar",
    slug: "konditsionerlar",
    emoji: "❄️",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    name: "Muzlatgichlar",
    slug: "muzlatgichlar",
    emoji: "🧊",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    name: "Televizorlar",
    slug: "televizorlar",
    emoji: "📺",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    name: "Kir yuvish mashinalari",
    slug: "kir-yuvish",
    emoji: "🧺",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    name: "Gaz plitalar",
    slug: "gaz-plitalar",
    emoji: "🔥",
    gradient: "from-orange-400 to-red-500",
  },
  {
    name: "Changyutgichlar",
    slug: "changyutgichlar",
    emoji: "🌪️",
    gradient: "from-gray-400 to-slate-500",
  },
  {
    name: "Boshqalar",
    slug: "boshqalar",
    emoji: "📦",
    gradient: "from-green-400 to-emerald-500",
  },
];

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [compareProduct, setCompareProduct] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products-with-promotions"],
    queryFn: async () => {
      const response = await fetch("/api/products/with-promotions");
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) throw new Error("Do'konlarni olishda xatolik");
      return response.json();
    },
  });

  // Sort stores by distance if user location is available
  const sortedStores = useMemo(() => {
    if (!userLocation || !stores.length) return stores;
    return sortStoresByDistance(
      stores,
      userLocation.latitude,
      userLocation.longitude,
    );
  }, [stores, userLocation]);

  // Group products by store (using sorted stores)
  const productsByStore = useMemo(() => {
    const storesToUse =
      userLocation && showNearbyOnly
        ? sortedStores.filter((s) => s.distance !== null && s.distance <= 10) // Within 10km
        : sortedStores;

    return products.reduce((acc, product) => {
      const store = storesToUse.find((s) => s.id === product.store_id);
      if (!store) return acc;

      const storeName = store.name || "Noma'lum do'kon";
      if (!acc[storeName]) {
        acc[storeName] = {
          products: [],
          storeId: store.id,
          distance: store.distance,
        };
      }
      acc[storeName].products.push(product);
      return acc;
    }, {});
  }, [products, sortedStores, userLocation, showNearbyOnly]);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    setLocationError("");

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      localStorage.setItem("userLocation", JSON.stringify(location));
    } catch (error) {
      console.error(error);
      setLocationError(error.message);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error("Failed to parse saved location");
      }
    }
  }, []);

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (!response.ok) throw new Error("Qidiruvda xatolik");
      const data = await response.json();

      // Fetch promotions for search results
      const now = new Date().toISOString();
      const productsWithPromotions = await Promise.all(
        (data.products || []).map(async (product) => {
          const promoResponse = await fetch(
            `/api/promotions?productId=${product.id}`,
          );
          if (promoResponse.ok) {
            const promotion = await promoResponse.json();
            if (promotion) {
              const discounted_price =
                promotion.discount_type === "percentage"
                  ? product.price * (1 - promotion.discount_value / 100)
                  : product.price - promotion.discount_value;
              return {
                ...product,
                promotion_id: promotion.id,
                promotion_name: promotion.name,
                discount_type: promotion.discount_type,
                discount_value: promotion.discount_value,
                discounted_price,
              };
            }
          }
          return product;
        }),
      );

      // Sort: promoted first
      return productsWithPromotions.sort((a, b) => {
        if (a.promotion_id && !b.promotion_id) return -1;
        if (!a.promotion_id && b.promotion_id) return 1;
        return 0;
      });
    },
    enabled: searchQuery.trim().length > 0,
  });

  const handleReserve = (product) => {
    const store = stores.find((s) => s.id === product.store_id);
    setSelectedProduct(product);
    setSelectedStore(store);
    setShowModal(true);
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setIsSearching(value.trim().length > 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleCompare = (product) => {
    setCompareProduct(product);
    setShowCompareModal(true);
  };

  const handleReserveFromComparison = (product) => {
    const store = stores.find((s) => s.id === product.store_id);
    setSelectedProduct(product);
    setSelectedStore(store);
    setShowModal(true);
  };

  const displayProducts = isSearching ? searchResults : null;

  const ProductCard = ({ product }) => {
    const hasPromotion = !!product.promotion_id;
    const displayPrice = hasPromotion
      ? product.discounted_price
      : product.price;
    const originalPrice = product.price;

    const getDiscountBadge = () => {
      if (!hasPromotion) return null;

      if (product.discount_type === "percentage") {
        return `Aksiya -${product.discount_value}%`;
      } else {
        return "Chegirma!";
      }
    };

    return (
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {/* Product Image */}
        <div className="aspect-square bg-[#F3F3F3] dark:bg-[#262626] overflow-hidden relative">
          <img
            src={
              product.image_url ||
              "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {hasPromotion && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white text-xs font-bold rounded-lg shadow-lg">
              {getDiscountBadge()}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-base text-black dark:text-white mb-1 font-inter line-clamp-1">
            {product.name}
          </h3>
          {isSearching && (
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] mb-2 font-inter flex items-center gap-1">
              <Store size={12} />
              {product.store_name}
            </p>
          )}
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 font-inter line-clamp-2 h-10">
            {product.description || "Mahsulot tavsifi"}
          </p>
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              {hasPromotion && (
                <span className="text-sm text-[#9CA3AF] dark:text-[#6B7280] line-through font-inter">
                  {Number(originalPrice).toLocaleString()} so'm
                </span>
              )}
              <span
                className={`font-bold text-[#3B82F6] font-sora ${hasPromotion ? "text-2xl" : "text-xl"}`}
              >
                {Number(displayPrice).toLocaleString()} so'm
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleReserve(product)}
              className="flex-1 px-4 py-2 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white text-sm font-medium rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 transition-all font-inter"
            >
              Bron qilish
            </button>
            {!isSearching && (
              <button
                onClick={() => handleCompare(product)}
                className="px-3 py-2 bg-[#F3F3F3] dark:bg-[#0A0A0A] text-[#6B7280] dark:text-[#9CA3AF] text-sm font-medium rounded-lg hover:bg-[#E6E6E6] dark:hover:bg-[#262626] transition-colors font-inter flex items-center gap-1"
                title="Narxlarni taqqoslash"
              >
                <TrendingUp size={16} />
              </button>
            )}
          </div>
          {product.stock > 0 && (
            <p className="text-xs text-[#10B981] dark:text-[#34D399] mt-2 font-inter">
              Omborda: {product.stock} dona
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-[#E6E6E6] dark:border-[#333333] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
                <Store size={20} className="text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-black dark:text-white font-sora">
                Bazify
              </h1>
            </div>
            <div className="flex gap-2">
              {/* NEW: Location Button */}
              <button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors font-inter flex items-center gap-2 ${
                  userLocation
                    ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151]"
                }`}
                title={
                  userLocation
                    ? "Joylashuv aniqlandi"
                    : "Yaqin do'konlarni topish"
                }
              >
                <Navigation
                  size={16}
                  className={isGettingLocation ? "animate-spin" : ""}
                />
                {userLocation ? "Yaqin do'konlar" : "Mening joylashuvim"}
              </button>

              <button
                onClick={() => navigateTo("/store/login")}
                className="px-4 py-2 text-sm font-medium text-[#3B82F6] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A5F] rounded-lg transition-colors font-inter"
              >
                Do'kon Kirish
              </button>
              <button
                onClick={() => navigateTo("/admin")}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] rounded-lg transition-colors font-inter"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-[#6B7280]"
              size={20}
            />
            <input
              type="text"
              placeholder="Mahsulot, brend yoki kategoriya bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-[#F3F3F3] dark:bg-[#0A0A0A] border border-[#E6E6E6] dark:border-[#333333] rounded-xl text-black dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-inter"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-[#6B7280] hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* NEW: Location Status Banner */}
          {userLocation && !isSearching && (
            <div className="mt-4 flex items-center justify-between bg-[#EFF6FF] dark:bg-[#1E3A5F] rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-[#3B82F6]" />
                <span className="text-sm text-[#3B82F6] font-inter font-medium">
                  Yaqin do'konlar ko'rsatilmoqda
                </span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNearbyOnly}
                    onChange={(e) => setShowNearbyOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#3B82F6]"
                  />
                  <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    Faqat 10 km ichida
                  </span>
                </label>
                <button
                  onClick={() => {
                    setUserLocation(null);
                    localStorage.removeItem("userLocation");
                    setShowNearbyOnly(false);
                  }}
                  className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-black dark:hover:text-white font-inter"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {locationError && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/30 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-inter">
                {locationError}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        {!isSearching && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white font-sora">
                Mashhur kategoriyalar
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {CATEGORIES.map((category) => (
                <a
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="group relative bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>
                  <div className="relative">
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {category.emoji}
                    </div>
                    <h3 className="text-sm font-semibold text-black dark:text-white font-inter line-clamp-2 mb-2 min-h-[40px]">
                      {category.name}
                    </h3>
                    <div className="flex items-center text-xs text-[#3B82F6] font-inter font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ko'rish
                      <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {isSearching ? (
          // Search Results View
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-black dark:text-white font-sora mb-2">
                Qidiruv natijalari
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                "{searchQuery}" uchun{" "}
                {searchLoading ? "..." : searchResults.length} ta mahsulot
                topildi
              </p>
            </div>

            {searchLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-20">
                <Search
                  size={48}
                  className="mx-auto text-[#9CA3AF] dark:text-[#6B7280] mb-4"
                />
                <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter mb-2">
                  Hech narsa topilmadi
                </p>
                <p className="text-sm text-[#9CA3AF] dark:text-[#6B7280] font-inter">
                  Boshqa kalit so'zlar bilan qidiring
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Normal Browse View
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : Object.keys(productsByStore).length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag
                  size={48}
                  className="mx-auto text-[#9CA3AF] dark:text-[#6B7280] mb-4"
                />
                <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                  Hozircha mahsulotlar yo'q
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(productsByStore).map(
                  ([storeName, { products, storeId, distance }]) => {
                    const currentStore = sortedStores.find(
                      (s) => s.id === storeId,
                    );
                    const storeStatus = getStoreStatus(
                      currentStore?.business_hours,
                    );
                    const businessHoursText = formatBusinessHours(
                      currentStore?.business_hours,
                    );
                    return (
                      <div key={storeName}>
                        {/* Store Header */}
                        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6 mb-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-black dark:text-white font-sora flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#3B82F6] rounded-lg"></div>
                                {storeName}
                                {/* NEW: Distance Badge */}
                                {distance !== null &&
                                  distance !== undefined && (
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg font-inter">
                                      <Navigation
                                        size={14}
                                        className="inline mr-1"
                                      />
                                      {formatDistance(distance)} narida
                                    </span>
                                  )}
                              </h2>

                              {/* Business Hours */}
                              {businessHoursText && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock
                                    size={14}
                                    className={
                                      storeStatus.isOpen
                                        ? "text-[#10B981]"
                                        : "text-[#EF4444]"
                                    }
                                  />
                                  <span
                                    className={`text-sm font-inter ${
                                      storeStatus.isOpen
                                        ? "text-[#10B981] dark:text-[#34D399]"
                                        : "text-[#EF4444] dark:text-[#F87171]"
                                    }`}
                                  >
                                    {storeStatus.text}
                                  </span>
                                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                                    • {businessHoursText}
                                  </span>
                                </div>
                              )}

                              {currentStore?.address && (
                                <div className="flex items-start gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter mb-3">
                                  <MapPin
                                    size={16}
                                    className="mt-0.5 flex-shrink-0"
                                  />
                                  <span>{currentStore.address}</span>
                                </div>
                              )}
                              {currentStore?.google_maps_url ? (
                                <button
                                  onClick={() =>
                                    window.open(
                                      currentStore.google_maps_url,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                  className="flex items-center gap-2 text-sm px-4 py-2 bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] rounded-lg hover:bg-[#DBEAFE] dark:hover:bg-[#1E40AF] transition-colors font-inter font-medium"
                                >
                                  <MapPin size={16} />
                                  Manzilni Google Mapsda ko'rish
                                </button>
                              ) : currentStore?.address ? (
                                <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] font-inter">
                                  Manzil mavjud emas
                                </p>
                              ) : null}
                            </div>
                            <button
                              onClick={() => navigateTo(`/store/${storeId}`)}
                              className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors font-inter"
                            >
                              Barcha mahsulotlarni ko'rish →
                            </button>
                          </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                          {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Reservation Modal */}
      {showModal && selectedProduct && selectedStore && (
        <ReservationModal
          product={selectedProduct}
          store={selectedStore}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
            setSelectedStore(null);
          }}
        />
      )}
    </div>
  );
}
