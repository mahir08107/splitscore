import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { parseReceiptWithGemini } from "@/lib/receipt/gemini";
import {
  MAX_SCANS_PER_USER_PER_DAY,
  MAX_SCANS_GLOBAL_PER_DAY,
  MAX_IMAGE_SIZE_BYTES,
  TOTAL_MISMATCH_THRESHOLD,
} from "@/lib/receipt/constants";
import type { ReceiptParseResponse, ParsedReceipt } from "@/lib/receipt/schema";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export const maxDuration = 60;

/** Returns the current date string in America/Los_Angeles timezone */
function getTodayLA(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}

export async function POST(request: NextRequest) {
  try {
    // --- Identify the user ---
    const isDemo = request.cookies.get("demo_mode")?.value === "true";
    let userId: string | null = null;

    if (isDemo) {
      userId = process.env.NEXT_PUBLIC_DEMO_USER_ID || DEMO_USER_ID;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {
              // Read-only in route handlers
            },
          },
        });

        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id || null;
      }
    }

    if (!userId) {
      return NextResponse.json<ReceiptParseResponse>(
        { success: false, error: "Please sign in to scan a receipt." },
        { status: 401 }
      );
    }

    // --- Parse request body ---
    const body = await request.json().catch(() => null);
    if (!body || !body.image) {
      return NextResponse.json<ReceiptParseResponse>(
        { success: false, error: "Please upload a receipt image." },
        { status: 400 }
      );
    }

    const { image } = body as { image: string; mimeType?: string };

    // Strip data URL prefix if present
    const pureBase64 = image
      .replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "")
      .replace(/\s/g, "");

    if (!pureBase64 || pureBase64.length === 0) {
      return NextResponse.json<ReceiptParseResponse>(
        { success: false, error: "Uploaded image is empty (0 bytes)." },
        { status: 400 }
      );
    }

    // Decode to calculate byte length and SHA-256
    const imageBuffer = Buffer.from(pureBase64, "base64");
    const byteLength = imageBuffer.length;

    if (byteLength === 0) {
      return NextResponse.json<ReceiptParseResponse>(
        { success: false, error: "Uploaded image is empty (0 bytes)." },
        { status: 400 }
      );
    }

    if (byteLength > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json<ReceiptParseResponse>(
        { success: false, error: "Image is too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    const sha256Hex = crypto
      .createHash("sha256")
      .update(imageBuffer)
      .digest("hex");
    const sha256Prefix = sha256Hex.slice(0, 8);

    // Server log (console only, not returned to users)
    console.log(
      `[Receipt Scan] Image received: ${byteLength} bytes, SHA-256 (first 8): ${sha256Prefix}`
    );

    // --- Optional test sample ONLY behind explicit MOCK_RECEIPT=true env flag ---
    if (process.env.MOCK_RECEIPT === "true") {
      const mockResult: ParsedReceipt = {
        is_receipt: true,
        merchant: "Test Mock Bill",
        date: new Date().toISOString().split("T")[0],
        currency: "INR",
        items: [{ name: "Mock Test Item", quantity: 1, unit_price: 100, line_total: 100, price: 100 }],
        subtotal: 100,
        tax: 0,
        service_charge: 0,
        discount: 0,
        total: 100,
        notes: "MOCK_RECEIPT=true active",
      };
      return NextResponse.json<ReceiptParseResponse>({
        success: true,
        data: mockResult,
        debug:
          process.env.NODE_ENV === "development"
            ? { byteLength, sha256Prefix }
            : undefined,
      });
    }

    // --- Rate limiting ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    let adminClient: any = null;
    if (supabaseUrl && supabaseAnonKey) {
      const { createClient } = await import("@supabase/supabase-js");
      adminClient = createClient(supabaseUrl, supabaseAnonKey);
    }

    const todayStart = getTodayLA() + "T00:00:00-08:00";

    if (adminClient) {
      // Per-user limit (only for valid UUID users to prevent DB errors on demo dummy id)
      const isValidUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          userId
        );

      if (isValidUuid) {
        const { count: userCount, error: userCountErr } = await adminClient
          .from("receipt_scans")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", todayStart);

        if (!userCountErr && (userCount ?? 0) >= MAX_SCANS_PER_USER_PER_DAY) {
          return NextResponse.json<ReceiptParseResponse>(
            {
              success: false,
              error: `You have used all ${MAX_SCANS_PER_USER_PER_DAY} scans for today. Try again tomorrow.`,
            },
            { status: 429 }
          );
        }
      }

      // Global limit
      const { count: globalCount, error: globalCountErr } = await adminClient
        .from("receipt_scans")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart);

      if (
        !globalCountErr &&
        (globalCount ?? 0) >= MAX_SCANS_GLOBAL_PER_DAY
      ) {
        return NextResponse.json<ReceiptParseResponse>(
          {
            success: false,
            error:
              "The daily scan limit for all users has been reached. Please try again tomorrow.",
          },
          { status: 429 }
        );
      }
    }

    // --- Call Gemini on the real uploaded image ---
    let parsed: ParsedReceipt;
    try {
      parsed = await parseReceiptWithGemini(pureBase64, "image/jpeg");
    } catch (err: any) {
      // Record failed scan if table is available
      if (adminClient && userId && userId !== DEMO_USER_ID) {
        await adminClient
          .from("receipt_scans")
          .insert({ user_id: userId, status: "error" })
          .then(() => {});
      }

      return NextResponse.json<ReceiptParseResponse>(
        {
          success: false,
          error: err?.message || "Failed to parse the receipt.",
        },
        { status: 422 }
      );
    }

    // Record successful scan
    if (adminClient && userId && userId !== DEMO_USER_ID) {
      await adminClient
        .from("receipt_scans")
        .insert({ user_id: userId, status: "success" })
        .then(() => {});
    }

    // --- Check total mismatch ---
    let warning: string | undefined;
    if (parsed.total != null) {
      const itemsSum =
        parsed.items.reduce((acc, item) => acc + item.price, 0) +
        (parsed.tax ?? 0) +
        (parsed.service_charge ?? 0);

      if (Math.abs(itemsSum - parsed.total) > TOTAL_MISMATCH_THRESHOLD) {
        warning = `The sum of items (₹${itemsSum.toFixed(
          2
        )}) differs from the receipt total (₹${parsed.total.toFixed(
          2
        )}). Please check the amounts.`;
      }
    }

    return NextResponse.json<ReceiptParseResponse>({
      success: true,
      data: parsed,
      warning,
      debug:
        process.env.NODE_ENV === "development"
          ? { byteLength, sha256Prefix }
          : undefined,
    });
  } catch (err: any) {
    console.error("Receipt parse route error:", err);
    return NextResponse.json<ReceiptParseResponse>(
      {
        success: false,
        error: "Something went wrong while processing the receipt.",
      },
      { status: 500 }
    );
  }
}
