import type { ApiResponse } from "@/types";

// ============ RATE LIMITING ============

const rateLimitMap = new Map<string, number[]>();

export const rateLimit = {
  check(key: string, limit = 100, window = 60000): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(key) || [];

    // Remove old timestamps outside the window
    const recentTimestamps = timestamps.filter((ts) => now - ts < window);

    if (recentTimestamps.length >= limit) {
      return false;
    }

    recentTimestamps.push(now);
    rateLimitMap.set(key, recentTimestamps);
    return true;
  },

  reset(key: string): void {
    rateLimitMap.delete(key);
  },
};

// ============ ERROR HANDLING ============

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: any,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const createErrorResponse = <T = any>(
  error: Error | AppError,
  statusCode = 500,
): ApiResponse<T> => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      message: error.code,
    };
  }

  return {
    success: false,
    error: error.message,
    message: "Internal Server Error",
  };
};

export const createSuccessResponse = <T = any>(
  data: T,
  message = "Success",
): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

// ============ COMMON ERRORS ============

export const ERRORS = {
  UNAUTHORIZED: new AppError("UNAUTHORIZED", "Unauthorized access", 401),
  FORBIDDEN: new AppError("FORBIDDEN", "Access forbidden", 403),
  NOT_FOUND: new AppError("NOT_FOUND", "Resource not found", 404),
  VALIDATION_ERROR: (message: string) =>
    new AppError("VALIDATION_ERROR", message, 400),
  DUPLICATE: new AppError("DUPLICATE", "Resource already exists", 409),
  INTERNAL_ERROR: new AppError("INTERNAL_ERROR", "Internal server error", 500),
  RATE_LIMIT: new AppError("RATE_LIMIT", "Too many requests", 429),
  SLOT_UNAVAILABLE: new AppError(
    "SLOT_UNAVAILABLE",
    "Slot is not available for booking",
    409,
  ),
};

// ============ RESPONSE FORMATTING ============

export const formatResponse = <T = any>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
): ApiResponse<T> => ({
  success,
  ...(data && { data }),
  ...(message && { message }),
  ...(error && { error }),
});

// ============ DATE & TIME UTILITIES ============

export const dateUtils = {
  isValidDate(dateString: string): boolean {
    const timestamp = Date.parse(dateString);
    return !isNaN(timestamp);
  },

  parseTime(timeString: string): { hours: number; minutes: number } | null {
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return { hours, minutes };
  },

  formatTime(hours: number, minutes: number): string {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  },

  getDayOfWeek(date: Date): string {
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  },

  isFutureDate(date: Date): boolean {
    return date > new Date();
  },

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  },

  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  },

  formatDate(date: Date, locale = "en-US"): string {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  },

  formatDateTime(date: Date, locale = "en-US"): string {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  },
};

// ============ VALIDATION UTILITIES ============

export const validationUtils = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  },

  isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (Object.keys(value).length === 0 && value.constructor === Object)
    );
  },

  sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, "");
  },
};

// ============ CURRENCY & PRICING ============

export const priceUtils = {
  formatPrice(price: number, currency = "INR"): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(price);
  },

  calculateDiscount(original: number, discount: number): number {
    return original - (original * discount) / 100;
  },

  calculateTax(price: number, taxRate = 0.18): number {
    return price * taxRate;
  },

  calculateTotal(price: number, taxRate = 0.18): number {
    return price + this.calculateTax(price, taxRate);
  },
};

// ============ STRING UTILITIES ============

export const stringUtils = {
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  },

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate(str: string, length: number): string {
    return str.length > length ? str.substring(0, length) + "..." : str;
  },

  generateRandomId(length = 8): string {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  },
};

// ============ SLEEP/DELAY ============

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============ RETRY LOGIC ============

export const retryAsync = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay * Math.pow(2, i)); // Exponential backoff
    }
  }
  throw new Error("Retry failed");
};
