"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, QrCode } from "lucide-react";
import { adminApi, adminGet, adminSend } from "@/lib/admin-api";
import type { LookupItem } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
function qrPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/certificate-qr/${path.replace(/^\//, "")}`;
}

const inputCls =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.08]";
const selectCls =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.08] appearance-none";
const disabledCls =
  "h-10 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-[13px] text-zinc-400 cursor-not-allowed";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-100" />
    </div>
  );
}

type Payload = {
  certificate_id: string;
  full_name: string;
  course: string;
  course_id?: string;
  issue_date: string;
  completion_date?: string;
  enrollment_date?: string;
  duration?: string;
  institute?: string;
  institution_id?: string;
  registration_number?: string;
  issuing_authority?: string;
  partner_id?: string;
  date_of_birth?: string;
  nic_number?: string;
  email?: string;
  image_url?: string;
  student_photo_path?: string;
  institution_logo_url?: string;
  partner_logo_url?: string;
  certificate_qr_path?: string;
  status: "valid" | "invalid";
};

export default function EditCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const [record, setRecord] = useState<Payload | null>(null);
  const [courses, setCourses] = useState<LookupItem[]>([]);
  const [institutions, setInstitutions] = useState<LookupItem[]>([]);
  const [partners, setPartners] = useState<LookupItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrPath, setQrPath] = useState<string | null>(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const router = useRouter();

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    Promise.all([
      adminGet("/api/admin/courses").then((r) => r.json()),
      adminGet("/api/admin/institutions").then((r) => r.json()),
      adminGet("/api/admin/partners").then((r) => r.json()),
    ]).then(([courseData, institutionData, partnerData]) => {
      setCourses(courseData.items ?? []);
      setInstitutions(institutionData.items ?? []);
      setPartners(partnerData.items ?? []);
    });

    params.then(({ certificateId }) => {
      fetch(`${API_BASE}/api/info/${certificateId}`)
        .then((r) => r.json())
        .then((data) => {
          setRecord(data);
          if (data.certificate_qr_path) setQrPath(data.certificate_qr_path);
        });
    });
  }, [params]);

  if (!record) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-5 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-zinc-900">Edit Certificate</h1>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{record.certificate_id}</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-[13px] text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700"
        >
          <span>←</span>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-600">
          {error}
        </div>
      )}

      {/* QR Card */}
      {qrPath && (
        <div className="mb-4 flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <img
            src={qrPublicUrl(qrPath)}
            alt={`QR for ${record.certificate_id}`}
            className="h-20 w-20 shrink-0 rounded-xl border border-zinc-100 object-contain"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-zinc-900">QR Code</p>
            <p className="mt-0.5 truncate text-[11.5px] text-zinc-400">
              /info/{record.certificate_id}
            </p>
            <a
              href={qrPublicUrl(qrPath)}
              download={`qr-${record.certificate_id}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          </div>
        </div>
      )}

      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setError(null);
          try {
            const res = await adminSend(`/api/admin/certificates/${record.certificate_id}`, "PUT", record);
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error((data?.detail as string) ?? `Update failed (${res.status})`);
            }
            router.push("/admin/dashboard");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update certificate");
            setSaving(false);
          }
        }}
      >
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="p-5 sm:p-6">
            {/* Certificate Info */}
            <SectionDivider label="Certificate Info" />
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Certificate ID</label>
                <input className={disabledCls} value={record.certificate_id} disabled />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Registration Number</label>
                <input
                  className={inputCls}
                  placeholder="e.g. REG-001"
                  value={record.registration_number ?? ""}
                  onChange={(e) => setRecord({ ...record, registration_number: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Status</label>
                <select
                  className={selectCls}
                  value={record.status}
                  onChange={(e) => setRecord({ ...record, status: e.target.value as "valid" | "invalid" })}
                >
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>
            </div>

            {/* Student Details */}
            <SectionDivider label="Student Details" />
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Student's full name"
                  value={record.full_name}
                  onChange={(e) => setRecord({ ...record, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Date of Birth</label>
                <input
                  type="date"
                  className={inputCls}
                  value={record.date_of_birth ?? ""}
                  onChange={(e) => setRecord({ ...record, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">NIC Number</label>
                <input
                  className={inputCls}
                  placeholder="National Identity Card number"
                  value={record.nic_number ?? ""}
                  onChange={(e) => setRecord({ ...record, nic_number: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Email Address</label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="student@example.com"
                  value={record.email ?? ""}
                  onChange={(e) => setRecord({ ...record, email: e.target.value })}
                />
              </div>
            </div>

            {/* Course & Institution */}
            <SectionDivider label="Course & Institution" />
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Course</label>
                <select
                  className={selectCls}
                  value={record.course_id ?? ""}
                  onChange={(e) => {
                    const item = courses.find((x) => x.id === e.target.value);
                    setRecord({ ...record, course_id: e.target.value, course: item?.name ?? record.course });
                  }}
                >
                  <option value="">Select a course</option>
                  {courses.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Institution</label>
                <select
                  className={selectCls}
                  value={record.institution_id ?? ""}
                  onChange={(e) => {
                    const item = institutions.find((x) => x.id === e.target.value);
                    setRecord({
                      ...record,
                      institution_id: e.target.value,
                      institute: item?.name ?? record.institute,
                      issuing_authority: item?.name ?? record.issuing_authority,
                      institution_logo_url: item?.logo_url ?? record.institution_logo_url,
                    });
                  }}
                >
                  <option value="">Select an institution</option>
                  {institutions.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Partner</label>
                <select
                  className={selectCls}
                  value={record.partner_id ?? ""}
                  onChange={(e) => {
                    const item = partners.find((x) => x.id === e.target.value);
                    setRecord({ ...record, partner_id: e.target.value, partner_logo_url: item?.logo_url ?? record.partner_logo_url });
                  }}
                >
                  <option value="">Select a partner</option>
                  {partners.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates & Duration */}
            <SectionDivider label="Dates & Duration" />
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">
                  Issue Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={record.issue_date ?? ""}
                  onChange={(e) => setRecord({ ...record, issue_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Enrollment Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={record.enrollment_date ?? ""}
                  onChange={(e) => setRecord({ ...record, enrollment_date: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Completion Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={record.completion_date ?? ""}
                  onChange={(e) => setRecord({ ...record, completion_date: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Duration</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 6 months"
                  value={record.duration ?? ""}
                  onChange={(e) => setRecord({ ...record, duration: e.target.value })}
                />
              </div>
            </div>

            {/* Student Photo */}
            <SectionDivider label="Student Photo" />
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Photo URL</label>
                <input
                  className={inputCls}
                  placeholder="https:// or Supabase storage path"
                  value={record.image_url ?? ""}
                  onChange={(e) =>
                    setRecord({ ...record, image_url: e.target.value, student_photo_path: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-100" />
                <span className="text-[11px] text-zinc-400">or upload file</span>
                <div className="h-px flex-1 bg-zinc-100" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="block w-full rounded-xl border border-dashed border-zinc-200 px-3 py-3 text-[12.5px] text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fileBase64 = await fileToBase64(file);
                  const res = await adminSend(
                    "/api/admin/media/upload?bucket=student-photos&file_name=" + encodeURIComponent(file.name),
                    "POST",
                    { file_base64: fileBase64, content_type: file.type || "application/octet-stream" }
                  );
                  const data = await res.json();
                  setRecord({ ...record, image_url: data.path, student_photo_path: data.path });
                }}
              />
              {record.image_url && (
                <p className="text-[11.5px] text-emerald-600">✓ Photo path: {record.image_url}</p>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-wrap items-center gap-2.5 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3.5 sm:px-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              disabled={qrGenerating}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-[13px] font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
              onClick={async () => {
                setQrGenerating(true);
                try {
                  const result = await adminApi.generateCertificateQr(record.certificate_id);
                  setQrPath(result.certificate_qr_path);
                } catch {
                  setError("QR generation failed — check that the qrcode package is installed in the backend.");
                } finally {
                  setQrGenerating(false);
                }
              }}
            >
              <QrCode className="h-3.5 w-3.5" />
              {qrGenerating ? "Generating…" : qrPath ? "Regenerate QR" : "Generate QR"}
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-xl border border-red-100 bg-red-50 px-4 text-[13px] font-medium text-red-600 transition hover:bg-red-100"
              onClick={async () => {
                if (!confirm("Permanently delete this certificate? This cannot be undone.")) return;
                await adminSend(`/api/admin/certificates/${record.certificate_id}`, "DELETE");
                router.push("/admin/dashboard");
              }}
            >
              Delete
            </button>
            <Link
              href="/admin/dashboard"
              className="flex h-9 items-center rounded-xl border border-zinc-200 px-4 text-[13px] text-zinc-500 transition hover:bg-zinc-100"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
}
