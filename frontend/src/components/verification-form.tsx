"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

export function VerificationForm() {
  const [certificateId, setCertificateId] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!certificateId.trim()) return;
        router.push(`/info/${encodeURIComponent(certificateId.trim().toUpperCase())}`);
      }}
      className="mx-auto flex w-full max-w-[620px] items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-white p-2 shadow-[var(--shadow-soft)]"
    >
      <div className="flex h-12 flex-1 items-center rounded-xl px-3 text-slate-400">
        <SearchIcon className="mr-2 h-4 w-4" />
        <input
          className="w-full border-none bg-transparent text-sm outline-none"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(event) => setCertificateId(event.target.value)}
        />
      </div>
      <button
        className="h-12 min-w-[170px] rounded-xl bg-[var(--blue-primary)] px-5 font-semibold text-white transition hover:brightness-95"
        type="submit"
      >
        Verify Now
      </button>
    </form>
  );
}
