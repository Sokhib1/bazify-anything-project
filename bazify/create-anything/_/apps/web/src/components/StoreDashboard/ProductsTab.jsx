import { Plus, Pencil, Trash2 } from "lucide-react";
import { useDeleteProduct } from "@/hooks/useStoreData";

export function ProductsTab({
  products,
  storeId,
  onAddProduct,
  onEditProduct,
}) {
  const deleteProductMutation = useDeleteProduct();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white font-sora">
          Mahsulotlar
        </h1>
        <button
          onClick={onAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] transition-all font-inter"
        >
          <Plus size={20} />
          Mahsulot qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-4"
          >
            <img
              src={
                product.image_url ||
                "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400"
              }
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="font-semibold text-black dark:text-white mb-1 font-inter">
              {product.name}
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2 line-clamp-2 font-inter">
              {product.description}
            </p>
            <p className="text-lg font-bold text-[#3B82F6] mb-2 font-sora">
              {Number(product.price).toLocaleString()} so'm
            </p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 font-inter">
              Omborda: {product.stock} dona
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onEditProduct(product)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA] rounded-lg hover:bg-[#DBEAFE] dark:hover:bg-[#1E40AF] transition-colors font-inter text-sm"
              >
                <Pencil size={16} />
                Tahrirlash
              </button>
              <button
                onClick={() => deleteProductMutation.mutate(product.id)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171] rounded-lg hover:bg-[#FECACA] dark:hover:bg-[#991B1B] transition-colors font-inter text-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
