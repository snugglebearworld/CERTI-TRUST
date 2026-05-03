"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminApi, adminGet, adminSend } from "@/lib/admin-api";
import type { LookupItem } from "@/lib/types";

const inputCls =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.08]";
const selectCls =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.08] appearance-none";

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

export default function NewCertificatePage() {
  const [courses, setCourses] = useState<LookupItem[]>([]);
  const [institutions, setInstitutions] = useState<LookupItem[]>([]);
  const [partners, setPartners] = useState<LookupItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    certificate_id: "",
    full_name: "",
    course: "",
    course_id: "",
    issue_date: "",
    completion_date: "",
    enrollment_date: "",
    duration: "",
    institute: "",
    institution_id: "",
    registration_number: "",
    issuing_authority: "",
    partner_id: "",
    date_of_birth: "",
    nic_number: "",
    email: "",
    image_url: "",
    student_photo_path: "",
    institution_logo_url: "",
    partner_logo_url: "",
    status: "valid",
  });

  const router = useRouter();

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const uploadImage = async (file: File) => {
    const fileBase64 = await fileToBase64(file);
    const res = await adminSend(
      "/api/admin/media/upload?bucket=student-photos&file_name=" + encodeURIComponent(file.name),
      "POST",
      { file_base64: fileBase64, content_type: file.type || "application/octet-stream" }
    );
    const data = await res.json();
    setForm((p) => ({ ...p, image_url: data.path, student_photo_path: data.path }));
  };

  useEffect(() => {
    Promise.all([
      adminGet("/api/admin/courses").then((r) => r.json()),
      adminGet("/api/admin/institutions").then((r) => r.json()),
      adminGet("/api/admin/partners").then((r) => r.json()),
    ]).then(([courseData, institutionData, partnerData]) => {
      const courseItems = (courseData.items ?? []).filter((i: LookupItem) => i.is_active !== false);
      setCourses(courseItems);
      setInstitutions((institutionData.items ?? []).filter((i: LookupItem) => i.is_active !== false));
      setPartners((partnerData.items ?? []).filter((i: LookupItem) => i.is_active !== false));
      if (courseItems.length === 1) {
        setForm((p) => ({ ...p, course_id: courseItems[0].id, course: courseItems[0].name }));
      }
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-5 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-zinc-900">New Certificate</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">Add a new student certificate record.</p>
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
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-600">
          {error}
        </div>
      )}

      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setError(null);
          try {
            const res = await adminSend("/api/admin/certificates", "POST", form);
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error((data?.detail as string) ?? `Save failed (${res.status})`);
            }
            try {
              await adminApi.generateCertificateQr(form.certificate_id);
            } catch {
              // QR failure is non-fatal — navigate and let the admin regenerate from the edit page
            }
            router.push("/admin/dashboard");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save certificate");
            setSaving(false);
          }
        }}
      >
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="p-5 sm:p-6">
            {/* Certificate Info */}
            <SectionDivider label="Certificate Info" />
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">
                  Certificate ID <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. CERT-2024-001"
                  value={form.certificate_id}
                  onChange={(e) => setForm((p) => ({ ...p, certificate_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">
                  Registration Number
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. REG-001"
                  value={form.registration_number}
                  onChange={(e) => setForm((p) => ({ ...p, registration_number: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  className={selectCls}
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
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
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Date of Birth</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.date_of_birth}
                  onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">NIC Number</label>
                <input
                  className={inputCls}
                  placeholder="National Identity Card number"
                  value={form.nic_number}
                  onChange={(e) => setForm((p) => ({ ...p, nic_number: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Email Address</label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Course & Institution */}
            <SectionDivider label="Course & Institution" />
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">
                  Course <span className="text-red-400">*</span>
                </label>
                <select
                  className={selectCls}
                  value={form.course_id}
                  onChange={(e) => {
                    const item = courses.find((x) => x.id === e.target.value);
                    setForm((p) => ({ ...p, course_id: e.target.value, course: item?.name ?? "" }));
                  }}
                  required
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
                  value={form.institution_id}
                  onChange={(e) => {
                    const item = institutions.find((x) => x.id === e.target.value);
                    setForm((p) => ({
                      ...p,
                      institution_id: e.target.value,
                      institute: item?.name ?? "",
                      issuing_authority: item?.name ?? "",
                      institution_logo_url: item?.logo_url ?? "",
                    }));
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
                  value={form.partner_id}
                  onChange={(e) => {
                    const item = partners.find((x) => x.id === e.target.value);
                    setForm((p) => ({ ...p, partner_id: e.target.value, partner_logo_url: item?.logo_url ?? "" }));
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
                  value={form.issue_date}
                  onChange={(e) => setForm((p) => ({ ...p, issue_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Enrollment Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.enrollment_date}
                  onChange={(e) => setForm((p) => ({ ...p, enrollment_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Completion Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.completion_date}
                  onChange={(e) => setForm((p) => ({ ...p, completion_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-zinc-500">Duration</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 6 months"
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
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
                  value={form.image_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, image_url: e.target.value, student_photo_path: e.target.value }))
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
                  if (file) await uploadImage(file);
                }}
              />
              {form.image_url && (
                <p className="text-[11.5px] text-emerald-600">✓ Photo path: {form.image_url}</p>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2.5 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3.5 sm:px-6">
            <button
              disabled={saving}
              type="submit"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Certificate"}
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
