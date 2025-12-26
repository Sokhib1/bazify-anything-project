import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Send,
  XCircle,
  Mail,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function ReservationPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "", // New field
    pickupTime: "",
  });
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products?id=${productId}`);
      if (!response.ok) throw new Error("Mahsulot topilmadi");
      const data = await response.json();
      return data[0];
    },
  });

  const { data: store } = useQuery({
    queryKey: ["store", product?.store_id],
    queryFn: async () => {
      const response = await fetch(`/api/stores?storeId=${product.store_id}`);
      if (!response.ok) throw new Error("Do'kon topilmadi");
      return response.json();
    },
    enabled: !!product?.store_id,
  });

  const createReservation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Bron qilishda xatolik");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setReservation(data);
      setStep(2);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = () => {
    setError("");

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.pickupTime
    ) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    createReservation.mutate({
      productId: product.id,
      storeId: product.store_id,
      ...formData,
    });
  };

  const openMap = () => {
    if (store?.google_maps_url) {
      Linking.openURL(store.google_maps_url);
    }
  };

  if (productLoading) {
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

  if (step === 2 && reservation) {
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
            onPress={() => router.push("/")}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <ArrowLeft size={24} color="#000" />
            <Text style={{ fontSize: 16, color: "#6B7280" }}>
              Asosiy sahifaga
            </Text>
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
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor: "#D1FAE5",
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <CheckCircle size={32} color="#10B981" />
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Bron muvaffaqiyatli!
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Sizning bron kodingiz:
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: "#3B82F6",
                letterSpacing: 4,
              }}
            >
              {reservation.code}
            </Text>
          </View>

          {/* Telegram Status */}
          {reservation.telegram_notification_sent ? (
            <View
              style={{
                backgroundColor: "#D1FAE5",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: "row",
                gap: 12,
                borderWidth: 1,
                borderColor: "#A7F3D0",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#10B981",
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#065F46",
                    marginBottom: 4,
                  }}
                >
                  Bron muvaffaqiyatli yuborildi!
                </Text>
                <Text style={{ fontSize: 12, color: "#047857" }}>
                  Do'kon egasiga Telegram orqali xabar jo'natildi.
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: "row",
                gap: 12,
                borderWidth: 1,
                borderColor: "#FECACA",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#DC2626",
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XCircle size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#7F1D1D",
                    marginBottom: 4,
                  }}
                >
                  Bron qabul qilindi
                </Text>
                <Text style={{ fontSize: 12, color: "#991B1B" }}>
                  Telegram xabar yuborilmadi.
                </Text>
              </View>
            </View>
          )}

          {/* Email Status */}
          {reservation.email_sent && reservation.customer_email && (
            <View
              style={{
                backgroundColor: "#D1FAE5",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: "row",
                gap: 12,
                borderWidth: 1,
                borderColor: "#A7F3D0",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#10B981",
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mail size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#065F46",
                    marginBottom: 4,
                  }}
                >
                  Email tasdiqlash yuborildi!
                </Text>
                <Text style={{ fontSize: 12, color: "#047857" }}>
                  {reservation.customer_email} manziliga xabar yuborildi.
                </Text>
              </View>
            </View>
          )}

          {/* Store Info */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#E6E6E6",
            }}
          >
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
              📍 Olib ketish joyi:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
              {store?.name}
            </Text>
            {store?.address && (
              <Text
                style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}
              >
                {store.address}
              </Text>
            )}
            {store?.google_maps_url && (
              <TouchableOpacity
                onPress={openMap}
                style={{
                  backgroundColor: "#3B82F6",
                  paddingVertical: 12,
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

          {/* Info */}
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#DBEAFE",
            }}
          >
            <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 20 }}>
              <Text style={{ fontWeight: "600" }}>Eslatma:</Text> Mahsulotni
              olish uchun ushbu kodni do'konda ko'rsating.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/")}
            style={{
              backgroundColor: "#F3F3F3",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
              Asosiy sahifaga qaytish
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

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
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
          Bron qilish
        </Text>

        {/* Product Info */}
        {product && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#E6E6E6",
            }}
          >
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Image
                source={{
                  uri:
                    product.image_url ||
                    "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400",
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  backgroundColor: "#F3F3F3",
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}
                >
                  {product.name}
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#3B82F6" }}
                >
                  {Number(product.price).toLocaleString()} so'm
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Store Info */}
        {store && (
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#DBEAFE",
            }}
          >
            <Text style={{ fontSize: 12, color: "#1E40AF", marginBottom: 8 }}>
              📍 Olib ketish joyi:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
              {store.name}
            </Text>
            {store.address && (
              <Text
                style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}
              >
                {store.address}
              </Text>
            )}
            {store.google_maps_url && (
              <TouchableOpacity
                onPress={openMap}
                style={{
                  backgroundColor: "#3B82F6",
                  paddingVertical: 10,
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

        {/* Form */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
              Ismingiz *
            </Text>
            <TextInput
              value={formData.customerName}
              onChangeText={(text) =>
                setFormData({ ...formData, customerName: text })
              }
              placeholder="To'liq ismingizni kiriting"
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
              Telefon raqamingiz *
            </Text>
            <TextInput
              value={formData.customerPhone}
              onChangeText={(text) =>
                setFormData({ ...formData, customerPhone: text })
              }
              placeholder="+998901234567"
              keyboardType="phone-pad"
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
              Email manzilingiz (ixtiyoriy)
            </Text>
            <TextInput
              value={formData.customerEmail}
              onChangeText={(text) =>
                setFormData({ ...formData, customerEmail: text })
              }
              placeholder="example@email.com"
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
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
              Email orqali tasdiqlash xabarini olish uchun
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
              Olib ketish vaqti *
            </Text>
            <View style={{ gap: 8 }}>
              {[
                "Bugun 18:00 gacha",
                "Ertaga ertalab",
                "Ertaga tushdan keyin",
              ].map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setFormData({ ...formData, pickupTime: time })}
                  style={{
                    backgroundColor:
                      formData.pickupTime === time ? "#3B82F6" : "#fff",
                    borderWidth: 1,
                    borderColor:
                      formData.pickupTime === time ? "#3B82F6" : "#D1D5DB",
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: formData.pickupTime === time ? "#fff" : "#000",
                      fontWeight: formData.pickupTime === time ? "600" : "400",
                    }}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
            onPress={handleSubmit}
            disabled={createReservation.isPending}
            style={{
              backgroundColor: createReservation.isPending
                ? "#9CA3AF"
                : "#3B82F6",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            {createReservation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
                Tasdiqlash
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
