const isProduction = process.env.NODE_ENV === "production";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "auth",
  "email",
  "identifier",
  "userId",
  "studentId",
  "studentEmail",
];

const EMAIL_REGEX =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

function sanitizeValue(value: unknown): unknown {
  if (value == null) return value;

  if (typeof value === "string") {
    return value.replace(EMAIL_REGEX, "[REDACTED_EMAIL]");
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeValue(value.message),
      ...(isProduction ? {} : { stack: value.stack }),
    };
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (
        SENSITIVE_KEYS.some(
          (sensitiveKey) =>
            sensitiveKey.toLowerCase() === key.toLowerCase(),
        )
      ) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitizeValue(v);
      }
    }
    return result;
  }

  return value;
}

function formatArgs(args: unknown[]): unknown[] {
  return args.map((arg) => sanitizeValue(arg));
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.debug(...formatArgs(args));
    }
  },
  info: (...args: unknown[]) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.info(...formatArgs(args));
    }
  },
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.warn(...formatArgs(args));
    }
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...formatArgs(args));
  },
};

export default logger;

