import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Store, Shield, LogIn, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function MenuPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const menuItems = [
    {
      title: "Do'kon Kirish",
      subtitle: "Do'kon egasi sifatida kirish",
      icon: Store,
      color: "#3B82F6",
      route: "/owner/login",
    },
    {
      title: "Admin Panel",
      subtitle: "Do'konlarni tasdiqlash",
      icon: Shield,
      color: "#8B5CF6",
      route: "/admin/index",
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
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#000" }}>
          Menyu
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

            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 12,
            padding: 16,
            marginTop: 8,
            borderWidth: 1,
            borderColor: "#DBEAFE",
          }}
        >
          <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 20 }}>
            💡 Do'koningizni platformaga qo'shish uchun do'kon kirish bo'limidan
            ro'yxatdan o'ting.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
