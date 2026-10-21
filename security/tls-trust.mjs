import { X509Certificate } from "node:crypto";
import * as tls from "node:tls";

// Interim distrust until Node ships its eMudhra verifier update.
// Exact root SHA256 fingerprints: https://emudhra.we-have-a-problem.com/roots.json
const blockedRoots = new Set([
  "7DD78D5F4F13459A83DFF9ABBBA62EDBAF6F2D102BF257FD712F4D9F2746ED8D",
  "F2EDAAFF3D9B701FB4D14C9F285F8C0BAD90FC3BCC1FA07D47F4718EDABA34A5",
  "D7A7A0FB5D7E2731D771E9484EBCDEF71D5F0C3E0A2948782BC83EE0EA699EF4",
  "86A1ECBA089C4A8D3BBE2734C612BA341D813E043CF9E8A862CD5C57A36BBE6B",
]);

class TlsTrustRuntimeUnsupported extends Error {
  constructor() {
    super("The Node runtime must support getCACertificates and setDefaultCACertificates to configure TLS trust.");
    this.name = "TlsTrustRuntimeUnsupported";
  }
}

/**
 * Configure default HTTPS/fetch trust before creating outbound connections.
 * Preserve runtime, system and extra private roots except the exact blocked CAs.
 * Call in each Node server instance's startup hook; repeated calls are safe.
 * @returns {{ _tag: "ready" } | { _tag: "unsupported-runtime", error: Error }}
 */
export function configureTlsTrust() {
  if (typeof tls.getCACertificates !== "function" || typeof tls.setDefaultCACertificates !== "function") {
    return { _tag: "unsupported-runtime", error: new TlsTrustRuntimeUnsupported() };
  }

  const trustedRoots = tls.getCACertificates("default").filter((certificate) => {
    const fingerprint = new X509Certificate(certificate).fingerprint256.replaceAll(":", "");
    return !blockedRoots.has(fingerprint);
  });
  tls.setDefaultCACertificates(trustedRoots);
  return { _tag: "ready" };
}
