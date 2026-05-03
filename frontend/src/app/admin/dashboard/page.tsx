"use client";

import Link from "next/link";
import { Plus, QrCode, RefreshCw, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { CertificateListItem } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
function qrPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/certificate-qr/${path.replace(/^\//, "")}`;
}

export default function AdminDashboardPage() {
  const [records, setRecords] = useState<CertificateListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const loadCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listCertificates({
        q: search,
        limit: pageSize,
        offset: page * pageSize,
      });
      setRecords(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-zinc-900">Certificates</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            {loading ? "Loading..." : `${total} records in database`}
          </p>
        </div>
        <Link
          href="/admin/certificates/new"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Certificate
        </Link>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <div className="relative flex-1" style={{ minWidth: "180px" }}>
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-[13px] placeholder:text-zinc-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/[0.08]"
              placeholder="Search ID, name, or course…"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
            />
          </div>
          <button
            onClick={loadCertificates}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-[13px] text-zinc-600 transition hover:bg-zinc-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 my-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12.5px] text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                  Certificate ID
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                  Student
                </th>
                <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400 sm:table-cell">
                  Course
                </th>
                <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400 md:table-cell">
                  Institution
                </th>
                <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400 lg:table-cell">
                  Issue Date
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                  QR
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {records.map((item) => (
                <tr key={item.certificate_id} className="transition-colors hover:bg-zinc-50/70">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/certificates/${item.certificate_id}`}
                      className="font-mono text-[12px] font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
                    >
                      {item.certificate_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-zinc-900">
                    {item.full_name}
                  </td>
                  <td className="hidden px-4 py-3 text-[13px] text-zinc-500 sm:table-cell">
                    {item.course || <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-[13px] text-zinc-500 md:table-cell">
                    {item.institution || <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-[13px] text-zinc-500 lg:table-cell">
                    {item.issue_date || <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        item.status === "valid"
                          ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border border-red-100 bg-red-50 text-red-600"
                      }`}
                    >
                      {item.status === "valid" ? "Valid" : "Invalid"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.certificate_qr_path ? (
                      <a
                        href={qrPublicUrl(item.certificate_qr_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View / download QR code"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-blue-600"
                      >
                        <QrCode className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-zinc-200">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-[13px] text-zinc-400">
                    No certificates found.{" "}
                    <Link href="/admin/certificates/new" className="text-blue-600 hover:underline">
                      Add the first one.
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600" />
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
          <span className="text-[12px] text-zinc-400">{total} total</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[12px] text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-1 text-[12px] text-zinc-400">Page {page + 1}</span>
            <button
              disabled={(page + 1) * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[12px] text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
