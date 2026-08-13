// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.
//
// Two different runtimes, two different capture APIs:
// - Cloudflare Workers (and browsers) dispatch DOM-style "error" /
//   "unhandledrejection" events on globalThis.
// - Node.js (Vercel's serverless runtime) does NOT dispatch those — it uses
//   process.on("uncaughtException" / "unhandledRejection") instead. Without
//   this branch, capture silently no-ops on Vercel and we lose the real
//   stack trace behind every h3-swallowed 500.
// We wire up whichever is available so this works on both targets.

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record((event as ErrorEvent).error ?? event));
  globalThis.addEventListener("unhandledrejection", (event) =>
    record((event as PromiseRejectionEvent).reason),
  );
}

if (typeof process !== "undefined" && typeof process.on === "function") {
  process.on("uncaughtException", (error) => record(error));
  process.on("unhandledRejection", (reason) => record(reason));
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
