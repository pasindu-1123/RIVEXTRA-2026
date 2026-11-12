// src/app/card/[id]/CardUI.js
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import {
  Activity,
  ArrowLeft,
  Cake,
  Calendar,
  Check,
  Cpu,
  Download,
  Loader2,
  Mars,
  Printer,
  QrCode,
  Ruler,
  School,
  ShieldCheck,
  Venus,
  Weight,
} from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function CardUI({ student }) {
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [age, setAge] = useState(student.age ?? null);

  // Birthday format (UTC use karanawa, timezone nisa dawasak wenas wenna epa)
  let birthdayDisplay = "N/A";
  if (student.birthday) {
    const d = new Date(student.birthday);
    birthdayDisplay = isNaN(d.getTime())
      ? String(student.birthday)
      : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  // Age eka birthday eken calculate karanawa (model eke age field eka naha)
  useEffect(() => {
    if (!student.birthday) return;
    const birth = new Date(student.birthday);
    if (isNaN(birth.getTime())) return;
    const today = new Date();
    let a = today.getFullYear() - birth.getUTCFullYear();
    const m = today.getMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getUTCDate())) a--;
    setAge(a);
  }, [student.birthday]);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `Rivextra-Card-${student.name}.png`;
      link.href = dataUrl;
      link.click();

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const isFemale = student.gender === "Female";
  const GenderIcon = isFemale ? Venus : Mars;
  const gradeText = /^\d/.test(String(student.grade || ""))
    ? `Grade ${student.grade}`
    : student.grade;

  const stats = [
    {
      icon: Cake,
      label: "AGE",
      value: age !== null ? `${age} yrs` : "—",
      tone: "bg-blue-500/15 text-blue-300",
    },
    {
      icon: GenderIcon,
      label: "GENDER",
      value: student.gender || "—",
      tone: isFemale
        ? "bg-pink-500/15 text-pink-300"
        : "bg-sky-500/15 text-sky-300",
    },
    {
      icon: Ruler,
      label: "HEIGHT",
      value: student.height ? `${student.height} cm` : "—",
      tone: "bg-cyan-500/15 text-cyan-300",
    },
    {
      icon: Weight,
      label: "WEIGHT",
      value: student.weight ? `${student.weight} kg` : "—",
      tone: "bg-purple-500/15 text-purple-300",
    },
    {
      icon: Activity,
      label: "BMI",
      value: student.bmi ?? "—",
      tone: "bg-emerald-500/15 text-emerald-300",
    },
    {
      icon: Calendar,
      label: "BIRTHDAY",
      value: birthdayDisplay,
      tone: "bg-amber-500/15 text-amber-300",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080f] px-4 py-6 text-white sm:px-6 sm:py-10">
      {/* Background */}
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-32 top-0 h-[360px] w-[360px] rounded-full bg-blue-600/20 blur-[130px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-[260px] w-[300px] rounded-full bg-purple-900/20 blur-[120px] sm:left-10 sm:h-[300px] sm:w-[400px]" />

      <div className="animate-fade-in relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-6">
        {/* Navigation */}
        <div className="flex w-full items-center justify-between">
          <Link
            href="/create"
            className="group inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Create another
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-emerald-300">
            <ShieldCheck className="h-3 w-3" /> VERIFIED
          </span>
        </div>

        {/* ================= CARD (print / download) ================= */}
        <div
          ref={cardRef}
          className="print-card card-shine relative w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a1120] shadow-[0_30px_80px_-20px_rgba(37,99,235,0.5)]"
        >
          {/* Header: school logo | faculty logo | RIVEXTRA wordmark */}
          <div className="relative bg-white px-4 py-5 sm:px-8 sm:py-6">
            <div className="mx-auto flex max-w-full items-center justify-center gap-3 sm:gap-6">
              {/* School logo */}
              <div className="flex h-14 shrink-0 items-center justify-center sm:h-20">
                <img
                  src="/assets/school-logo.png"
                  alt="School Logo"
                  className="h-full w-auto object-contain"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="h-10 w-px shrink-0 bg-[#0a1b4d]/20 sm:h-14" />

              {/* Technological Faculty logo */}
              <div className="flex h-14 shrink-0 items-center justify-center sm:h-20">
                <img
                  src="/assets/rev-logo.png"
                  alt="Technological Faculty"
                  className="h-full w-auto object-contain"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="h-10 w-px shrink-0 bg-[#0a1b4d]/20 sm:h-14" />

              {/* RIVEXTRA wordmark (wide logo, so sized by width) */}
              <div className="flex h-14 min-w-0 items-center justify-center sm:h-20">
                <img
                  src="/assets/rivextra-logo.png"
                  alt="RIVEXTRA '26"
                  className="w-24 object-contain sm:w-36"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-700 via-cyan-400 to-blue-700" />
          </div>

          <div className="relative px-6 pb-7 pt-8 sm:px-8">
            <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl" />

            {/* Avatar + name */}
            <div className="relative flex flex-col items-center text-center">
              <div className="animate-pop mb-5 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 p-[3px] shadow-[0_0_35px_rgba(59,130,246,0.5)]">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0a1120] text-4xl font-black text-blue-300">
                  {(student.name || "?").trim().charAt(0).toUpperCase()}
                </div>
              </div>

              <h1 className="max-w-full break-words text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
                {student.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
                {gradeText && (
                  <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-blue-300">
                    {gradeText}
                  </span>
                )}
                {student.gender && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${
                      isFemale
                        ? "border-pink-400/30 bg-pink-500/10 text-pink-300"
                        : "border-sky-400/30 bg-sky-500/10 text-sky-300"
                    }`}
                  >
                    <GenderIcon className="h-3.5 w-3.5" />
                    {student.gender}
                  </span>
                )}
              </div>

              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-400">
                <School className="h-4 w-4 shrink-0 text-blue-400" />
                <span className="break-words">{student.school}</span>
              </p>
            </div>

            {/* Details tiles */}
            <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map(({ icon: Icon, label, value, tone }, i) => (
                <div
                  key={label}
                  className="animate-pop rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-center"
                  style={{
                    animationDelay: `${300 + i * 90}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <span
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <p className="mt-2.5 text-[10px] font-semibold tracking-[0.2em] text-gray-500">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-bold">{value}</p>
                </div>
              ))}
            </div>

            {/* QR */}
            {student.qrCode && (
              <div className="relative mt-7 flex flex-col items-center">
                <div className="rounded-2xl bg-white p-3 shadow-[0_10px_40px_rgba(59,130,246,0.35)]">
                  <img
                    src={student.qrCode}
                    alt="QR Code"
                    className="h-40 w-40 sm:h-44 sm:w-44"
                  />
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <QrCode className="h-3.5 w-3.5 text-blue-400" />
                  Scan to view this digital profile
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 bg-white/[0.03] px-6 py-4 text-center sm:flex-row sm:text-left">
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <Cpu className="h-4 w-4 shrink-0 text-blue-400" />
              <span>
                Powered by{" "}
                <span className="font-semibold text-blue-300">
                  RCC Technology Faculty
                </span>
              </span>
            </p>
            <p className="text-[10px] font-bold tracking-[0.25em] text-gray-500">
              RIVEXTRA &apos;26
            </p>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex w-full gap-3 sm:gap-4">
          <button
            onClick={() => window.print()}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 py-3 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-white/20 active:scale-95"
          >
            <Printer className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            Print
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group primary-button flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : isSaved ? (
              <>
                <Check className="animate-pop h-5 w-5" />
                Saved!
              </>
            ) : (
              <>
                <Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" />
                Download
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-card,
          .print-card * {
            visibility: visible;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 420px;
            margin: 0;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}
