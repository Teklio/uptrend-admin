import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shared/Sheet";
import { DetailRow } from "../shared/DetailRow";
import { StatusBadge } from "../shared/StatusBadge";
import { useExtendPaymentExpiry, useGetPayment } from "../../services/payment.service";
import { formatCurrency, formatDateTime } from "../../utils/format.util";
import { toastMessage } from "../../utils/toast.util";
import type { PaymentStatus } from "../../types/payment.type";

const STATUS_VARIANT: Record<PaymentStatus, "success" | "warning" | "error" | "neutral"> = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "error",
  CANCELLED: "neutral",
};

interface PaymentViewSheetProps {
  open: boolean;
  onClose: () => void;
  paymentId: string | null;
}

export const PaymentViewSheet = ({ open, onClose, paymentId }: PaymentViewSheetProps) => {
  const { data: payment, isLoading } = useGetPayment(open ? paymentId ?? undefined : undefined);
  const { mutate: extendExpiry, isPending: isExtending } = useExtendPaymentExpiry();
  const [extendDays, setExtendDays] = useState("30");

  const isExpired = !!payment?.expiresAt && new Date(payment.expiresAt) < new Date();

  const handleExtend = () => {
    const days = Number(extendDays);
    if (!payment || !days) return;
    extendExpiry(
      { paymentId: payment.id, days },
      {
        onSuccess: () => toastMessage.success({ message: "Course access expiry updated" }),
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent open={open}>
        <SheetHeader>
          <SheetTitle>Payment details</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading || !payment ? (
            <p className="text-[13px]" style={{ color: "rgba(0,0,0,0.4)" }}>
              Loading...
            </p>
          ) : (
            <div className="flex flex-col">
              <DetailRow label="Status">
                <StatusBadge label={payment.status} variant={STATUS_VARIANT[payment.status]} />
              </DetailRow>
              <DetailRow label="Type">
                <StatusBadge
                  label={payment.paymentType === "OFFLINE" ? "Offline" : "Online"}
                  variant={payment.paymentType === "OFFLINE" ? "warning" : "neutral"}
                />
              </DetailRow>
              <DetailRow label="Course price">{formatCurrency(payment.amount)}</DetailRow>
              {Number(payment.extraFee) > 0 && (
                <DetailRow label="Internet handling fee">{formatCurrency(payment.extraFee)}</DetailRow>
              )}
              <DetailRow label="Total paid">
                <span className="font-semibold">{formatCurrency(payment.totalAmount)}</span>
              </DetailRow>
              <DetailRow label="User">{payment.user.name || payment.user.email}</DetailRow>
              <DetailRow label="Email">{payment.user.email}</DetailRow>
              <DetailRow label="Course">{payment.course.name}</DetailRow>
              <DetailRow label="Payment mode">{payment.paymentMode ?? "—"}</DetailRow>
              {payment.paymentType === "ONLINE" && (
                <>
                  <DetailRow label="Razorpay order ID">
                    <span className="font-mono text-[12px]">{payment.rzpOrderId ?? "—"}</span>
                  </DetailRow>
                  <DetailRow label="Transaction ID">
                    <span className="font-mono text-[12px]">{payment.transactionId ?? "—"}</span>
                  </DetailRow>
                </>
              )}
              <DetailRow label="Reference">
                <span className="font-mono text-[12px]">{payment.reference ?? "—"}</span>
              </DetailRow>
              {payment.proofUrl && (
                <DetailRow label="Proof">
                  <a
                    href={payment.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium underline-offset-2 hover:underline"
                    style={{ color: "#002b7f" }}
                  >
                    View / download <ExternalLink size={13} />
                  </a>
                </DetailRow>
              )}
              <DetailRow label="Created">{formatDateTime(payment.createdAt)}</DetailRow>
              <DetailRow label="Updated">{formatDateTime(payment.updatedAt)}</DetailRow>

              {payment.status === "SUCCESS" && (
                <>
                  <DetailRow label="Access expires">
                    <span style={{ color: isExpired ? "#dc2626" : "#191919" }}>
                      {payment.expiresAt ? formatDateTime(payment.expiresAt) : "Never"}
                      {isExpired && " (expired)"}
                    </span>
                  </DetailRow>

                  <div className="mt-4 flex flex-col gap-2 rounded-xl p-4" style={{ backgroundColor: "#f8f9fa" }}>
                    <span className="text-[13px] font-medium" style={{ color: "#191919" }}>
                      Extend access
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={extendDays}
                        onChange={(e) => setExtendDays(e.target.value)}
                        className="w-24 rounded-xl px-3 py-2 text-[13px] outline-none"
                        style={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.1)" }}
                      />
                      <span className="text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
                        days
                      </span>
                      <button
                        type="button"
                        onClick={handleExtend}
                        disabled={isExtending}
                        className="ml-auto rounded-xl px-3.5 py-2 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
                        style={{ backgroundColor: "#f5a300" }}
                      >
                        {isExtending ? "Applying..." : "Apply"}
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      {[7, 30, 90, 365].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setExtendDays(String(preset))}
                          className="rounded-full px-3 py-1 text-[12px]"
                          style={{
                            backgroundColor: extendDays === String(preset) ? "#002b7f" : "rgba(0,0,0,0.06)",
                            color: extendDays === String(preset) ? "#fff" : "#191919",
                          }}
                        >
                          +{preset}d
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
