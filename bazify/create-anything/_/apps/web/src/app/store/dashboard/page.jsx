"use client";

import { useState } from "react";
import { useStoreAuth } from "@/hooks/useStoreAuth";
import {
  useStoreProducts,
  useStoreReservations,
  useStoreAnalytics,
  useUpdateReservation,
} from "@/hooks/useStoreData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/StoreDashboard/Sidebar";
import { TelegramWarningBanner } from "@/components/StoreDashboard/TelegramWarningBanner";
import { ProductsTab } from "@/components/StoreDashboard/ProductsTab";
import { ReservationsTab } from "@/components/StoreDashboard/ReservationsTab";
import { AnalyticsTab } from "@/components/StoreDashboard/AnalyticsTab";
import { CustomersTab } from "@/components/StoreDashboard/CustomersTab";
import { PromotionsTab } from "@/components/StoreDashboard/PromotionsTab";
import { ProductModal } from "@/components/StoreDashboard/ProductModal/ProductModal";
import { PromotionModal } from "@/components/StoreDashboard/PromotionModal";

export default function StoreDashboardPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const queryClient = useQueryClient();

  const { store, handleLogout } = useStoreAuth();
  const { data: products = [] } = useStoreProducts(store?.id);
  const { data: reservations = [] } = useStoreReservations(store?.id);
  const { data: analytics } = useStoreAnalytics(store?.id);
  const updateReservationMutation = useUpdateReservation();

  const { data: promotions = [] } = useQuery({
    queryKey: ["store-promotions", store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      const response = await fetch(`/api/promotions?storeId=${store.id}`);
      if (!response.ok) throw new Error("Aksiyalarni olishda xatolik");
      return response.json();
    },
    enabled: !!store?.id,
  });

  const togglePromotionMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await fetch("/api/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      if (!response.ok) throw new Error("Xatolik yuz berdi");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["store-promotions"]);
    },
  });

  if (!store) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex">
      <Sidebar
        store={store}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onSettings={() => (window.location.href = "/store/settings")}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {store && !store.telegram_chat_id && (
            <TelegramWarningBanner
              onSettings={() => (window.location.href = "/store/settings")}
            />
          )}

          {activeTab === "products" && (
            <ProductsTab
              products={products}
              storeId={store.id}
              onAddProduct={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
              onEditProduct={(product) => {
                setEditingProduct(product);
                setShowProductModal(true);
              }}
            />
          )}

          {activeTab === "reservations" && (
            <ReservationsTab
              reservations={reservations}
              onUpdateStatus={(id, status) =>
                updateReservationMutation.mutate({ id, status })
              }
            />
          )}

          {activeTab === "promotions" && (
            <PromotionsTab
              promotions={promotions}
              onAddPromotion={() => {
                setEditingPromotion(null);
                setShowPromotionModal(true);
              }}
              onEditPromotion={(promotion) => {
                setEditingPromotion(promotion);
                setShowPromotionModal(true);
              }}
              onToggleActive={(id, isActive) =>
                togglePromotionMutation.mutate({ id, isActive })
              }
            />
          )}

          {activeTab === "analytics" && <AnalyticsTab analytics={analytics} />}

          {activeTab === "customers" && (
            <CustomersTab loyalCustomers={analytics?.loyalCustomers || []} />
          )}
        </div>
      </div>

      {showProductModal && (
        <ProductModal
          storeId={store.id}
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showPromotionModal && (
        <PromotionModal
          storeId={store.id}
          products={products}
          promotion={editingPromotion}
          onClose={() => {
            setShowPromotionModal(false);
            setEditingPromotion(null);
          }}
        />
      )}
    </div>
  );
}
