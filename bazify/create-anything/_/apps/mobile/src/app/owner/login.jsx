import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Store } from "lucide-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function OwnerLoginPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kirish muvaffaqiyatsiz");
      }

      if (!data.approved) {
        setError(
          "Do'koningiz hali tasdiqlanmagan. Iltimos, admin tomonidan tasdiqlanishini kuting.",
        );
        return;
      }

      // Save store data
      await AsyncStorage.setItem("store", JSON.stringify(data));

      router.replace("/owner/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#F3F3F3" }}
      behavior="padding"
    >
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
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <ArrowLeft size={24} color="#000" />
          <Text style={{ fontSize: 16, color: "#6B7280" }}>Orqaga</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: "#3B82F6",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Store size={32} color="#fff" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 4 }}>
            Do'kon Kirish
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>
            Do'kon egasi sifatida tizimga kiring
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
              Email *
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="store@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
              Parol *
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>

          {error && (
            <View
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "#FCA5A5",
              }}
            >
              <Text style={{ fontSize: 14, color: "#DC2626" }}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9CA3AF" : "#3B82F6",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
                Kirish
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            borderWidth: 1,
            borderColor: "#DBEAFE",
          }}
        >
          <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 20 }}>
            💡 Hisobingiz yo'qmi? Web versiyasidan ro'yxatdan o'ting:
            /store/register
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
