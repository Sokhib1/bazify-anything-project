export function AnalyticsTab({ analytics }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6 font-sora">
        Analitika
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2 font-inter">
            Jami bronlar
          </p>
          <p className="text-4xl font-bold text-[#3B82F6] font-sora">
            {analytics?.totalReservations || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-6">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2 font-inter">
            Shu hafta
          </p>
          <p className="text-4xl font-bold text-[#10B981] dark:text-[#34D399] font-sora">
            {analytics?.weekReservations || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
