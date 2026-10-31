import { z } from "zod";

/** Schema for a single parsed item from a receipt */
export const ReceiptItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nullable().optional(),
  unit_price: z.number().nullable().optional(),
  line_total: z.number().nullable().optional(),
  /** Normalized line price for expense calculation */
  price: z.number().default(0),
});

/** Full schema for Gemini's structured output matching responseSchema */
export const ParsedReceiptSchema = z.object({
  is_receipt: z.boolean(),
  merchant: z.string().nullable().optional().default(null),
  date: z.string().nullable().optional().default(null),
  currency: z.string().nullable().optional().default("INR"),
  items: z.array(ReceiptItemSchema).default([]),
  subtotal: z.number().nullable().optional().default(null),
  tax: z.number().nullable().optional().default(0),
  service_charge: z.number().nullable().optional().default(0),
  discount: z.number().nullable().optional().default(null),
  total: z.number().nullable().optional().default(null),
  notes: z.string().nullable().optional().default(null),
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;
export type ParsedReceipt = z.infer<typeof ParsedReceiptSchema>;

export interface ReceiptDebugInfo {
  byteLength: number;
  sha256Prefix: string;
}

/** The response shape sent back from the API route */
export interface ReceiptParseResponse {
  success: boolean;
  data?: ParsedReceipt;
  warning?: string;
  error?: string;
  debug?: ReceiptDebugInfo;
}
