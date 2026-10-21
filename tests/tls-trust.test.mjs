import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as tls from "node:tls";
import { configureTlsTrust } from "../security/tls-trust.mjs";

const certificates = (file) => readFileSync(new URL(file, import.meta.url), "utf8")
  .match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) ?? [];
const fingerprints = (roots) => roots.map((pem) => new X509Certificate(pem).fingerprint256).sort();

test("startup removes every compromised root while preserving public and private trust", () => {
  const before = tls.getCACertificates("default");
  const blocked = certificates("./fixtures/tls/blocked-roots.crt");
  const privateRoots = certificates("./fixtures/tls/private-root.crt");
  const retained = [tls.rootCertificates[0], ...privateRoots];
  try {
    tls.setDefaultCACertificates([...retained, ...blocked]);
    assert.equal(configureTlsTrust()._tag, "ready");
    assert.deepEqual(fingerprints(tls.getCACertificates("default")), fingerprints(retained));
  } finally {
    tls.setDefaultCACertificates(before);
  }
});

test("startup remains idempotent and preserves the active trust policy", () => {
  const before = tls.getCACertificates("default");
  try {
    assert.equal(configureTlsTrust()._tag, "ready");
    const configured = fingerprints(tls.getCACertificates("default"));
    assert.equal(configureTlsTrust()._tag, "ready");
    assert.deepEqual(fingerprints(tls.getCACertificates("default")), configured);
  } finally {
    tls.setDefaultCACertificates(before);
  }
});

// Opt in with TLS_TEST_NETWORK=1; normal tests never depend on public services.
test("native HTTPS and fetch reject every published compromised chain", {
  skip: process.env.TLS_TEST_NETWORK !== "1",
  timeout: 90000,
}, async () => {
  const { default: https } = await import("node:https");
  const rejected = new Set([
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY", "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "SELF_SIGNED_CERT_IN_CHAIN", "CERT_UNTRUSTED",
  ]);
  const before = tls.getCACertificates("default");
  try {
    assert.equal(configureTlsTrust()._tag, "ready");
    const clients = [
      async (host) => {
        const response = await fetch(`https://${host}/`, { signal: AbortSignal.timeout(12000) });
        await response.body?.cancel();
      },
      (host) => new Promise((resolve, reject) => {
        const request = https.get(`https://${host}/`, { agent: false }, (response) => {
          response.resume();
          response.on("end", resolve);
        });
        request.on("error", reject);
        request.setTimeout(12000, () => request.destroy(new Error("TLS probe timed out")));
      }),
    ];
    for (const type of ["dv", "ov", "ev"]) {
      for (const generation of ["g3b", "g3c"]) {
        for (const chain of ["emudhra", "aaa-emudhra"]) {
          const host = `${type}-${generation}-${chain}.we-have-a-problem.com`;
          for (const client of clients) {
            await assert.rejects(() => client(host), (error) =>
              rejected.has(error.code ?? error.cause?.code), host);
          }
        }
      }
    }
    for (const client of clients) {
      await client("github.com");
      await client("pypi.org");
    }
  } finally {
    tls.setDefaultCACertificates(before);
  }
});
