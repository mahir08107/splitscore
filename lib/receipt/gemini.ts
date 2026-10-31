import { GEMINI_MODEL, GEMINI_FALLBACK_MODEL } from "./constants";
import { ParsedReceiptSchema, type ParsedReceipt } from "./schema";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export const RECEIPT_SYSTEM_INSTRUCTION =
  "You read one photographed or scanned bill. Extract only text that is clearly visible in the image. Never invent, guess, estimate, complete or reuse any item, price, merchant or date. If a value is not clearly readable, return null for it. If the image is not a bill, or is too blurry to read, return is_receipt false and an empty items array. List only purchased line items, one entry per line, copied as printed. Do not list headers, addresses, phone numbers, GST numbers, card numbers, table numbers, payment method lines, thank-you text or the totals rows as items. Put tax, service charge, and discount in their respective fields, not in items.";

export const RECEIPT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    is_receipt: { type: "BOOLEAN" },
    merchant: { type: "STRING", nullable: true },
    date: { type: "STRING", nullable: true },
    currency: { type: "STRING", nullable: true },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          quantity: { type: "NUMBER", nullable: true },
          unit_price: { type: "NUMBER", nullable: true },
          line_total: { type: "NUMBER", nullable: true },
        },
        required: ["name"],
      },
    },
    subtotal: { type: "NUMBER", nullable: true },
    tax: { type: "NUMBER", nullable: true },
    service_charge: { type: "NUMBER", nullable: true },
    discount: { type: "NUMBER", nullable: true },
    total: { type: "NUMBER", nullable: true },
    notes: { type: "STRING", nullable: true },
  },
  required: ["is_receipt", "items"],
};

/**
 * Calls the Gemini API to parse a receipt image using strict JSON schema and 0 temperature.
 * Tries the primary model first, falls back to the fallback model on failure.
 */
export async function parseReceiptWithGemini(
  pureBase64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ParsedReceipt> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const requestBody = {
    system_instruction: {
      parts: [{ text: RECEIPT_SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: pureBase64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: RECEIPT_RESPONSE_SCHEMA,
    },
  };

  // Try primary model first
  let rawJson: string;
  try {
    rawJson = await callGemini(GEMINI_MODEL, apiKey, requestBody);
  } catch (primaryError) {
    console.warn(
      `Primary model ${GEMINI_MODEL} failed, trying fallback ${GEMINI_FALLBACK_MODEL}:`,
      primaryError
    );
    try {
      rawJson = await callGemini(GEMINI_FALLBACK_MODEL, apiKey, requestBody);
    } catch (fallbackError) {
      console.error("Both Gemini models failed:", fallbackError);
      throw new Error(
        "Could not read the receipt. Please try again with a clearer photo."
      );
    }
  }

  // Parse JSON
  let rawParsed: any;
  try {
    const cleaned = rawJson
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    rawParsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "The AI returned an unexpected format. Please try again with a clearer photo."
    );
  }

  if (!rawParsed || typeof rawParsed !== "object") {
    throw new Error("Invalid response received from Gemini.");
  }

  if (rawParsed.is_receipt === false) {
    throw new Error(
      "The uploaded image does not appear to be a readable bill or receipt. Please make sure the bill is clear and well-lit."
    );
  }

  // Normalize items to compute `price` from line_total / (quantity * unit_price)
  const normalizedItems = Array.isArray(rawParsed.items)
    ? rawParsed.items.map((it: any) => {
        const qty = typeof it.quantity === "number" && it.quantity > 0 ? it.quantity : 1;
        const lineTotal =
          typeof it.line_total === "number" && !isNaN(it.line_total)
            ? it.line_total
            : typeof it.unit_price === "number" && !isNaN(it.unit_price)
            ? qty * it.unit_price
            : 0;

        return {
          name: typeof it.name === "string" && it.name.trim() ? it.name.trim() : "Item",
          quantity: qty,
          unit_price: typeof it.unit_price === "number" ? it.unit_price : null,
          line_total: typeof it.line_total === "number" ? it.line_total : null,
          price: lineTotal,
        };
      })
    : [];

  if (normalizedItems.length === 0) {
    throw new Error(
      "No purchased line items could be detected on this receipt. Please try again with a clearer photo."
    );
  }

  const payloadToValidate = {
    ...rawParsed,
    items: normalizedItems,
  };

  const result = ParsedReceiptSchema.safeParse(payloadToValidate);
  if (!result.success) {
    console.error("Zod validation failed:", result.error.flatten());
    throw new Error(
      "Could not understand parts of the receipt. Please try again with a clearer photo."
    );
  }

  return result.data;
}

async function callGemini(
  model: string,
  apiKey: string,
  body: unknown
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Gemini.");
  }

  return text;
}
