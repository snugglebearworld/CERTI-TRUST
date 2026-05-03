import { supabase } from "@/lib/supabase";
import type {
  CertificateListItem,
  CertificateListParams,
  CertificateRecord,
  LookupCreatePayload,
  LookupItem,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function adminGet(path: string) {
  return fetch(`${API_BASE}${path}`, {
    headers: await getAuthHeaders()
  });
}

export async function adminSend(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) {
  return fetch(`${API_BASE}${path}`, {
    method,
    headers: await getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined
  });
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(await getAuthHeaders()),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = (data?.detail as string) || message;
    } catch {
      // Ignore malformed JSON response bodies.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

type PaginatedCertificates = {
  items: CertificateListItem[];
  total: number;
  limit: number;
  offset: number;
};

export const adminApi = {
  listCertificates(params: CertificateListParams = {}) {
    return requestJson<PaginatedCertificates>(
      `/api/admin/certificates${buildQuery({
        q: params.q,
        status: params.status,
        course_id: params.course_id,
        institution_id: params.institution_id,
        partner_id: params.partner_id,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      })}`
    );
  },
  createCertificate(payload: CertificateRecord) {
    return requestJson<CertificateRecord>("/api/admin/certificates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateCertificate(certificateId: string, payload: CertificateRecord) {
    return requestJson<CertificateRecord>(`/api/admin/certificates/${certificateId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteCertificate(certificateId: string) {
    return requestJson<{ deleted: boolean }>(`/api/admin/certificates/${certificateId}`, {
      method: "DELETE",
    });
  },
  generateCertificateQr(certificateId: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const qs = base ? `?base_url=${encodeURIComponent(base)}` : "";
    return requestJson<{ certificate_id: string; certificate_qr_path: string; verification_url: string }>(
      `/api/admin/certificates/${certificateId}/qr${qs}`,
      { method: "POST" }
    );
  },
  async getCertificate(certificateId: string) {
    return requestJson<CertificateRecord>(`/api/info/${certificateId}`, {
      headers: { "Content-Type": "application/json" },
    });
  },
  listCourses() {
    return requestJson<{ items: LookupItem[] }>("/api/admin/courses");
  },
  createCourse(payload: LookupCreatePayload) {
    return requestJson<LookupItem>("/api/admin/courses", { method: "POST", body: JSON.stringify(payload) });
  },
  updateCourse(id: string, payload: LookupCreatePayload) {
    return requestJson<LookupItem>(`/api/admin/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteCourse(id: string) {
    return requestJson<{ deleted: boolean }>(`/api/admin/courses/${id}`, { method: "DELETE" });
  },
  listInstitutions() {
    return requestJson<{ items: LookupItem[] }>("/api/admin/institutions");
  },
  createInstitution(payload: LookupCreatePayload) {
    return requestJson<LookupItem>("/api/admin/institutions", { method: "POST", body: JSON.stringify(payload) });
  },
  updateInstitution(id: string, payload: LookupCreatePayload) {
    return requestJson<LookupItem>(`/api/admin/institutions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteInstitution(id: string) {
    return requestJson<{ deleted: boolean }>(`/api/admin/institutions/${id}`, { method: "DELETE" });
  },
  listPartners() {
    return requestJson<{ items: LookupItem[] }>("/api/admin/partners");
  },
  createPartner(payload: LookupCreatePayload) {
    return requestJson<LookupItem>("/api/admin/partners", { method: "POST", body: JSON.stringify(payload) });
  },
  updatePartner(id: string, payload: LookupCreatePayload) {
    return requestJson<LookupItem>(`/api/admin/partners/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deletePartner(id: string) {
    return requestJson<{ deleted: boolean }>(`/api/admin/partners/${id}`, { method: "DELETE" });
  },
};
