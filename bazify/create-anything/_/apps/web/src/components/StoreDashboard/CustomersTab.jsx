export function CustomersTab({ loyalCustomers }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6 font-sora">
        Sodiq Mijozlar
      </h1>

      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F3F3F3] dark:bg-[#262626]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Mijoz
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Telefon
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Bronlar soni
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Chegirma
                </th>
              </tr>
            </thead>
            <tbody>
              {loyalCustomers.map((customer, index) => (
                <tr
                  key={index}
                  className="border-t border-[#E6E6E6] dark:border-[#333333]"
                >
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {customer.customer_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {customer.customer_phone}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#3B82F6] font-sora">
                    {customer.reservation_count}
                  </td>
                  <td className="px-4 py-3">
                    {parseInt(customer.reservation_count) >= 2 && (
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#FEF3C7] dark:bg-[#78350F] text-[#F59E0B] dark:text-[#FCD34D] border border-[#FDE68A] dark:border-[#F59E0B] font-inter">
                        5% chegirma
                      </span>
                    )}
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
