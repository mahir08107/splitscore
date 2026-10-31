/**
 * Demo user constants — NOT a "use server" file.
 * Safe to import from both server actions, route handlers, and client code.
 */

export const DEMO_USER_EMAIL =
  process.env.DEMO_USER_EMAIL || "aarav@demo.splitscore.app";
export const DEMO_USER_PASSWORD =
  process.env.DEMO_USER_PASSWORD || "Demo@123456";

export interface SignInDemoResult {
  success: boolean;
  error?: string;
}
