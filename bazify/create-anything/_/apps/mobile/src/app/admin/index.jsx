import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  ArrowLeft,
  Store,
  Package,
  FileText,
  LogOut,
  Check,
  X,
  MapPin,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function AdminPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("stores");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    const adminData = await AsyncStorage.getItem("admin");
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError("Barcha maydonlarni to'ldiring");
      return;
    }

    setLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kirish muvaffaqiyatsiz");
      }

      // Check if this is an admin account (you might want to add an is_admin field)
      // For now, we'll just save it as admin
      await AsyncStorage.setItem("admin", JSON.stringify(data));
      setAdmin(data);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("admin");
    setAdmin(null);
    setLoginEmail("");
    setLoginPassword("");
  };

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stores");
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
    enabled: !!admin,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
    enabled: !!admin,
  });

  const { data: allReservations = [] } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const response = await fetch("/api/reservations");
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
    enabled: !!admin,
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ storeId, approved }) => {
      const response = await fetch("/api/admin/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, approved }),
      });
      if (!response.ok) throw new Error("Yangilashda xatolik");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-stores"]);
    },
  });

  const openMap = (store) => {
    if (store.google_maps_url) {
      Linking.openURL(store.google_maps_url);
    }
  };

  // Login Screen
  if (!admin) {
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
                backgroundColor: "#8B5CF6",
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Shield size={32} color="#fff" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 4 }}>
              Admin Panel
            </Text>
            <Text
              style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}
            >
              Platformani boshqarish uchun kirish
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <View>
              <Text
                style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}
              >
                Email *
              </Text>
              <TextInput
                value={loginEmail}
                onChangeText={setLoginEmail}
                placeholder="admin@example.com"
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
              <Text
                style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}
              >
                Parol *
              </Text>
              <TextInput
                value={loginPassword}
                onChangeText={setLoginPassword}
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

            {loginError && (
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#FCA5A5",
                }}
              >
                <Text style={{ fontSize: 14, color: "#DC2626" }}>
                  {loginError}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loggingIn}
              style={{
                backgroundColor: loggingIn ? "#9CA3AF" : "#8B5CF6",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              {loggingIn ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                >
                  Kirish
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    );
  }

  const pendingStores = stores.filter((s) => !s.approved);
  const approvedStores = stores.filter((s) => s.approved);

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
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#8B5CF6",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Admin Panel
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>
              Platformani boshqaring
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setActiveTab("stores")}
            style={{
              flex: 1,
              backgroundColor: activeTab === "stores" ? "#8B5CF6" : "#F3F3F3",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: activeTab === "stores" ? "#fff" : "#6B7280",
              }}
            >
              Do'konlar{" "}
              {pendingStores.length > 0 && `(${pendingStores.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("products")}
            style={{
              flex: 1,
              backgroundColor: activeTab === "products" ? "#8B5CF6" : "#F3F3F3",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: activeTab === "products" ? "#fff" : "#6B7280",
              }}
            >
              Mahsulotlar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("reservations")}
            style={{
              flex: 1,
              backgroundColor:
                activeTab === "reservations" ? "#8B5CF6" : "#F3F3F3",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: activeTab === "reservations" ? "#fff" : "#6B7280",
              }}
            >
              Bronlar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "stores" && (
          <View style={{ gap: 12 }}>
            {/* Pending Stores */}
            {pendingStores.length > 0 && (
              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
                >
                  Tasdiqlanmagan ({pendingStores.length})
                </Text>
                {pendingStores.map((store) => (
                  <View
                    key={store.id}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "#FCA5A5",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "bold",
                        marginBottom: 8,
                      }}
                    >
                      {store.name}
                    </Text>
                    <View style={{ gap: 4, marginBottom: 12 }}>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        👤 {store.owner_name}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        📧 {store.email}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        📱 {store.phone}
                      </Text>
                      {store.address && (
                        <Text style={{ fontSize: 13, color: "#6B7280" }}>
                          📍 {store.address}
                        </Text>
                      )}
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {store.google_maps_url && (
                        <TouchableOpacity
                          onPress={() => openMap(store)}
                          style={{
                            flex: 1,
                            backgroundColor: "#EFF6FF",
                            paddingVertical: 10,
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
                              fontSize: 13,
                              fontWeight: "600",
                            }}
                          >
                            Xarita
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() =>
                          updateStoreMutation.mutate({
                            storeId: store.id,
                            approved: true,
                          })
                        }
                        style={{
                          flex: 1,
                          backgroundColor: "#D1FAE5",
                          paddingVertical: 10,
                          borderRadius: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Check size={16} color="#10B981" />
                        <Text
                          style={{
                            color: "#10B981",
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          Tasdiqlash
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          updateStoreMutation.mutate({
                            storeId: store.id,
                            approved: false,
                          })
                        }
                        style={{
                          backgroundColor: "#FEE2E2",
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Approved Stores */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 12,
                marginTop: pendingStores.length > 0 ? 12 : 0,
              }}
            >
              Tasdiqlangan ({approvedStores.length})
            </Text>
            {approvedStores.map((store) => (
              <View
                key={store.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E6E6E6",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 17, fontWeight: "bold", marginBottom: 4 }}
                >
                  {store.name}
                </Text>
                <Text
                  style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}
                >
                  {store.owner_name}
                </Text>
                {store.address && (
                  <View
                    style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}
                  >
                    <MapPin
                      size={14}
                      color="#6B7280"
                      style={{ marginTop: 2 }}
                    />
                    <Text style={{ fontSize: 13, color: "#6B7280", flex: 1 }}>
                      {store.address}
                    </Text>
                  </View>
                )}
                {store.google_maps_url && (
                  <TouchableOpacity
                    onPress={() => openMap(store)}
                    style={{
                      backgroundColor: "#EFF6FF",
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      alignSelf: "flex-start",
                    }}
                  >
                    <MapPin size={14} color="#3B82F6" />
                    <Text
                      style={{
                        color: "#3B82F6",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Xaritada ko'rish
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === "products" && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
              Barcha Mahsulotlar ({allProducts.length})
            </Text>
            {allProducts.map((product) => (
              <View
                key={product.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E6E6E6",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}
                >
                  {product.name}
                </Text>
                <Text
                  style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}
                >
                  {product.store_name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    Omborda: {product.stock}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === "reservations" && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
              Barcha Bronlar ({allReservations.length})
            </Text>
            {allReservations.map((reservation) => {
              const getStatusColor = () => {
                if (reservation.status === "Tasdiqlangan")
                  return { bg: "#D1FAE5", text: "#10B981", border: "#A7F3D0" };
                if (reservation.status === "Bekor qilingan")
                  return { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" };
                return { bg: "#FEF3C7", text: "#F59E0B", border: "#FDE68A" };
              };
              const colors = getStatusColor();

              return (
                <View
                  key={reservation.id}
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
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        {reservation.customer_name}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        {reservation.store_name}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: colors.bg,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: colors.text,
                        }}
                      >
                        {reservation.status}
                      </Text>
                    </View>
                  </View>

                  <View style={{ gap: 4, marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      📦 {reservation.product_name}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      📱 {reservation.customer_phone}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      ⏰ {reservation.pickup_time}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#3B82F6",
                        letterSpacing: 2,
                      }}
                    >
                      {reservation.code}
                    </Text>
                    {reservation.telegram_notification_sent ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Send size={14} color="#10B981" />
                        <CheckCircle size={14} color="#10B981" />
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Send size={14} color="#DC2626" />
                        <XCircle size={14} color="#DC2626" />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Logout Button */}
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
            marginTop: 20,
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
