"use client";

import { useState } from "react";
import { Store, ArrowLeft, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function StoreLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isAdmin }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kirishda xatolik");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (isAdmin) {
        localStorage.setItem("admin", JSON.stringify(data.user));
        window.location.href = "/admin";
      } else {
        localStorage.setItem("store", JSON.stringify(data.store));
        window.location.href = "/store/dashboard";
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-8 max-w-md w-full">
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#3B82F6] dark:hover:text-[#3B82F6] mb-6 font-inter"
        >
          <ArrowLeft size={20} />
          Orqaga
        </button>

        {/* Toggle Admin/Store */}
        <div className="flex gap-2 p-1 bg-[#F3F3F3] dark:bg-[#262626] rounded-lg mb-6">
          <button
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all font-inter ${
              !isAdmin
                ? "bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-sm"
                : "text-[#6B7280] dark:text-[#9CA3AF]"
            }`}
          >
            <Store size={16} className="inline mr-2" />
            Do'kon
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all font-inter ${
              isAdmin
                ? "bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-sm"
                : "text-[#6B7280] dark:text-[#9CA3AF]"
            }`}
          >
            <Shield size={16} className="inline mr-2" />
            Admin
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${isAdmin ? "from-[#DC2626] to-[#B91C1C]" : "from-[#3B82F6] to-[#2563EB]"} rounded-xl flex items-center justify-center`}
          >
            {isAdmin ? (
              <Shield size={24} className="text-white" />
            ) : (
              <Store size={24} className="text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white font-sora">
              {isAdmin ? "Admin Kirish" : "Do'kon Kirish"}
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              {isAdmin ? "Platformani boshqaring" : "Panelingizga kiring"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
              {isAdmin ? "Username" : "Email"}
            </label>
            <input
              type={isAdmin ? "text" : "email"}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              placeholder={isAdmin ? "admin" : "email@example.com"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
              Parol
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
              placeholder="Parolingizni kiriting"
            />
          </div>

          {error && (
            <div className="bg-[#FEE2E2] dark:bg-[#7F1D1D] border border-[#FCA5A5] dark:border-[#DC2626] rounded-lg p-3">
              <p className="text-sm text-[#DC2626] dark:text-[#FCA5A5] font-inter">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full py-3 bg-gradient-to-br ${isAdmin ? "from-[#DC2626] to-[#B91C1C]" : "from-[#3B82F6] to-[#2563EB]"} text-white font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-inter`}
          >
            {loginMutation.isPending ? "Kirilmoqda..." : "Kirish"}
          </button>

          {!isAdmin && (
            <p className="text-center text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Hali ro'yxatdan o'tmaganmisiz?{" "}
              <button
                type="button"
                onClick={() => (window.location.href = "/store/register")}
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium"
              >
                Ro'yxatdan o'tish
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
