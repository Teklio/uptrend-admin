import { useState } from "react";
import { Users, UserCheck, BookOpen, Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useDashboardStats } from "../../services/dashboard.service";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { RecentPaymentsTable } from "../../components/dashboard/RecentPaymentsTable";
import { formatCurrency } from "../../utils/format.util";

const PERIODS = [
  { label: "7 days", value: "7d" as const },
  { label: "30 days", value: "30d" as const },
  { label: "90 days", value: "90d" as const },
];

const DashboardPage = () => {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading } = useDashboardStats({ period });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
          Dashboard
        </h1>
        <div className="flex rounded-xl p-1" style={{ backgroundColor: "#f0f0f0" }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className="rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
              style={{
                backgroundColor: period === p.value ? "#7e14ff" : "transparent",
                color: period === p.value ? "#fff" : "rgba(0,0,0,0.55)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total users"
          value={isLoading ? "—" : data?.users.total ?? 0}
          hint={isLoading ? undefined : `${data?.users.newInRange ?? 0} new in range`}
          icon={<Users size={17} color="#7e14ff" />}
        />
        <StatsCard
          label="Active users"
          value={isLoading ? "—" : data?.users.active ?? 0}
          icon={<UserCheck size={17} color="#7e14ff" />}
        />
        <StatsCard
          label="Total courses"
          value={isLoading ? "—" : data?.courses.total ?? 0}
          icon={<BookOpen size={17} color="#7e14ff" />}
        />
        <StatsCard
          label="Revenue (in range)"
          value={isLoading ? "—" : formatCurrency(data?.revenue.inRange ?? 0)}
          hint={isLoading ? undefined : `${formatCurrency(data?.revenue.allTime ?? 0)} all-time`}
          icon={<Wallet size={17} color="#7e14ff" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Successful payments"
          value={isLoading ? "—" : data?.payments.successful ?? 0}
          icon={<CheckCircle2 size={17} color="#16a34a" />}
        />
        <StatsCard
          label="Pending payments"
          value={isLoading ? "—" : data?.payments.pending ?? 0}
          icon={<Clock size={17} color="#ca8a04" />}
        />
        <StatsCard
          label="Failed payments"
          value={isLoading ? "—" : data?.payments.failed ?? 0}
          icon={<XCircle size={17} color="#dc2626" />}
        />
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold" style={{ color: "#191919" }}>
          Recent payments
        </h2>
        <RecentPaymentsTable data={data?.recentPayments} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardPage;
