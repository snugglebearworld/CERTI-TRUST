"use client";

import { Check, Pencil, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { LookupItem } from "@/lib/types";

const inputCls =
  "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.08]";

export default function CoursesPage() {
  const [items, setItems] = useState<LookupItem[]>([]);
  const [form, setForm] = useState({ name: "", code: "", level: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LookupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);

  const load = async () => {
    const data = await adminApi.listCourses();
    setItems(data.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-5 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold leading-tight text-zinc-900">Courses</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500">
          Manage course dropdown options used when creating certificates.
        </p>
      </div>

      {/* Add form */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="border-b border-zinc-100 px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Add Course</p>
        </div>
        <div className="p-5">
          {addError && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {addError}
            </div>
          )}
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setAddError(null);
              try {
                await adminApi.createCourse({ ...form, is_active: true });
                setForm({ name: "", code: "", level: "" });
                await load();
              } catch (e) {
                setAddError(e instanceof Error ? e.message : "Failed to add course");
              }
            }}
            className="grid gap-3 sm:grid-cols-[1fr_140px_140px_auto]"
          >
            <div>
              <label className="mb-1 block text-[11px] font-medium text-zinc-400">Course Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Japanese Language"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-zinc-400">Code</label>
              <input
                className={inputCls}
                placeholder="e.g. JP-N2"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-zinc-400">Level</label>
              <input
                className={inputCls}
                placeholder="e.g. N2"
                value={form.level}
                onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="h-9 rounded-xl bg-blue-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Name</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Code</th>
                <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400 sm:table-cell">Level</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Status</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600" />
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[13px] text-zinc-400">
                    No courses yet. Add one above.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-zinc-50/70">
                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <input
                        className={inputCls}
                        value={draft?.name ?? ""}
                        onChange={(e) => setDraft((p) => (p ? { ...p, name: e.target.value } : p))}
                      />
                    ) : (
                      <span className="text-[13px] font-medium text-zinc-900">{item.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <input
                        className={inputCls}
                        value={draft?.code ?? ""}
                        onChange={(e) => setDraft((p) => (p ? { ...p, code: e.target.value } : p))}
                      />
                    ) : item.code ? (
                      <span className="font-mono text-[11.5px] text-zinc-500">{item.code}</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {editId === item.id ? (
                      <input
                        className={inputCls}
                        value={draft?.level ?? ""}
                        onChange={(e) => setDraft((p) => (p ? { ...p, level: e.target.value } : p))}
                      />
                    ) : item.level ? (
                      <span className="text-[13px] text-zinc-500">{item.level}</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        item.is_active
                          ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border border-zinc-100 bg-zinc-50 text-zinc-400"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editId === item.id ? (
                        <>
                          <button
                            title="Save"
                            onClick={async () => {
                              if (!draft) return;
                              await adminApi.updateCourse(item.id, draft);
                              setEditId(null);
                              setDraft(null);
                              await load();
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Cancel"
                            onClick={() => { setEditId(null); setDraft(null); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          title="Edit"
                          onClick={() => { setEditId(item.id); setDraft(item); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        title={item.is_active ? "Deactivate" : "Activate"}
                        onClick={async () => {
                          await adminApi.updateCourse(item.id, { ...item, is_active: !item.is_active });
                          await load();
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-amber-50 hover:text-amber-600"
                      >
                        {item.is_active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        title="Delete"
                        onClick={async () => {
                          if (!confirm(`Delete "${item.name}"?`)) return;
                          await adminApi.deleteCourse(item.id);
                          await load();
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
