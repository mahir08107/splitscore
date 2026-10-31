/** Shared constants for the receipt scanning feature */

export const GEMINI_MODEL = "gemini-3.5-flash-lite";
export const GEMINI_FALLBACK_MODEL = "gemini-3.8-flash";

/** Maximum scans a single user can perform per calendar day (America/Los_Angeles) */
export const MAX_SCANS_PER_USER_PER_DAY = 5;

/** Maximum total scans across all users per calendar day (America/Los_Angeles) */
export const MAX_SCANS_GLOBAL_PER_DAY = 400;

/** Maximum image upload size in bytes (5 MB) */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Maximum image width before client-side resize */
export const MAX_IMAGE_WIDTH_PX = 1280;

/** Accepted MIME types for receipt images */
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Allowed file extensions for display in the UI */
export const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp";

/** Warning threshold: if sum of items differs from total by more than this, show a warning */
export const TOTAL_MISMATCH_THRESHOLD = 1; // in rupees
