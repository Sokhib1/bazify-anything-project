import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Store, MapPin, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";

export default function StoresPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores");
      if (!response.ok) throw new Error("Do'konlarni olishda xatolik");
      return response.json();
    },
  });

  const openMap = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

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
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#000" }}>
          Do'konlar
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Barcha tasdiqlangan do'konlar ro'yxati
        </Text>
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
        ) : stores.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Store size={48} color="#9CA3AF" />
            <Text style={{ color: "#6B7280", marginTop: 16, fontSize: 16 }}>
              Do'konlar topilmadi
            </Text>
          </View>
        ) : (
          stores.map((store) => (
            <View
              key={store.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E6E6E6",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
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
                  <Store size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}
                  >
                    {store.name}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}
                  >
                    {store.owner_name}
                  </Text>
                </View>
              </View>

              {store.address && (
                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}
                >
                  <MapPin size={16} color="#6B7280" style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 14, color: "#6B7280", flex: 1 }}>
                    {store.address}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 8 }}>
                {store.google_maps_url && (
                  <TouchableOpacity
                    onPress={() => openMap(store.google_maps_url)}
                    style={{
                      flex: 1,
                      backgroundColor: "#EFF6FF",
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <MapPin size={16} color="#3B82F6" />
                    <Text
                      style={{
                        color: "#3B82F6",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      Xaritada
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => router.push(`/store/${store.id}`)}
                  style={{
                    flex: 1,
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
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
                  >
                    Mahsulotlar
                  </Text>
                  <ChevronRight size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
