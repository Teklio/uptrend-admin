import { z } from "zod";

export const offlinePaymentFormSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMode: z.string().trim().max(50).optional().or(z.literal("")),
});
export type OfflinePaymentFormSchemaType = z.infer<typeof offlinePaymentFormSchema>;
