import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import {
  Store,
  Package,
  ClipboardList,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OwnerDashboardPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [store, setStore] = useState(null);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    const storeData = await AsyncStorage.getItem("store");
    if (!storeData) {
      router.replace("/owner/login");
      return;
    }
    setStore(JSON.parse(storeData));
  };

  const { data: stats } = useQuery({
    queryKey: ["store-stats", store?.id],
    queryFn: async () => {
      const [productsRes, reservationsRes] = await Promise.all([
        fetch(`/api/products?storeId=${store.id}`),
        fetch(`/api/reservations?storeId=${store.id}`),
      ]);

      const products = await productsRes.json();
      const reservations = await reservationsRes.json();

      return {
        totalProducts: products.length,
        totalReservations: reservations.length,
        pendingReservations: reservations.filter(
          (r) => r.status === "Kutilmoqda",
        ).length,
      };
    },
    enabled: !!store?.id,
  });

  const handleLogout = async () => {
    await AsyncStorage.removeItem("store");
    router.replace("/owner/login");
  };

  if (!store) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F3F3F3",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const menuItems = [
    {
      title: "Mahsulotlar",
      subtitle: `${stats?.totalProducts || 0} ta mahsulot`,
      icon: Package,
      color: "#3B82F6",
      route: "/owner/products",
    },
    {
      title: "Bronlar",
      subtitle: `${stats?.pendingReservations || 0} ta kutilmoqda`,
      icon: ClipboardList,
      color: "#10B981",
      route: "/owner/reservations",
    },
    {
      title: "Sozlamalar",
      subtitle: "Telegram va manzil",
      icon: Settings,
      color: "#6B7280",
      route: "/owner/settings",
    },
  ];

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
            marginBottom: 8,
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
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {store.name}
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>
              Do'kon boshqaruvi
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#E6E6E6",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <TrendingUp size={20} color="#3B82F6" />
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Statistika</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 28, fontWeight: "bold", color: "#3B82F6" }}
              >
                {stats?.totalProducts || 0}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                Mahsulotlar
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#E6E6E6" }} />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 28, fontWeight: "bold", color: "#10B981" }}
              >
                {stats?.totalReservations || 0}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                Jami Bronlar
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.route)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E6E6E6",
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                backgroundColor: item.color,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon size={28} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "#000",
                  marginBottom: 2,
                }}
              >
                {item.title}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                {item.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#FEE2E2",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 8,
            borderWidth: 1,
            borderColor: "#FCA5A5",
          }}
        >
          <LogOut size={20} color="#DC2626" />
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#DC2626" }}>
            Chiqish
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
