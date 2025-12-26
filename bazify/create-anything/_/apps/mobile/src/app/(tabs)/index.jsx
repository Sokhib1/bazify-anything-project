import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import {
  Store as StoreIcon,
  ShoppingBag,
  MapPin,
  Search,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
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

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (!response.ok) throw new Error("Qidiruvda xatolik");
      const data = await response.json();
      return data.products || [];
    },
    enabled: searchQuery.trim().length > 0,
  });

  const handleSearch = (value) => {
    setSearchQuery(value);
    setIsSearching(value.trim().length > 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const displayProducts = isSearching ? searchResults : products;

  // Group products by store
  const productsByStore = displayProducts.reduce((acc, product) => {
    const storeName = product.store_name || "Noma'lum do'kon";
    if (!acc[storeName]) {
      acc[storeName] = { products: [], storeId: product.store_id };
    }
    acc[storeName].products.push(product);
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F3F3" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E6E6E6",
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#3B82F6",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StoreIcon size={24} color="#fff" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#000" }}>
            Bazify
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: "#F3F3F3",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E6E6E6",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
          }}
        >
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              fontSize: 15,
              color: "#000",
            }}
            placeholder="Mahsulot qidirish..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isSearching && (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
              Qidiruv natijalari
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              "{searchQuery}" uchun{" "}
              {searchLoading ? "..." : searchResults.length} ta mahsulot topildi
            </Text>
          </View>
        )}

        {(isSearching ? searchLoading : isLoading) ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 80,
            }}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : Object.keys(productsByStore).length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <ShoppingBag size={48} color="#9CA3AF" />
            <Text style={{ color: "#6B7280", marginTop: 16, fontSize: 16 }}>
              {isSearching
                ? "Hech narsa topilmadi"
                : "Hozircha mahsulotlar yo'q"}
            </Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 24 }}>
            {Object.entries(productsByStore).map(
              ([storeName, { products, storeId }]) => {
                const currentStore = stores.find((s) => s.id === storeId);
                return (
                  <View key={storeName}>
                    {/* Store Header - only show if not searching */}
                    {!isSearching && (
                      <View
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: 16,
                          padding: 16,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: "#E6E6E6",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              backgroundColor: "#3B82F6",
                              borderRadius: 8,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: "bold",
                              flex: 1,
                            }}
                          >
                            {storeName}
                          </Text>
                        </View>

                        {currentStore?.address && (
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              marginBottom: 12,
                            }}
                          >
                            <MapPin
                              size={16}
                              color="#6B7280"
                              style={{ marginTop: 2 }}
                            />
                            <Text
                              style={{
                                fontSize: 14,
                                color: "#6B7280",
                                flex: 1,
                              }}
                            >
                              {currentStore.address}
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity
                          onPress={() => router.push(`/store/${storeId}`)}
                          style={{
                            backgroundColor: "#EFF6FF",
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Text
                            style={{
                              color: "#3B82F6",
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            Barcha mahsulotlar →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Products */}
                    <View style={{ gap: 12 }}>
                      {(isSearching ? products : products.slice(0, 4)).map(
                        (product) => (
                          <TouchableOpacity
                            key={product.id}
                            onPress={() =>
                              router.push(`/reservation/${product.id}`)
                            }
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: 16,
                              overflow: "hidden",
                              borderWidth: 1,
                              borderColor: "#E6E6E6",
                            }}
                          >
                            <View style={{ flexDirection: "row" }}>
                              <Image
                                source={{
                                  uri:
                                    product.image_url ||
                                    "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400",
                                }}
                                style={{
                                  width: 120,
                                  height: 120,
                                  backgroundColor: "#F3F3F3",
                                }}
                              />
                              <View
                                style={{
                                  flex: 1,
                                  padding: 12,
                                  justifyContent: "space-between",
                                }}
                              >
                                <View>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: "600",
                                      color: "#000",
                                      marginBottom: 4,
                                    }}
                                    numberOfLines={2}
                                  >
                                    {product.name}
                                  </Text>
                                  {isSearching && (
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                        marginBottom: 4,
                                      }}
                                    >
                                      <StoreIcon size={12} color="#9CA3AF" />
                                      <Text
                                        style={{
                                          fontSize: 12,
                                          color: "#9CA3AF",
                                        }}
                                      >
                                        {product.store_name}
                                      </Text>
                                    </View>
                                  )}
                                  <Text
                                    style={{ fontSize: 13, color: "#6B7280" }}
                                    numberOfLines={2}
                                  >
                                    {product.description || "Mahsulot tavsifi"}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 18,
                                      fontWeight: "bold",
                                      color: "#3B82F6",
                                    }}
                                  >
                                    {Number(product.price).toLocaleString()}{" "}
                                    so'm
                                  </Text>
                                  {product.stock > 0 && (
                                    <Text
                                      style={{ fontSize: 11, color: "#10B981" }}
                                    >
                                      Omborda: {product.stock}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </View>
                );
              },
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
