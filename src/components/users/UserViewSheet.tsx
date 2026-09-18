import { Phone, MapPin, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shared/Sheet";
import { DetailSection } from "../shared/DetailSection";
import { InfoRow } from "../shared/InfoRow";
import { StatusBadge } from "../shared/StatusBadge";
import { useGetUser } from "../../services/user.service";
import { formatCurrency, formatDate } from "../../utils/format.util";

interface UserViewSheetProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

const initials = (name: string | null, email: string) => (name || email).trim().slice(0, 2).toUpperCase();

export const UserViewSheet = ({ open, onClose, userId }: UserViewSheetProps) => {
  const { data: user, isLoading } = useGetUser(open ? userId ?? undefined : undefined);

  const activeCourses =
    user?.payments.filter((p) => !p.expiresAt || new Date(p.expiresAt) > new Date()).length ?? 0;
  const totalSpent = user?.payments.reduce((sum, p) => sum + Number(p.totalAmount), 0) ?? 0;

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent open={open}>
        <SheetHeader>
          <SheetTitle>Student details</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading || !user ? (
            <p className="text-[13px]" style={{ color: "rgba(0,0,0,0.4)" }}>
              Loading...
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[17px] font-semibold"
                  style={{ backgroundColor: "rgba(0,43,127,0.1)", color: "#002b7f" }}
                >
                  {initials(user.name, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold" style={{ color: "#191919" }}>
                    {user.name || "Unnamed"}
                  </p>
                  <p className="truncate text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
                    {user.email}
                  </p>
                  <div className="mt-1.5 flex gap-1.5">
                    <StatusBadge
                      label={user.isActive ? "Active" : "Inactive"}
                      variant={user.isActive ? "success" : "error"}
                    />
                    <StatusBadge
                      label={user.emailVerifiedAt ? "Verified" : "Unverified"}
                      variant={user.emailVerifiedAt ? "success" : "warning"}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#f8f9fa" }}>
                  <p className="font-mono text-[16px] font-semibold" style={{ color: "#191919" }}>
                    {user.payments.length}
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                    Purchases
                  </p>
                </div>
                <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#f8f9fa" }}>
                  <p className="font-mono text-[16px] font-semibold" style={{ color: "#16a34a" }}>
                    {activeCourses}
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                    Active access
                  </p>
                </div>
                <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#f8f9fa" }}>
                  <p className="font-mono text-[15px] font-semibold" style={{ color: "#191919" }}>
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                    Total spent
                  </p>
                </div>
              </div>

              <DetailSection title="Contact">
                <div className="flex flex-col gap-3">
                  <InfoRow icon={Phone} label="Phone" value={user.phone || "—"} />
                  <InfoRow icon={MapPin} label="State" value={user.state || "—"} />
                  <InfoRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
                </div>
              </DetailSection>

              <div className="flex flex-col gap-2">
                <p className="text-[12.5px] font-semibold" style={{ color: "#191919" }}>
                  Purchase history
                </p>
                {user.payments.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                    No purchases yet
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {user.payments.map((p) => {
                      const isExpired = !!p.expiresAt && new Date(p.expiresAt) < new Date();
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[13px]" style={{ color: "#191919" }}>
                              {p.course.name}
                            </p>
                            <p className="text-[11px]" style={{ color: isExpired ? "#dc2626" : "rgba(0,0,0,0.4)" }}>
                              {p.paymentType === "OFFLINE" ? "Offline · " : ""}
                              {p.expiresAt
                                ? `${isExpired ? "Expired" : "Expires"} ${formatDate(p.expiresAt)}`
                                : "Lifetime access"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-[13px]" style={{ color: "#191919" }}>
                              {formatCurrency(p.totalAmount)}
                            </p>
                            <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                              {formatDate(p.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
