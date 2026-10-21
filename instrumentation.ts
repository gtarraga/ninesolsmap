/** Apply outbound certificate distrust before each Node server starts. */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { configureTlsTrust } = await import("./security/tls-trust.mjs");
    const trust = configureTlsTrust();
    if (trust._tag === "unsupported-runtime") throw trust.error;
  }
}
