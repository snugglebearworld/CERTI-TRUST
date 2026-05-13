import type { CertificateRecord } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchCertificate(
  certificateId: string
): Promise<CertificateRecord | null> {
  const response = await fetch(
    `${API_BASE}/api/info/${encodeURIComponent(certificateId.toUpperCase())}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as CertificateRecord;
}

export async function verifyCertificate(certificateId: string): Promise<boolean> {
  const response = await fetch(
    `${API_BASE}/api/verify/${encodeURIComponent(certificateId.toUpperCase())}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    return false;
  }
  const payload = (await response.json()) as { valid: boolean };
  return payload.valid;
}
