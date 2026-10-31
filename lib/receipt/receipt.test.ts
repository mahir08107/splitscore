import { describe, it, expect } from "vitest";
import { TOTAL_MISMATCH_THRESHOLD, MAX_SCANS_PER_USER_PER_DAY, MAX_SCANS_GLOBAL_PER_DAY } from "./constants";

describe("Receipt constants", () => {
  it("should have the correct total mismatch threshold", () => {
    expect(TOTAL_MISMATCH_THRESHOLD).toBe(1);
  });

  it("should have the correct per-user daily limit", () => {
    expect(MAX_SCANS_PER_USER_PER_DAY).toBe(5);
  });

  it("should have the correct global daily limit", () => {
    expect(MAX_SCANS_GLOBAL_PER_DAY).toBe(400);
  });
});

describe("Total mismatch check", () => {
  function checkMismatch(
    items: Array<{ price: number }>,
    tax: number,
    serviceCharge: number,
    total: number
  ): boolean {
    const itemsSum =
      items.reduce((acc, item) => acc + item.price, 0) + tax + serviceCharge;
    return Math.abs(itemsSum - total) > TOTAL_MISMATCH_THRESHOLD;
  }

  it("should NOT flag when sum exactly matches total", () => {
    const items = [{ price: 100 }, { price: 200 }, { price: 50 }];
    expect(checkMismatch(items, 10, 5, 365)).toBe(false);
  });

  it("should NOT flag when difference is within threshold (1 rupee)", () => {
    const items = [{ price: 100 }, { price: 200 }];
    // sum = 300 + 0 + 0 = 300, total = 300.5, diff = 0.5 <= 1
    expect(checkMismatch(items, 0, 0, 300.5)).toBe(false);
  });

  it("should NOT flag when difference is exactly the threshold", () => {
    const items = [{ price: 100 }];
    // sum = 100, total = 101, diff = 1 which is NOT > 1
    expect(checkMismatch(items, 0, 0, 101)).toBe(false);
  });

  it("should flag when difference exceeds 1 rupee", () => {
    const items = [{ price: 100 }, { price: 200 }];
    // sum = 300, total = 310, diff = 10 > 1
    expect(checkMismatch(items, 0, 0, 310)).toBe(true);
  });

  it("should flag when sum is higher than total by more than 1 rupee", () => {
    const items = [{ price: 500 }];
    // sum = 500 + 50 = 550, total = 540, diff = 10 > 1
    expect(checkMismatch(items, 50, 0, 540)).toBe(true);
  });

  it("should include tax and service charge in sum", () => {
    const items = [{ price: 200 }];
    // sum = 200 + 20 + 10 = 230, total = 230
    expect(checkMismatch(items, 20, 10, 230)).toBe(false);
  });
});

describe("Per-user rate limit logic", () => {
  function isUserLimitExceeded(scanCount: number): boolean {
    return scanCount >= MAX_SCANS_PER_USER_PER_DAY;
  }

  it("should allow when under the limit", () => {
    expect(isUserLimitExceeded(0)).toBe(false);
    expect(isUserLimitExceeded(4)).toBe(false);
  });

  it("should block at exactly the limit", () => {
    expect(isUserLimitExceeded(5)).toBe(true);
  });

  it("should block above the limit", () => {
    expect(isUserLimitExceeded(10)).toBe(true);
  });
});

describe("Global rate limit logic", () => {
  function isGlobalLimitExceeded(scanCount: number): boolean {
    return scanCount >= MAX_SCANS_GLOBAL_PER_DAY;
  }

  it("should allow when under the global limit", () => {
    expect(isGlobalLimitExceeded(0)).toBe(false);
    expect(isGlobalLimitExceeded(399)).toBe(false);
  });

  it("should block at exactly the global limit", () => {
    expect(isGlobalLimitExceeded(400)).toBe(true);
  });

  it("should block above the global limit", () => {
    expect(isGlobalLimitExceeded(500)).toBe(true);
  });
});

describe("Strict Gemini system prompt and schema", () => {
  it("system prompt should contain the exact instructions without examples", async () => {
    const { RECEIPT_SYSTEM_INSTRUCTION } = await import("./gemini");
    expect(RECEIPT_SYSTEM_INSTRUCTION).toContain(
      "You read one photographed or scanned bill. Extract only text that is clearly visible in the image."
    );
    expect(RECEIPT_SYSTEM_INSTRUCTION).toContain(
      "Never invent, guess, estimate, complete or reuse any item, price, merchant or date."
    );
    expect(RECEIPT_SYSTEM_INSTRUCTION).toContain(
      "Put tax, service charge, and discount in their respective fields, not in items."
    );
    // Ensure no fake examples in prompt
    expect(RECEIPT_SYSTEM_INSTRUCTION).not.toContain("Campus Cafe");
    expect(RECEIPT_SYSTEM_INSTRUCTION).not.toContain("Masala Dosa");
  });

  it("response schema should define is_receipt and items with required fields", async () => {
    const { RECEIPT_RESPONSE_SCHEMA } = await import("./gemini");
    expect(RECEIPT_RESPONSE_SCHEMA.properties.is_receipt.type).toBe("BOOLEAN");
    expect(RECEIPT_RESPONSE_SCHEMA.properties.items.type).toBe("ARRAY");
    expect(RECEIPT_RESPONSE_SCHEMA.required).toContain("is_receipt");
    expect(RECEIPT_RESPONSE_SCHEMA.required).toContain("items");
  });
});

