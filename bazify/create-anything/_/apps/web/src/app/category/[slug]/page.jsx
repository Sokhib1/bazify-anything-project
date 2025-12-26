"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Store,
  TrendingUp,
  Filter,
  ChevronDown,
  X,
  Navigation,
  Clock,
} from "lucide-react";
import ReservationModal from "@/components/ReservationModal";
import PriceComparisonModal from "@/components/PriceComparisonModal";
import {
  getUserLocation,
  sortStoresByDistance,
  formatDistance,
} from "@/utils/geolocation";
import { formatBusinessHours, getStoreStatus } from "@/utils/businessHours";

const CATEGORIES = [
  { name: "Konditsionerlar", slug: "konditsionerlar", icon: "❄️", emoji: "❄️" },
  { name: "Muzlatgichlar", slug: "muzlatgichlar", icon: "🧊", emoji: "🧊" },
  { name: "Televizorlar", slug: "televizorlar", icon: "📺", emoji: "📺" },
  {
    name: "Kir yuvish mashinalari",
    slug: "kir-yuvish",
    icon: "🧺",
    emoji: "🧺",
  },
  { name: "Gaz plitalar", slug: "gaz-plitalar", icon: "🔥", emoji: "🔥" },
  { name: "Changyutgichlar", slug: "changyutgichlar", icon: "🌪️", emoji: "🌪️" },
  { name: "Boshqalar", slug: "boshqalar", icon: "📦", emoji: "📦" },
];

export default function CategoryPage({ params }) {
  const { slug } = params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [compareProduct, setCompareProduct] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Filters
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["category-products", slug],
    queryFn: async () => {
      const response = await fetch(
        `/api/products/with-promotions?category=${encodeURIComponent(category?.name || "")}`,
      );
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
    enabled: !!category,
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

  // Extract unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set();
    products.forEach((p) => {
      // Try to extract brand from product name (first word usually)
      const words = p.name.split(" ");
      if (words.length > 0) {
        brandSet.add(words[0]);
      }
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // Filter products with distance consideration
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const price = product.discounted_price || product.price;

        // Price filter
        if (price < priceRange[0] || price > priceRange[1]) return false;

        // Brand filter
        if (selectedBrands.length > 0) {
          const productBrand = product.name.split(" ")[0];
          if (!selectedBrands.includes(productBrand)) return false;
        }

        // Store filter
        if (selectedStores.length > 0) {
          if (!selectedStores.includes(product.store_id)) return false;
        }

        return true;
      })
      .map((product) => {
        // Add distance info to products
        const store = sortedStores.find((s) => s.id === product.store_id);
        return { ...product, distance: store?.distance };
      })
      .sort((a, b) => {
        // Sort by distance if available
        if (userLocation) {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [
    products,
    priceRange,
    selectedBrands,
    selectedStores,
    sortedStores,
    userLocation,
  ]);

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

  const handleReserve = (product) => {
    const store = stores.find((s) => s.id === product.store_id);
    setSelectedProduct(product);
    setSelectedStore(store);
    setShowModal(true);
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

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const toggleStore = (storeId) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((s) => s !== storeId)
        : [...prev, storeId],
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 50000000]);
    setSelectedBrands([]);
    setSelectedStores([]);
  };

  const ProductCard = ({ product }) => {
    const hasPromotion = !!product.promotion_id;
    const displayPrice = hasPromotion
      ? product.discounted_price
      : product.price;
    const originalPrice = product.price;
    const store = sortedStores.find((s) => s.id === product.store_id);
    const storeStatus = getStoreStatus(store?.business_hours);

    return (
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
        <div className="aspect-square bg-[#F3F3F3] dark:bg-[#262626] overflow-hidden relative">
          <img
            src={
              product.image_url ||
              "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {hasPromotion && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white text-xs font-bold rounded-lg shadow-lg">
              {product.discount_type === "percentage"
                ? `-${product.discount_value}%`
                : "Chegirma!"}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg text-black dark:text-white mb-2 font-inter line-clamp-2 h-14">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mb-3">
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

          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1 font-inter">
              <Store size={14} />
              <a
                href={`/store/${product.store_id}`}
                className="hover:text-[#3B82F6] transition-colors hover:underline flex-1"
              >
                {product.store_name}
              </a>
              {/* Distance Badge */}
              {store?.distance !== null && store?.distance !== undefined && (
                <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded font-medium">
                  {formatDistance(store.distance)}
                </span>
              )}
            </div>

            {/* Store Status */}
            {store?.business_hours && (
              <div className="flex items-center gap-1 text-xs font-inter">
                <Clock
                  size={12}
                  className={
                    storeStatus.isOpen ? "text-[#10B981]" : "text-[#EF4444]"
                  }
                />
                <span
                  className={
                    storeStatus.isOpen
                      ? "text-[#10B981] dark:text-[#34D399]"
                      : "text-[#EF4444] dark:text-[#F87171]"
                  }
                >
                  {storeStatus.text}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleReserve(product)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white text-sm font-medium rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 transition-all font-inter shadow-lg"
            >
              Bron qilish
            </button>
            <button
              onClick={() => handleCompare(product)}
              className="px-3 py-2.5 bg-[#F3F3F3] dark:bg-[#0A0A0A] text-[#6B7280] dark:text-[#9CA3AF] text-sm font-medium rounded-lg hover:bg-[#E6E6E6] dark:hover:bg-[#262626] transition-colors font-inter flex items-center gap-1"
              title="Narxlarni taqqoslash"
            >
              <TrendingUp size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white font-sora mb-2">
            Kategoriya topilmadi
          </h1>
          <a href="/" className="text-[#3B82F6] hover:underline font-inter">
            Bosh sahifaga qaytish
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-[#E6E6E6] dark:border-[#333333] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
                <Store size={20} className="text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-black dark:text-white font-sora">
                Bazify
              </h1>
            </a>
            <div className="flex gap-2">
              {/* Location Button */}
              <button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors font-inter flex items-center gap-2 ${
                  userLocation
                    ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151]"
                }`}
              >
                <Navigation
                  size={16}
                  className={isGettingLocation ? "animate-spin" : ""}
                />
                {userLocation ? "Yaqin" : "Joylashuv"}
              </button>

              <a
                href="/store/login"
                className="px-4 py-2 text-sm font-medium text-[#3B82F6] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A5F] rounded-lg transition-colors font-inter"
              >
                Do'kon Kirish
              </a>
            </div>
          </div>

          {/* Location Status */}
          {userLocation && (
            <div className="mt-4 flex items-center justify-between bg-[#EFF6FF] dark:bg-[#1E3A5F] rounded-lg px-4 py-2">
              <span className="text-sm text-[#3B82F6] font-inter font-medium">
                <Navigation size={14} className="inline mr-1" />
                Yaqin do'konlar birinchi ko'rsatiladi
              </span>
              <button
                onClick={() => {
                  setUserLocation(null);
                  localStorage.removeItem("userLocation");
                }}
                className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-black dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm">
              {category.emoji}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-sora mb-2">
                {category.name}
              </h1>
              <p className="text-white/90 font-inter">
                {isLoading
                  ? "Yuklanmoqda..."
                  : `${filteredProducts.length} ta mahsulot topildi`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6 sticky top-24 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black dark:text-white font-sora flex items-center gap-2">
                  <Filter size={20} />
                  Filtrlar
                </h2>
                {(selectedBrands.length > 0 || selectedStores.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#EF4444] hover:text-[#DC2626] font-inter font-medium"
                  >
                    Tozalash
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6 pb-6 border-b border-[#E6E6E6] dark:border-[#333333]">
                <h3 className="font-semibold text-black dark:text-white mb-3 font-inter">
                  Narx oralig'i
                </h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                    className="w-full accent-[#3B82F6]"
                  />
                  <div className="flex items-center justify-between text-sm font-inter">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                      0 so'm
                    </span>
                    <span className="font-semibold text-[#3B82F6]">
                      {priceRange[1].toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="mb-6 pb-6 border-b border-[#E6E6E6] dark:border-[#333333]">
                  <h3 className="font-semibold text-black dark:text-white mb-3 font-inter">
                    Brend
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 accent-[#3B82F6] cursor-pointer"
                        />
                        <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-black dark:group-hover:text-white transition-colors font-inter">
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stores */}
              {stores.length > 0 && (
                <div>
                  <h3 className="font-semibold text-black dark:text-white mb-3 font-inter">
                    Do'konlar
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {stores.map((store) => (
                      <label
                        key={store.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(store.id)}
                          onChange={() => toggleStore(store.id)}
                          className="w-4 h-4 accent-[#3B82F6] cursor-pointer"
                        />
                        <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-black dark:group-hover:text-white transition-colors font-inter">
                          {store.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Filter size={24} />
            </button>
          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFilters(false)}
            >
              <div
                className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#1E1E1E] p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-black dark:text-white font-sora">
                    Filtrlar
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-[#6B7280] hover:text-black dark:hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                {/* Same filter content as desktop */}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333]">
                <div className="text-6xl mb-4">{category.emoji}</div>
                <h3 className="text-xl font-bold text-black dark:text-white font-sora mb-2">
                  Mahsulotlar topilmadi
                </h3>
                <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter mb-4">
                  Ushbu kategoriyada hozircha mahsulotlar yo'q
                </p>
                {(selectedBrands.length > 0 || selectedStores.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors font-inter font-medium"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
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

      {showCompareModal && compareProduct && (
        <PriceComparisonModal
          product={compareProduct}
          onClose={() => {
            setShowCompareModal(false);
            setCompareProduct(null);
          }}
          onReserve={handleReserveFromComparison}
        />
      )}
    </div>
  );
}
