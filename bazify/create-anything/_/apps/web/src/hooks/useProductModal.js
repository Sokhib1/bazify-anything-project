import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useProductModal(storeId, product) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || "",
    description: product?.description || "",
    imageUrl: product?.image_url || "",
    stock: product?.stock || 0,
    category: product?.category || "",
  });
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(product?.image_url || "");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = product ? "/api/products" : "/api/products";
      const method = product ? "PUT" : "POST";
      const body = product ? { id: product.id, ...data } : { storeId, ...data };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Xatolik yuz berdi");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["store-products"]);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e, onClose) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.price) {
      setError("Nomi va narxini to'ldiring");
      return;
    }

    mutation.mutate(formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const uploadImage = async (file) => {
    setIsUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append(
        "UPLOADCARE_PUB_KEY",
        process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "demopublickey",
      );

      const response = await fetch("https://upload.uploadcare.com/base/", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("Rasm yuklashda xatolik");

      const data = await response.json();
      const imageUrl = `https://ucarecdn.com/${data.file}/`;

      setFormData({ ...formData, imageUrl });
      setImagePreview(imageUrl);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Rasm yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    formData,
    setFormData,
    error,
    imagePreview,
    setImagePreview,
    isDragging,
    setIsDragging,
    isUploading,
    mutation,
    handleSubmit,
    uploadImage,
  };
}
