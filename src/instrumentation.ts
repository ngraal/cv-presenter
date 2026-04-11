export async function onRequestError() {
  // Required export for instrumentation
}

export async function register() {
  // Only run on the server
  if (typeof window !== "undefined") return;

  const { signToken } = await import("@/lib/jwt");

  try {
    const token = await signToken("Default Admin", "admin", "24h");
    console.log("\n" + "=".repeat(60));
    console.log("CV PRESENTER — Default Admin Token (valid 24h):");
    console.log("=".repeat(60));
    console.log(token);
    console.log("=".repeat(60) + "\n");
  } catch (e) {
    console.error(
      "[STARTUP] Failed to generate default admin token. Is JWT_SECRET set (min 32 chars)?",
      e
    );
  }
}
