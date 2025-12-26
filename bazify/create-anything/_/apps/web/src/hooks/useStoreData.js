import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useStoreProducts(storeId) {
  return useQuery({
    queryKey: ["store-products", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/products?storeId=${storeId}`);
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
    enabled: !!storeId,
  });
}

export function useStoreReservations(storeId) {
  return useQuery({
    queryKey: ["store-reservations", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/reservations?storeId=${storeId}`);
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
    enabled: !!storeId,
  });
}

export function useStoreAnalytics(storeId) {
  return useQuery({
    queryKey: ["store-analytics", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?storeId=${storeId}`);
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");
      return response.json();
    },
    enabled: !!storeId,
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("Yangilashda xatolik");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["store-reservations"]);
      queryClient.invalidateQueries(["store-analytics"]);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("O'chirishda xatolik");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["store-products"]);
    },
  });
}
