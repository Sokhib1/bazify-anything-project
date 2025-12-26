import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Store } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";

export default function StoreDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      const response = await fetch(`/api/stores?storeId=${id}`);
      if (!response.ok) throw new Error("Do'kon topilmadi");
      return response.json();
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["store-products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products?storeId=${id}`);
      if (!response.ok) throw new Error("Mahsulotlarni olishda xatolik");
      return response.json();
    },
  });

  const openMap = () => {
    if (store?.google_maps_url) {
      Linking.openURL(store.google_maps_url);
    }
  };

  const isLoading = storeLoading || productsLoading;

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F3F3" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E6E6E6",
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={24} color="#000" />
          <Text style={{ fontSize: 16, color: "#6B7280" }}>Orqaga</Text>
        </TouchableOpacity>

        {store && (
          <View>
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
                  width: 40,
                  height: 40,
                  backgroundColor: "#3B82F6",
                  borderRadius: 10,
                }}
              />
              <Text style={{ fontSize: 24, fontWeight: "bold", flex: 1 }}>
                {store.name}
              </Text>
            </View>

            {store.address && (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                <MapPin size={16} color="#6B7280" style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 14, color: "#6B7280", flex: 1 }}>
                  {store.address}
                </Text>
              </View>
            )}

            {store.google_maps_url && (
              <TouchableOpacity
                onPress={openMap}
                style={{
                  backgroundColor: "#3B82F6",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <MapPin size={16} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
                >
                  Google Mapsda ochish
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : products.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Store size={48} color="#9CA3AF" />
            <Text style={{ color: "#6B7280", marginTop: 16, fontSize: 16 }}>
              Mahsulotlar topilmadi
            </Text>
          </View>
        ) : (
          products.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => router.push(`/reservation/${product.id}`)}
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
                      {Number(product.price).toLocaleString()} so'm
                    </Text>
                    {product.stock > 0 && (
                      <Text style={{ fontSize: 11, color: "#10B981" }}>
                        Omborda: {product.stock}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
