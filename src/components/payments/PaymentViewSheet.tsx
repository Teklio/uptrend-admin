import { useState } from "react";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BookOpen, Calendar, ExternalLink, Hash, User, Wallet } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shared/Sheet";
import { DetailSection } from "../shared/DetailSection";
import { InfoRow } from "../shared/InfoRow";
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
  const [confirmDays, setConfirmDays] = useState<number | null>(null);

  const isExpired = !!payment?.expiresAt && new Date(payment.expiresAt) < new Date();

  const requestExtend = () => {
    const days = Number(extendDays);
    if (!payment || !Number.isInteger(days) || days === 0) {
      toastMessage.error({ message: "Enter a non-zero number of days" });
      return;
    }
    setConfirmDays(days);
  };

  const confirmExtend = () => {
    if (!payment || confirmDays === null) return;
    extendExpiry(
      { paymentId: payment.id, days: confirmDays },
      {
        onSuccess: () => {
          toastMessage.success({ message: "Course access expiry updated" });
          setConfirmDays(null);
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  // Mirrors the server's own base/offset math (admin.payment.controller.ts
  // extendPaymentExpiry) so the preview shown here is exactly what applying
  // it will produce.
  const previewExpiry =
    payment && confirmDays !== null
      ? new Date((payment.expiresAt ? new Date(payment.expiresAt) : new Date()).getTime() + confirmDays * 86400000)
      : null;

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
            <div className="flex flex-col gap-5">
              <div
                className="flex flex-col items-center gap-2.5 rounded-2xl py-6"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <p className="font-mono text-[26px] font-bold" style={{ color: "#191919" }}>
                  {formatCurrency(payment.totalAmount)}
                </p>
                <div className="flex gap-1.5">
                  <StatusBadge label={payment.status} variant={STATUS_VARIANT[payment.status]} />
                  <StatusBadge
                    label={payment.paymentType === "OFFLINE" ? "Offline" : "Online"}
                    variant={payment.paymentType === "OFFLINE" ? "warning" : "neutral"}
                  />
                </div>
              </div>

              <DetailSection title="Amount breakdown">
                <div className="flex flex-col gap-2 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "rgba(0,0,0,0.5)" }}>Course price</span>
                    <span style={{ color: "#191919" }}>{formatCurrency(payment.amount)}</span>
                  </div>
                  {Number(payment.extraFee) > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: "rgba(0,0,0,0.5)" }}>Internet handling fee</span>
                      <span style={{ color: "#191919" }}>{formatCurrency(payment.extraFee)}</span>
                    </div>
                  )}
                  <div
                    className="flex items-center justify-between pt-2 font-semibold"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)", color: "#191919" }}
                  >
                    <span>Total paid</span>
                    <span>{formatCurrency(payment.totalAmount)}</span>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Student & course">
                <div className="flex flex-col gap-3">
                  <InfoRow icon={User} label="Student" value={payment.user.name || payment.user.email} />
                  <InfoRow icon={BookOpen} label="Course" value={payment.course.name} />
                  <InfoRow icon={Wallet} label="Payment mode" value={payment.paymentMode ?? "—"} />
                </div>
              </DetailSection>

              <DetailSection title="Transaction">
                <div className="flex flex-col gap-3">
                  {payment.paymentType === "ONLINE" && (
                    <>
                      <InfoRow
                        icon={Hash}
                        label="Razorpay order ID"
                        value={<span className="font-mono">{payment.rzpOrderId ?? "—"}</span>}
                      />
                      <InfoRow
                        icon={Hash}
                        label="Transaction ID"
                        value={<span className="font-mono">{payment.transactionId ?? "—"}</span>}
                      />
                    </>
                  )}
                  <InfoRow
                    icon={Hash}
                    label="Reference"
                    value={<span className="font-mono">{payment.reference ?? "—"}</span>}
                  />
                  {payment.proofUrl && (
                    <InfoRow
                      icon={ExternalLink}
                      label="Proof"
                      value={
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
                          style={{ color: "#002b7f" }}
                        >
                          View / download <ExternalLink size={12} />
                        </a>
                      }
                    />
                  )}
                  <InfoRow icon={Calendar} label="Created" value={formatDateTime(payment.createdAt)} />
                </div>
              </DetailSection>

              {payment.status === "SUCCESS" && (
                <DetailSection title="Access">
                  <div className="flex flex-col gap-4">
                    <InfoRow
                      icon={Calendar}
                      label="Expires"
                      value={
                        <span style={{ color: isExpired ? "#dc2626" : "#191919" }}>
                          {payment.expiresAt ? formatDateTime(payment.expiresAt) : "Never"}
                          {isExpired && " (expired)"}
                        </span>
                      }
                    />

                    <div
                      className="flex flex-col gap-2 rounded-xl p-3.5"
                      style={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <span className="text-[13px] font-medium" style={{ color: "#191919" }}>
                        Extend access
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={extendDays}
                          onChange={(e) => setExtendDays(e.target.value)}
                          className="w-24 rounded-xl px-3 py-2 text-[13px] outline-none"
                          style={{ backgroundColor: "#f8f9fa", border: "1px solid rgba(0,0,0,0.1)" }}
                        />
                        <span className="text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
                          days
                        </span>
                        <button
                          type="button"
                          onClick={requestExtend}
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
                      <p className="text-[11.5px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                        A negative number shortens access instead of extending it.
                      </p>
                    </div>

                    {payment.expiryLogs.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.5)" }}>
                          Extension history
                        </span>
                        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                          {payment.expiryLogs.map((log) => (
                            <div
                              key={log.id}
                              className="rounded-lg px-3 py-2 text-[12px]"
                              style={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className="font-semibold"
                                  style={{ color: log.days > 0 ? "#16a34a" : "#dc2626" }}
                                >
                                  {log.days > 0 ? "+" : ""}
                                  {log.days} day{Math.abs(log.days) === 1 ? "" : "s"}
                                </span>
                                <span style={{ color: "rgba(0,0,0,0.4)" }}>{formatDateTime(log.createdAt)}</span>
                              </div>
                              <p className="mt-0.5" style={{ color: "rgba(0,0,0,0.55)" }}>
                                By {log.admin.name || log.admin.email}
                              </p>
                              <p className="mt-0.5" style={{ color: "rgba(0,0,0,0.55)" }}>
                                {log.previousExpiresAt ? formatDateTime(log.previousExpiresAt) : "Never"} →{" "}
                                {formatDateTime(log.newExpiresAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DetailSection>
              )}

              <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.35)" }}>
                Last updated {formatDateTime(payment.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Built on Radix's own Dialog (like DiscardChangesModal), not the
          plain custom Modal — this opens while PaymentViewSheet's own
          Dialog.Root is still open, and only Radix's own focus-trap
          handling correctly stacks a second Dialog.Root on top of a first. */}
      <Dialog.Root open={confirmDays !== null} onOpenChange={(o) => !o && !isExtending && setConfirmDays(null)}>
        <Dialog.Portal forceMount>
          <AnimatePresence>
            {confirmDays !== null && payment && previewExpiry && (
              <>
                <Dialog.Overlay asChild forceMount>
                  <motion.div
                    className="fixed inset-0 z-60"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                </Dialog.Overlay>
                <Dialog.Content asChild forceMount>
                  <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl focus:outline-none"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: confirmDays > 0 ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)" }}
                        >
                          <AlertTriangle size={20} color={confirmDays > 0 ? "#16a34a" : "#dc2626"} />
                        </div>
                        <Dialog.Title className="text-[16px] font-semibold" style={{ color: "#191919" }}>
                          {confirmDays > 0 ? "Extend course access?" : "Shorten course access?"}
                        </Dialog.Title>
                      </div>
                      <Dialog.Description asChild>
                        <div className="mb-6 flex flex-col gap-2 text-[13px]" style={{ color: "rgba(0,0,0,0.6)" }}>
                          <p>
                            {confirmDays > 0
                              ? `This grants ${payment.user.name || payment.user.email} ${confirmDays} more day${confirmDays === 1 ? "" : "s"} of access to "${payment.course.name}".`
                              : `This removes ${Math.abs(confirmDays)} day${Math.abs(confirmDays) === 1 ? "" : "s"} of access to "${payment.course.name}" from ${payment.user.name || payment.user.email} — they may lose access immediately.`}
                          </p>
                          <div
                            className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                            style={{ backgroundColor: "#f8f9fa" }}
                          >
                            <span>{payment.expiresAt ? formatDateTime(payment.expiresAt) : "Never expires"}</span>
                            <span style={{ color: "rgba(0,0,0,0.35)" }}>→</span>
                            <span
                              className="font-semibold"
                              style={{ color: confirmDays > 0 ? "#16a34a" : "#dc2626" }}
                            >
                              {formatDateTime(previewExpiry.toISOString())}
                            </span>
                          </div>
                        </div>
                      </Dialog.Description>
                      <div className="flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setConfirmDays(null)}
                          disabled={isExtending}
                          className="rounded-xl px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
                          style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={confirmExtend}
                          disabled={isExtending}
                          className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                          style={{ backgroundColor: confirmDays > 0 ? "#16a34a" : "#dc2626" }}
                        >
                          {isExtending ? "Applying..." : confirmDays > 0 ? "Extend" : "Shorten"}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </Sheet>
  );
};
