import { Plus, X, Link, Upload } from "lucide-react";
import { useState } from "react";

export function ImageUpload({
  imagePreview,
  setImagePreview,
  formData,
  setFormData,
  isDragging,
  setIsDragging,
  isUploading,
  uploadImage,
}) {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "url"
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      await uploadImage(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      await uploadImage(file);
    }
  };

  const handleUrlSubmit = () => {
    setUrlError("");

    if (!urlInput.trim()) {
      setUrlError("URL kiriting");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      setImagePreview(urlInput);
      setFormData({ ...formData, imageUrl: urlInput });
      setUrlInput("");
    } catch (e) {
      setUrlError("Noto'g'ri URL formati");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
        Mahsulot rasmi
      </label>

      {imagePreview ? (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl border-2 border-[#E6E6E6] dark:border-[#333333]"
          />
          <button
            type="button"
            onClick={() => {
              setImagePreview("");
              setFormData({ ...formData, imageUrl: "" });
            }}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all font-inter ${
                activeTab === "upload"
                  ? "bg-[#3B82F6] text-white"
                  : "bg-[#F3F4F6] dark:bg-[#262626] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#E5E7EB] dark:hover:bg-[#333333]"
              }`}
            >
              <Upload size={18} />
              Yuklash
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all font-inter ${
                activeTab === "url"
                  ? "bg-[#3B82F6] text-white"
                  : "bg-[#F3F4F6] dark:bg-[#262626] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#E5E7EB] dark:hover:bg-[#333333]"
              }`}
            >
              <Link size={18} />
              URL orqali
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? "border-[#3B82F6] bg-[#EFF6FF] dark:bg-[#1E3A5F]"
                  : "border-[#D1D5DB] dark:border-[#404040] hover:border-[#3B82F6]"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer block">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                      Yuklanmoqda...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-[#EFF6FF] dark:bg-[#1E3A5F] rounded-full flex items-center justify-center">
                      <Plus size={32} className="text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-black dark:text-white font-inter mb-1">
                        Rasmni bu yerga tashlang
                      </p>
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                        yoki bosing va tanlang
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* URL Tab */}
          {activeTab === "url" && (
            <div className="border-2 border-dashed border-[#D1D5DB] dark:border-[#404040] rounded-xl p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#EFF6FF] dark:bg-[#1E3A5F] rounded-full flex items-center justify-center">
                  <Link size={32} className="text-[#3B82F6]" />
                </div>
                <div className="w-full">
                  <p className="text-base font-medium text-black dark:text-white font-inter mb-3 text-center">
                    Rasm URL manzilini kiriting
                  </p>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUrlSubmit();
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter mb-3"
                  />
                  {urlError && (
                    <p className="text-sm text-red-500 mb-3 font-inter">
                      {urlError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleUrlSubmit}
                    className="w-full px-4 py-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white font-medium rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 transition-all font-inter"
                  >
                    URL qo'shish
                  </button>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter mt-3 text-center">
                    Masalan: Google Images, Pinterest yoki boshqa saytdan rasm
                    URL ni ko'chiring
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
