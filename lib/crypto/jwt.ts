import crypto from "crypto";
import { TrustBand } from "@/lib/data/score";

export interface TrustCardTokenPayload {
  iss: string; // "splitscore.app"
  sub: string; // user id
  name: string;
  score: number;
  band: TrustBand;
  verified_by_count: number;
  settlements_count: number;
  iat: number;
  exp: number;
}

export interface VerificationProof {
  isValid: boolean;
  algorithm: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  subject: string;
  signaturePreview: string;
  rawToken: string;
  header: Record<string, any>;
  payload: TrustCardTokenPayload;
}

function getSigningSecret(): string {
  const configuredSecret = process.env.SPLITSCORE_SIGNING_SECRET;
  if (configuredSecret) return configuredSecret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SPLITSCORE_SIGNING_SECRET must be configured in production.");
  }

  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "splitscore-ed25519-sha256-trust-card-signature-salt-2026"
  );
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Creates a cryptographically signed HMAC-SHA256 JWT proving card authenticity
 */
export function signTrustCardToken(
  data: Omit<TrustCardTokenPayload, "iss" | "iat" | "exp">
): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: TrustCardTokenPayload = {
    ...data,
    iss: "splitscore.app",
    iat: now,
    exp: now + 30 * 24 * 60 * 60, // 30 days valid
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(dataToSign)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies and parses a signed Trust Card JWT
 */
export function verifyTrustCardToken(token: string): VerificationProof | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac("sha256", getSigningSecret())
      .update(dataToSign)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    // Constant-time comparison
    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);
    const isValid = sigA.length === sigB.length && crypto.timingSafeEqual(sigA, sigB);

    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload: TrustCardTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));

    return {
      isValid,
      algorithm: header.alg || "HS256",
      issuer: payload.iss,
      issuedAt: new Date(payload.iat * 1000).toISOString(),
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      subject: payload.sub,
      signaturePreview: `${signature.slice(0, 12)}...${signature.slice(-8)}`,
      rawToken: token,
      header,
      payload,
    };
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}
