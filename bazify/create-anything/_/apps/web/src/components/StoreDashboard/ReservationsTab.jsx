import { Check, X, Send, CheckCircle, XCircle } from "lucide-react";

export function ReservationsTab({ reservations, onUpdateStatus }) {
  const getStatusColor = (status) => {
    if (status === "Tasdiqlangan")
      return "bg-[#D1FAE5] dark:bg-[#065F46] text-[#10B981] dark:text-[#34D399] border-[#A7F3D0] dark:border-[#10B981]";
    if (status === "Bekor qilingan")
      return "bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171] border-[#FECACA] dark:border-[#DC2626]";
    return "bg-[#FEF3C7] dark:bg-[#78350F] text-[#F59E0B] dark:text-[#FCD34D] border-[#FDE68A] dark:border-[#F59E0B]";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6 font-sora">
        Bronlar
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
                  Mahsulot
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Vaqt
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Kod
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Telegram
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white font-inter">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-t border-[#E6E6E6] dark:border-[#333333]"
                >
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {reservation.customer_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {reservation.customer_phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white font-inter">
                    {reservation.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                    {reservation.pickup_time}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#3B82F6] font-jetbrains">
                    {reservation.code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {reservation.telegram_notification_sent ? (
                        <div
                          className="flex items-center gap-1 text-[#10B981] dark:text-[#34D399]"
                          title="Telegram xabari yuborildi"
                        >
                          <Send size={14} />
                          <CheckCircle size={14} />
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1 text-[#DC2626] dark:text-[#F87171]"
                          title={
                            reservation.telegram_notification_error ||
                            "Telegram xabari yuborilmadi"
                          }
                        >
                          <Send size={14} />
                          <XCircle size={14} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)} font-inter`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {reservation.status === "Kutilmoqda" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            onUpdateStatus(reservation.id, "Tasdiqlangan")
                          }
                          className="p-1.5 bg-[#D1FAE5] dark:bg-[#065F46] text-[#10B981] dark:text-[#34D399] rounded hover:bg-[#A7F3D0] dark:hover:bg-[#047857] transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() =>
                            onUpdateStatus(reservation.id, "Bekor qilingan")
                          }
                          className="p-1.5 bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#F87171] rounded hover:bg-[#FECACA] dark:hover:bg-[#991B1B] transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
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
