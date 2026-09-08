import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shared/Sheet";
import { DetailRow } from "../shared/DetailRow";
import { StatusBadge } from "../shared/StatusBadge";
import { useGetUser } from "../../services/user.service";
import { formatCurrency, formatDate } from "../../utils/format.util";

interface UserViewSheetProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

export const UserViewSheet = ({ open, onClose, userId }: UserViewSheetProps) => {
  const { data: user, isLoading } = useGetUser(open ? userId ?? undefined : undefined);

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent open={open}>
        <SheetHeader>
          <SheetTitle>User details</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading || !user ? (
            <p className="text-[13px]" style={{ color: "rgba(0,0,0,0.4)" }}>
              Loading...
            </p>
          ) : (
            <>
              <div className="flex flex-col">
                <DetailRow label="Name">{user.name || "—"}</DetailRow>
                <DetailRow label="Email">{user.email}</DetailRow>
                <DetailRow label="Phone">{user.phone || "—"}</DetailRow>
                <DetailRow label="State">{user.state || "—"}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge label={user.isActive ? "Active" : "Inactive"} variant={user.isActive ? "success" : "error"} />
                </DetailRow>
                <DetailRow label="Email">
                  <StatusBadge
                    label={user.emailVerifiedAt ? "Verified" : "Unverified"}
                    variant={user.emailVerifiedAt ? "success" : "warning"}
                  />
                </DetailRow>
                <DetailRow label="Joined">{formatDate(user.createdAt)}</DetailRow>
              </div>

              <h3 className="mb-2 mt-6 text-[13px] font-semibold" style={{ color: "#191919" }}>
                Purchase history
              </h3>
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
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
