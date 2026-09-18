import { z } from "zod";

// Amount is not collected here — it's always the selected course's own
// price + extraFee, computed and enforced server-side, never admin-typed.
export const offlinePaymentFormSchema = z.object({
  paymentMode: z.string().trim().max(50).optional().or(z.literal("")),
});
export type OfflinePaymentFormSchemaType = z.infer<typeof offlinePaymentFormSchema>;
