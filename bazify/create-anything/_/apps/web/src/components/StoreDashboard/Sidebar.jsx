import {
  Package,
  FileText,
  BarChart3,
  Users,
  LogOut,
  Settings,
  TrendingUp,
} from "lucide-react";

export function Sidebar({
  store,
  activeTab,
  onTabChange,
  onLogout,
  onSettings,
}) {
  return (
    <div className="w-64 bg-white dark:bg-[#1E1E1E] border-r border-[#E6E6E6] dark:border-[#333333] flex flex-col">
      <div className="p-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center mb-3">
          <Package size={24} className="text-white" />
        </div>
        <h2 className="font-bold text-lg text-black dark:text-white font-sora line-clamp-1">
          {store.name}
        </h2>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
          {store.email}
        </p>
      </div>

      <nav className="flex-1 px-4">
        <button
          onClick={() => onTabChange("products")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
            activeTab === "products"
              ? "bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA]"
              : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
          }`}
        >
          <Package size={20} />
          <span className="font-medium">Mahsulotlar</span>
        </button>

        <button
          onClick={() => onTabChange("reservations")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
            activeTab === "reservations"
              ? "bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA]"
              : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
          }`}
        >
          <FileText size={20} />
          <span className="font-medium">Bronlar</span>
        </button>

        <button
          onClick={() => onTabChange("promotions")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
            activeTab === "promotions"
              ? "bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA]"
              : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
          }`}
        >
          <TrendingUp size={20} />
          <span className="font-medium">Aksiyalar</span>
        </button>

        <button
          onClick={() => onTabChange("analytics")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
            activeTab === "analytics"
              ? "bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA]"
              : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
          }`}
        >
          <BarChart3 size={20} />
          <span className="font-medium">Analitika</span>
        </button>

        <button
          onClick={() => onTabChange("customers")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter ${
            activeTab === "customers"
              ? "bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA]"
              : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
          }`}
        >
          <Users size={20} />
          <span className="font-medium">Mijozlar</span>
        </button>

        <button
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all font-inter text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#262626]"
        >
          <Settings size={20} />
          <span className="font-medium">Sozlamalar</span>
        </button>
      </nav>

      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#DC2626] dark:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D] transition-all font-inter"
        >
          <LogOut size={20} />
          <span className="font-medium">Chiqish</span>
        </button>
      </div>
    </div>
  );
}
