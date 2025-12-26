"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Store,
  Package,
  FileText,
  LogOut,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminPage() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("stores");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const adminData = localStorage.getItem("admin");
      if (!adminData) {
        window.location.href = "/store/login";
        return;
      }
      setAdmin(JSON.parse(adminData));
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/";
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingStores = stores.filter((s) => !s.approved);
  const approvedStores = stores.filter((s) => s.approved);

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-[#1E1E1E] border-r border-[#E6E6E6] dark:border-[#333333] flex flex-col">
        <div className="p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-xl flex items-center justify-center mb-3">
            <Shield size={24} className="text-white" />
          </div>
          <h2 className="font-bold text-lg text-black dark:text-white font-sora">
            Admin Panel
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
            Platformani boshqaring
          </p>
        </div>

        <nav className="flex-1 px-4">
          <button
            onClick={() => setActiveTab("stores")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
              activeTab === "stores"
                ? "bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171]"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
            }`}
          >
            <Store size={20} />
            <span className="font-medium">Do'konlar</span>
            {pendingStores.length > 0 && (
              <span className="ml-auto bg-[#DC2626] text-white text-xs px-2 py-0.5 rounded-full">
                {pendingStores.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
              activeTab === "products"
                ? "bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171]"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
            }`}
          >
            <Package size={20} />
            <span className="font-medium">Barcha Mahsulotlar</span>
          </button>

          <button
            onClick={() => setActiveTab("reservations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
              activeTab === "reservations"
                ? "bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171]"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
            }`}
          >
            <FileText size={20} />
            <span className="font-medium">Barcha Bronlar</span>
          </button>
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#DC2626] dark:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D] transition-all font-inter"
          >
            <LogOut size={20} />
            <span className="font-medium">Chiqish</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === "stores" && (
            <StoresTab
              stores={stores}
              pendingStores={pendingStores}
              approvedStores={approvedStores}
              onApprove={(storeId) =>
                updateStoreMutation.mutate({ storeId, approved: true })
              }
              onReject={(storeId) =>
                updateStoreMutation.mutate({ storeId, approved: false })
              }
            />
          )}

          {activeTab === "products" && <ProductsTab products={allProducts} />}

          {activeTab === "reservations" && (
            <ReservationsTab reservations={allReservations} />
          )}
        </div>
      </div>
    </div>
  );
}

function StoresTab({
  stores,
  pendingStores,
  approvedStores,
  onApprove,
  onReject,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const queryClient = useQueryClient();

  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId) => {
      const response = await fetch("/api/admin/stores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (!response.ok) throw new Error("O'chirishda xatolik");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-stores"]);
    },
  });

  const openInGoogleMaps = (store) => {
    if (store.google_maps_url) {
      window.open(store.google_maps_url, "_blank", "noopener,noreferrer");
    } else if (store.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white font-sora">
          Do'konlarni boshqarish
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] transition-all font-inter font-medium"
        >
          <Plus size={20} />
          Yangi do'kon qo'shish
        </button>
      </div>

      {/* Pending Stores */}
      {pendingStores.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4 font-sora">
            Tasdiqlanmagan do'konlar ({pendingStores.length})
          </h2>
          <div className="space-y-4">
            {pendingStores.map((store) => (
              <div
                key={store.id}
                className="bg-white dark:bg-[#1E1E1E] border border-[#FCA5A5] dark:border-[#DC2626] rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2 font-sora">
                      {store.name}
                    </h3>
                    <div className="space-y-1 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                      <p>👤 Egasi: {store.owner_name}</p>
                      <p>📧 Email: {store.email}</p>
                      <p>📱 Telefon: {store.phone}</p>
                      {store.address && (
                        <div>
                          <p>📍 Manzil: {store.address}</p>
                          {(store.google_maps_url || store.address) && (
                            <button
                              onClick={() => openInGoogleMaps(store)}
                              className="text-[#3B82F6] hover:text-[#2563EB] text-xs underline mt-1 flex items-center gap-1"
                            >
                              <MapPin size={12} />
                              Google Mapsda ochish
                            </button>
                          )}
                        </div>
                      )}
                      <p>
                        📅 Ro'yxatdan o'tgan:{" "}
                        {new Date(store.created_at).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onApprove(store.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#D1FAE5] dark:bg-[#065F46] text-[#10B981] dark:text-[#34D399] rounded-lg hover:bg-[#A7F3D0] dark:hover:bg-[#047857] transition-colors font-inter font-medium"
                    >
                      <Check size={18} />
                      Tasdiqlash
                    </button>
                    <button
                      onClick={() => onReject(store.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171] rounded-lg hover:bg-[#FECACA] dark:hover:bg-[#991B1B] transition-colors font-inter font-medium"
                    >
                      <X size={18} />
                      Rad etish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Stores */}
      <div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 font-sora">
          Barcha do'konlar ({approvedStores.length})
        </h2>
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F3F3F3] dark:bg-[#262626]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                    Do'kon nomi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                    Manzil
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                    Egasi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvedStores.map((store) => (
                  <tr
                    key={store.id}
                    className="border-t border-[#E6E6E6] dark:border-[#333333]"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-black dark:text-white font-inter">
                      {store.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                      {store.address ? (
                        <div className="flex flex-col gap-1">
                          <span>{store.address}</span>
                          {(store.google_maps_url || store.address) && (
                            <button
                              onClick={() => openInGoogleMaps(store)}
                              className="text-[#3B82F6] hover:text-[#2563EB] text-xs underline text-left flex items-center gap-1"
                            >
                              <MapPin size={12} />
                              {store.google_maps_url
                                ? "Google Maps linkda ochish"
                                : "Google Mapsda qidirish"}
                            </button>
                          )}
                        </div>
                      ) : (
                        "Manzil ko'rsatilmagan"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                      {store.owner_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                      {store.phone}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingStore(store)}
                          className="p-2 text-[#3B82F6] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A5F] rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
                              deleteStoreMutation.mutate(store.id);
                            }
                          }}
                          className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D] rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingStore) && (
        <StoreFormModal
          store={editingStore}
          onClose={() => {
            setShowAddModal(false);
            setEditingStore(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(["admin-stores"]);
            setShowAddModal(false);
            setEditingStore(null);
          }}
        />
      )}
    </div>
  );
}

function StoreFormModal({ store, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: store?.name || "",
    address: store?.address || "",
    ownerName: store?.owner_name || "",
    phone: store?.phone || "",
    email: store?.email || "",
  });
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const url = store ? "/api/admin/stores" : "/api/admin/stores";
      const method = store ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store ? { storeId: store.id, ...data } : data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Xatolik yuz berdi");
      }
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.address) {
      setError("Do'kon nomi va manzil majburiy");
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl max-w-md w-full border border-[#E6E6E6] dark:border-[#333333]">
        <div className="flex items-center justify-between p-6 border-b border-[#E6E6E6] dark:border-[#333333]">
          <h2 className="text-xl font-bold text-black dark:text-white font-sora">
            {store ? "Do'konni tahrirlash" : "Yangi do'kon qo'shish"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F3F3] dark:hover:bg-[#262626] transition-colors"
          >
            <X size={20} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
              Do'kon nomi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              placeholder="Texno Market"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
              To'liq manzil *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter resize-none"
              placeholder="Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 1-uy"
            />
          </div>

          {!store && (
            <>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                  Egasi nomi
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                  placeholder="Alisher Navoiy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                  placeholder="+998901234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
                  placeholder="info@texnomarket.uz"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-[#FEE2E2] dark:bg-[#7F1D1D] border border-[#FCA5A5] dark:border-[#DC2626] rounded-lg p-3">
              <p className="text-sm text-[#DC2626] dark:text-[#FCA5A5] font-inter">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full py-3 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-[0.98] transition-all disabled:opacity-50 font-inter"
          >
            {saveMutation.isPending
              ? "Saqlanmoqda..."
              : store
                ? "O'zgarishlarni saqlash"
                : "Do'kon qo'shish"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductsTab({ products }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6 font-sora">
        Barcha Mahsulotlar ({products.length})
      </h1>

      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F3F3F3] dark:bg-[#262626]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Mahsulot
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Do'kon
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Narxi
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Omborda
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-[#E6E6E6] dark:border-[#333333]"
                >
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    #{product.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-black dark:text-white font-inter">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    {product.store_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#3B82F6] font-sora font-semibold">
                    {Number(product.price).toLocaleString()} so'm
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    {product.stock} dona
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReservationsTab({ reservations }) {
  const getStatusColor = (status) => {
    if (status === "Tasdiqlangan")
      return "bg-[#D1FAE5] dark:bg-[#065F46] text-[#10B981] dark:text-[#34D399] border-[#A7F3D0] dark:border-[#10B981]";
    if (status === "Bekor qilingan")
      return "bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171] border-[#FECACA] dark:border-[#DC2626]";
    return "bg-[#FEF3C7] dark:bg-[#78350F] text-[#F59E0B] dark:text-[#FCD34D] border-[#FDE68A] dark:border-[#F59E0B]";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6 font-sora">
        Barcha Bronlar ({reservations.length})
      </h1>

      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F3F3F3] dark:bg-[#262626]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Do'kon
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Mijoz
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Telefon
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Mahsulot
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Vaqt
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Kod
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Telegram
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-t border-[#E6E6E6] dark:border-[#333333]"
                >
                  <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    {reservation.store_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {reservation.customer_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {reservation.customer_phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {reservation.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    {reservation.pickup_time}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#3B82F6] font-jetbrains">
                    {reservation.code}
                  </td>
                  <td className="px-4 py-3">
                    {reservation.telegram_notification_sent ? (
                      <div
                        className="flex items-center gap-1 text-[#10B981] dark:text-[#34D399]"
                        title="Yuborildi"
                      >
                        <Send size={14} />
                        <CheckCircle size={14} />
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 text-[#DC2626] dark:text-[#F87171]"
                        title={
                          reservation.telegram_notification_error ||
                          "Yuborilmadi"
                        }
                      >
                        <Send size={14} />
                        <XCircle size={14} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)} font-inter`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
