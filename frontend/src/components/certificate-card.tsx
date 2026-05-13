"use client";

import {
  ShieldCheck,
  ArrowLeft,
  User,
  GraduationCap,
  Building2,
  Mail,
  FileText,
  BadgeCheck,
  CircleCheck,
  Calendar,
  Fingerprint,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CertificateRecord } from "@/lib/types";

type CertificateCardProps = {
  record: CertificateRecord;
};

export function CertificateCard({ record }: CertificateCardProps) {
  const router = useRouter();
  const certificate = {
    ...record,
    image_url: record.image_url ?? record.student_photo_path,
  };
  const formatDate = (date?: string | null) => (date ? date : "N/A");
  const isValid = record.status === "valid";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-gray-100 to-slate-50 font-sans text-slate-900 p-6 md:p-12 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 backdrop-blur-md">
          
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="group flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-900 transition-all duration-300 bg-white/50 rounded-full hover:bg-slate-200/50 shadow-sm border border-slate-200/50"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
                    CertiTrust Portal
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
                    Information Access
                  </h1>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200/50 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-600">Verified by CertiTrust</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-slate-200/80 rounded-[2rem] shadow-xl shadow-indigo-900/5 p-8 sm:p-10">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-700 via-blue-400 to-sky-300" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left flex-1">
                <div className="relative">
                  <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-[2rem] overflow-hidden border-[5px] border-slate-200 shadow-2xl bg-white flex-shrink-0">
                    {certificate.image_url ? (
                      <Image
                        src={certificate.image_url}
                        alt={certificate.full_name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest border border-emerald-200/50 shadow-sm">
                    <BadgeCheck className="w-4 h-4" />
                    Authentic Record
                  </div>

                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {certificate.full_name}
                    </h2>
                    <p className="text-lg text-slate-500 mt-1 font-medium">
                      {certificate.course || "Course not specified"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400" />
                      ID: {certificate.certificate_id}
                    </div>
                    {certificate.institute && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {certificate.institute}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 min-w-[200px]">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2 shadow-inner">
                  <CircleCheck className="w-7 h-7" />
                </div>
                <span className="font-bold text-lg text-slate-900">
                  Status: {isValid ? "Verified" : "Invalid"}
                </span>
                <div className="w-full h-px bg-slate-200 my-2" />
                <p className="text-xs text-slate-500 font-medium text-center">
                  Data authenticated securely.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <section className="bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] shadow-lg shadow-slate-200/20 p-8 flex flex-col hover:bg-white transition-colors duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Personal Data</h3>
              </div>

              <div className="space-y-6 flex-1">
                <div className="group">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Full Name
                  </p>
                  <p className="font-semibold text-slate-900 break-words text-base">
                    {certificate.full_name}
                  </p>
                </div>

                {certificate.date_of_birth && (
                  <div className="group">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                      Date of Birth
                    </p>
                    <p className="font-semibold text-slate-900 break-words text-base">
                      {formatDate(certificate.date_of_birth)}
                    </p>
                  </div>
                )}

                {certificate.nic_number && (
                  <div className="group">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="opacity-60">
                        <Fingerprint className="w-4 h-4" />
                      </span>
                      NIC Number
                    </p>
                    <p className="font-semibold text-slate-900 break-words text-base">
                      {certificate.nic_number}
                    </p>
                  </div>
                )}

                {certificate.email && (
                  <div className="group">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="opacity-60">
                        <Mail className="w-4 h-4" />
                      </span>
                      Email Address
                    </p>
                    <p className="font-semibold text-slate-900 break-words text-base">
                      {certificate.email}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] shadow-lg shadow-slate-200/20 p-8 flex flex-col hover:bg-white transition-colors duration-300">
              <div className="flex items-start justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl shadow-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Academic Details</h3>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="group">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Programme
                  </p>
                  <p className="font-semibold text-slate-900 break-words text-xl">
                    {certificate.course || "Course not specified"}
                  </p>
                </div>

                {certificate.institution_logo_url && (
                  <div className="w-28 h-28 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center p-3 shrink-0">
                    <div className="relative w-full h-full bg-transparent">
                      <Image
                        src={certificate.institution_logo_url}
                        alt="Institution Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {certificate.institute && (
                  <div className="group">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="opacity-60">
                        <Building2 className="w-4 h-4" />
                      </span>
                      Institute
                    </p>
                    <p className="font-semibold text-slate-900 break-words text-base">
                      {certificate.institute}
                    </p>
                  </div>
                )}

                {certificate.registration_number && (
                  <div className="group">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="opacity-60">
                        <FileText className="w-4 h-4" />
                      </span>
                      Registration Number
                    </p>
                    <p className="font-semibold text-slate-900 break-words text-base">
                      {certificate.registration_number}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-col gap-6">
              <section className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex-1">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Calendar className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="p-2.5 bg-slate-800 text-slate-300 rounded-xl shadow-inner border border-slate-700">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Timeline</h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-700/50" />

                  {certificate.enrollment_date && (
                    <div className="relative pl-6">
                      <div className="absolute left-[2px] top-[4px] w-3 h-3 rounded-full border-[3px] border-slate-900 bg-sky-300" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                          Enrollment Date
                        </span>
                        <span className="text-base font-bold text-white">
                          {formatDate(certificate.enrollment_date)}
                        </span>
                      </div>
                    </div>
                  )}

                  {certificate.completion_date && (
                    <div className="relative pl-6">
                      <div className="absolute left-[1px] top-[2px] w-3 h-3 rounded-full border-[3px] border-slate-900 bg-blue-400" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                          Completion Date
                        </span>
                        <span className="text-base font-bold text-white">
                          {formatDate(certificate.completion_date)}
                        </span>
                      </div>
                    </div>
                  )}

                  {certificate.duration && (
                    <div className="relative pl-6">
                      <div className="absolute left-[2px] top-[2px] w-3 h-3 rounded-full border-[3px] border-slate-900 bg-blue-700" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                          Duration
                        </span>
                        <span className="text-base font-bold text-white">
                          {certificate.duration}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/50 relative z-10">
                  <p className="text-base text-center font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Issue Date
                  </p>
                  <p className="text-l text-center font-bold text-white">
                    {formatDate(certificate.issue_date)}
                  </p>
                </div>
              </section>

              {certificate.issuing_authority && (
                <section className="bg-gradient-to-br from-blue-100 to-blue-300 border border-indigo-100/80 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-indigo-700">
                    <BadgeCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Issuing Authority
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {certificate.issuing_authority}
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>

        <footer className="relative z-10 mt-24 border-t border-slate-500/60 pt-12 pb-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
            {(certificate.partner_logo_url || certificate.institution_logo_url) && (
              <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
                {certificate.partner_logo_url && (
                  <div className="relative h-20 w-52 sm:h-24 sm:w-60 group flex items-center justify-center bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:scale-105 duration-300">
                    <Image
                      src={certificate.partner_logo_url}
                      alt="Partner Logo"
                      fill
                      className="object-contain p-2 transition-all duration-500"
                    />
                  </div>
                )}
                {certificate.institution_logo_url && (
                  <div className="relative h-20 w-52 sm:h-24 sm:w-60 group flex items-center justify-center bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:scale-105 duration-300">
                    <Image
                      src={certificate.institution_logo_url}
                      alt="Institution Logo"
                      fill
                      className="object-contain p-2 transition-all duration-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-col items-center gap-1.5 text-xs font-medium text-slate-400">
              <p>© 2026 CertiTrust Portal. Verified academic credentials.</p>
              <p className="opacity-70 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Secure Verification System
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}