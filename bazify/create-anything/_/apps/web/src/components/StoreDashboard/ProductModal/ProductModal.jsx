import { X } from "lucide-react";
import { useProductModal } from "@/hooks/useProductModal";
import { ImageUpload } from "./ImageUpload";
import { ProductForm } from "./ProductForm";

export function ProductModal({ storeId, product, onClose }) {
  const {
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
  } = useProductModal(storeId, product);

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl max-w-2xl w-full border border-[#E6E6E6] dark:border-[#333333] my-8">
        <div className="flex items-center justify-between p-6 border-b border-[#E6E6E6] dark:border-[#333333]">
          <h2 className="text-xl font-bold text-black dark:text-white font-sora">
            {product ? "Mahsulotni tahrirlash" : "Mahsulot qo'shish"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-black dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, onClose)}
          className="p-6 space-y-5"
        >
          <ImageUpload
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            formData={formData}
            setFormData={setFormData}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            isUploading={isUploading}
            uploadImage={uploadImage}
          />

          <ProductForm formData={formData} setFormData={setFormData} />

          {error && (
            <div className="bg-[#FEE2E2] dark:bg-[#7F1D1D] border border-[#FCA5A5] dark:border-[#DC2626] rounded-lg p-3">
              <p className="text-sm text-[#DC2626] dark:text-[#FCA5A5] font-inter">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || isUploading}
            className="w-full py-4 bg-gradient-to-br from-[#10B981] to-[#059669] text-white text-lg font-bold rounded-xl hover:from-[#059669] hover:to-[#047857] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-inter shadow-lg shadow-green-500/30"
          >
            {mutation.isPending
              ? "Saqlanmoqda..."
              : product
                ? "✓ Saqlash"
                : "✓ Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}
