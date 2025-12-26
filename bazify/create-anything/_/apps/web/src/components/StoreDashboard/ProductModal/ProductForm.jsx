const categories = [
  "Konditsionerlar",
  "Muzlatgichlar",
  "Televizorlar",
  "Kir yuvish mashinalari",
  "Gaz plitalar",
  "Changyutgichlar",
  "Boshqalar",
];

export function ProductForm({ formData, setFormData }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
            Nomi *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
            placeholder="Samsung Galaxy S24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
            Kategoriya *
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
          >
            <option value="">Kategoriyani tanlang</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
            Narxi (so'm) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
            Omborda
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-2 font-inter">
          Tavsif
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2.5 bg-white dark:bg-[#262626] border border-[#D1D5DB] dark:border-[#404040] rounded-lg text-black dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors font-inter"
          rows="3"
          placeholder="Mahsulot haqida ma'lumot"
        />
      </div>
    </>
  );
}
