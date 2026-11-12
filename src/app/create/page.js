"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Cake,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  GraduationCap,
  Loader2,
  Mars,
  QrCode,
  RotateCcw,
  Ruler,
  School,
  ShieldCheck,
  Sparkles,
  UserRound,
  Venus,
  Weight,
} from "lucide-react";
import CardPreview from "./CardPreview";
import Reveal from "../components/Reveal";

const initialDetails = {
  name: "",
  grade: "",
  height: "",
  weight: "",
  school: "",
  gender: "",
  birthday: "",
  age: "",
  bmi: "",
};

// Field: icon + label + (filled nam green tick) + staggered fade-up animation
function Field({ icon: Icon, label, done, delay = 0, className = "", children }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="group">
        <label className="mb-2 flex items-center gap-2 text-sm text-gray-400 transition group-focus-within:text-blue-300">
          <Icon className="h-4 w-4 text-blue-400" />
          {label}
          {done && (
            <CheckCircle2 className="animate-pop ml-auto h-4 w-4 text-emerald-400" />
          )}
        </label>
        {children}
      </div>
    </Reveal>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0c1424] px-4 py-3 text-base text-white placeholder:text-gray-600 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 sm:text-sm md:text-base";

const genderOptions = [
  {
    value: "Male",
    label: "Male",
    icon: Mars,
    tone: "bg-blue-500/15 text-blue-300",
  },
  {
    value: "Female",
    label: "Female",
    icon: Venus,
    tone: "bg-pink-500/15 text-pink-300",
  },
];

// Lassana custom dropdown (Male / Female)
function GenderSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const selected = genderOptions.find((o) => o.value === value);
  const SelectedIcon = selected?.icon;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${inputClass} flex items-center justify-between text-left ${
          open ? "border-blue-500 ring-4 ring-blue-500/10" : ""
        }`}
      >
        {selected ? (
          <span className="flex items-center gap-2.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md ${selected.tone}`}
            >
              <SelectedIcon className="h-4 w-4" />
            </span>
            {selected.label}
          </span>
        ) : (
          <span className="text-gray-600">Select gender</span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
            open ? "rotate-180 text-blue-400" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-fade-in absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#0c1424]/95 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          {genderOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-blue-500/15 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition group-hover:scale-110 ${opt.tone}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{opt.label}</span>
                  {isSelected && (
                    <Check className="animate-pop h-4 w-4 text-blue-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const steps = [
  { label: "Details", icon: UserRound },
  { label: "Generate", icon: Sparkles },
  { label: "Download", icon: Download },
];

export default function CreatePage() {
  const [details, setDetails] = useState(initialDetails);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedQr, setGeneratedQr] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);

  const previewRef = useRef(null);

  // Age Auto Calculate
  useEffect(() => {
    if (details.birthday) {
      const birthDate = new Date(details.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      )
        age--;
      setDetails((prev) => ({ ...prev, age: age.toString() }));
    } else {
      setDetails((prev) => ({ ...prev, age: "" }));
    }
  }, [details.birthday]);

  // BMI Auto Calculate
  useEffect(() => {
    if (details.height && details.weight) {
      const heightInMeters = parseFloat(details.height) / 100;
      const weightInKg = parseFloat(details.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmiValue = (
          weightInKg /
          (heightInMeters * heightInMeters)
        ).toFixed(1);
        setDetails((prev) => ({ ...prev, bmi: bmiValue }));
      }
    } else {
      setDetails((prev) => ({ ...prev, bmi: "" }));
    }
  }, [details.height, details.weight]);

  function handleChange(event) {
    const { name, value } = event.target;
    setDetails((previous) => ({ ...previous, [name]: value }));
    if (errorMsg) setErrorMsg("");
  }

  function handleGender(value) {
    setDetails((previous) => ({ ...previous, gender: value }));
    if (errorMsg) setErrorMsg("");
  }

  // Mouse-follow spotlight
  function handleSpotlight(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  // New card hadanna reset
  function handleReset() {
    setDetails(initialDetails);
    setGeneratedQr(null);
    setIsGenerated(false);
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Form Submit
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMsg("");

    if (!details.gender) {
      setErrorMsg("කරුණාකර ස්ත්‍රී/පුරුෂ භාවය (Gender) තෝරන්න.");
      return;
    }

    const ageNumber = parseInt(details.age);
    if (ageNumber >= 20) {
      setErrorMsg("QR Card generate කළ හැක්කේ අවුරුදු 20ට අඩු අයට පමණි.");
      return;
    }
    if (ageNumber < 0) {
      setErrorMsg("කරුණාකර වලංගු උපන්දිනයක් ඇතුළත් කරන්න.");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Student ව Save කිරීම
      const studentResponse = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          height: Number(details.height),
          weight: Number(details.weight),
          bmi: Number(details.bmi),
          age: Number(details.age),
        }),
      });

      const studentData = await studentResponse.json();
      if (!studentResponse.ok) {
        throw new Error(studentData.error || "දත්ත සුරැකීමේ දෝෂයක් සිදුවිය.");
      }

      // 2. QR එක Generate කිරීම
      const qrResponse = await fetch("/api/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentData.student._id }),
      });

      const qrData = await qrResponse.json();
      if (!qrResponse.ok) {
        throw new Error(qrData.error || "QR එක සෑදීමේ දෝෂයක් සිදුවිය.");
      }

      // 3. Card එකට QR එක දැමීම
      setGeneratedQr(qrData.qrCode);
      setIsGenerated(true);

      // Phone eke nam card eka thiyena thanata scroll karanawa
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setTimeout(() => {
          previewRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 250);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  const isAgeInvalid = parseInt(details.age) >= 20;
  const isDisabled =
    isGenerating || isAgeInvalid || !details.name || !details.gender || isGenerated;

  // Progress (required fields 6k)
  const requiredFilled = [
    details.name,
    details.school,
    details.grade,
    details.birthday,
    details.height,
    details.weight,
    details.gender,
  ].filter(Boolean).length;
  const progress = Math.round((requiredFilled / 7) * 100);
  const allFilled = requiredFilled === 7 && !isAgeInvalid;
  const currentStep = isGenerated ? 2 : allFilled ? 1 : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080f] text-white">
      {/* Background */}
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-32 top-0 h-[360px] w-[360px] rounded-full bg-blue-600/20 blur-[130px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-[260px] w-[300px] rounded-full bg-purple-900/20 blur-[120px] sm:left-10 sm:h-[300px] sm:w-[400px]" />

      {/* Header */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-black tracking-[0.14em] sm:text-2xl sm:tracking-[0.18em]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 sm:h-9 sm:w-9">
            <QrCode className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
          </span>
          <span>
            RIVE<span className="text-blue-500">XTRA</span>
          </span>
        </Link>

        <Link
          href="/"
          className="secondary-button group inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold sm:px-5 sm:py-3"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="hidden sm:inline">Back Home</span>
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-4 sm:px-6 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10">
        {/* ============ FORM ============ */}
        <div className="animate-fade-in min-w-0">
          {/* Stepper */}
          <div className="mb-8 flex items-center">
            {steps.map(({ label, icon: Icon }, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div
                  key={label}
                  className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                        done
                          ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                          : active
                          ? "border-blue-400/60 bg-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                          : "border-white/10 bg-white/5 text-gray-500"
                      }`}
                    >
                      {done ? (
                        <Check className="animate-pop h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span
                      className={`hidden text-xs font-semibold tracking-wider sm:inline ${
                        active
                          ? "text-blue-300"
                          : done
                          ? "text-emerald-300"
                          : "text-gray-500"
                      }`}
                    >
                      {label.toUpperCase()}
                    </span>
                  </div>

                  {i < steps.length - 1 && (
                    <div className="mx-3 h-px flex-1 overflow-hidden bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700"
                        style={{ width: done ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Create your <span className="shine-text">digital card.</span>
          </h1>
          <p className="mb-8 mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
            Enter your details to generate your unique QR profile.
          </p>

          {/* Success banner */}
          {isGenerated && (
            <div className="animate-fade-in mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400/30" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="animate-pop h-6 w-6" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-emerald-300">Your card is ready!</p>
                <p className="text-sm text-gray-400">
                  Download or print it from the card preview.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="secondary-button group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
              >
                <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
                New card
              </button>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div
              key={errorMsg}
              className="animate-shake mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            onMouseMove={handleSpotlight}
            className={`premium-card spotlight relative space-y-6 overflow-hidden p-5 transition-opacity duration-500 sm:p-8 ${
              isGenerated ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-600/15 blur-3xl" />

            {/* progress bar */}
            <div className="relative">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>Form progress</span>
                <span className="font-semibold text-blue-300">
                  {requiredFilled}/7 · {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ${
                    progress < 100 ? "progress-stripes" : ""
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-5 sm:gap-6">
              <Field
                icon={UserRound}
                label="Full Name"
                done={!!details.name}
                delay={0}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  type="text"
                  name="name"
                  value={details.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="John Doe"
                  disabled={isGenerated}
                  autoComplete="name"
                />
              </Field>

              <Field
                icon={School}
                label="School"
                done={!!details.school}
                delay={80}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  type="text"
                  name="school"
                  value={details.school}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Your School"
                  disabled={isGenerated}
                />
              </Field>

              <Field
                icon={GraduationCap}
                label="Grade / Class"
                done={!!details.grade}
                delay={160}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  type="text"
                  name="grade"
                  value={details.grade}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. Grade 10"
                  disabled={isGenerated}
                />
              </Field>

              <Field
                icon={Cake}
                label="Birthday"
                done={!!details.birthday && !isAgeInvalid}
                delay={240}
                className="col-span-2 sm:col-span-1"
              >
                <input
                  type="date"
                  name="birthday"
                  value={details.birthday}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  style={{ colorScheme: "dark" }}
                  disabled={isGenerated}
                />
                {details.age && (
                  <p
                    className={`animate-fade-in mt-2 text-xs ${
                      isAgeInvalid ? "text-red-400" : "text-blue-400"
                    }`}
                  >
                    Calculated Age: {details.age} years{" "}
                    {isAgeInvalid && "(QR Not Allowed)"}
                  </p>
                )}
              </Field>

              <Field
                icon={Mars}
                label="Gender"
                done={!!details.gender}
                delay={300}
                className="relative z-20 col-span-2"
              >
                <GenderSelect
                  value={details.gender}
                  onChange={handleGender}
                  disabled={isGenerated}
                />
              </Field>

              <Field
                icon={Ruler}
                label="Height (cm)"
                done={!!details.height}
                delay={380}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  name="height"
                  value={details.height}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. 170"
                  disabled={isGenerated}
                />
              </Field>

              <Field
                icon={Weight}
                label="Weight (kg)"
                done={!!details.weight}
                delay={460}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  name="weight"
                  value={details.weight}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="e.g. 60"
                  disabled={isGenerated}
                />
              </Field>
            </div>

            {details.bmi && (
              <div className="animate-fade-in relative flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <span className="flex items-center gap-2 text-sm text-gray-300">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Auto-calculated BMI
                </span>
                <span className="text-xl font-bold text-blue-400">
                  {details.bmi}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className={`group relative flex w-full items-center justify-center gap-3 rounded-xl py-4 font-bold transition active:scale-[0.98] ${
                isDisabled
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "primary-button btn-glow btn-shimmer text-white hover:opacity-90"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Generating...
                </>
              ) : isAgeInvalid ? (
                <>
                  <AlertTriangle className="h-5 w-5" /> Age must be under 20
                </>
              ) : isGenerated ? (
                <>
                  <CheckCircle2 className="h-5 w-5" /> QR Generated Successfully
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" /> Generate QR Card
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-400" />
              Your details are used only to build your card.
            </p>
          </form>
        </div>

        {/* ============ LIVE PREVIEW & GENERATED CARD ============ */}
        <div
          ref={previewRef}
          className="flex min-w-0 flex-col items-center lg:sticky lg:top-8 lg:self-start"
        >
          <p className="mb-5 flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            {isGenerated ? "YOUR DIGITAL CARD" : "LIVE PREVIEW"}
          </p>

          <CardPreview
            details={details}
            generatedQr={generatedQr}
            isGenerated={isGenerated}
          />

          {isGenerated && (
            <p className="animate-fade-in mt-6 text-center text-sm text-gray-400">
              Scan this QR code to view the student&apos;s digital profile.
            </p>
          )}
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
          }
          /* float / scale animations print walata ain karanawa */
          .card-float,
          .card-scaler {
            animation: none !important;
            transform: none !important;
          }
          .print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 400px !important;
            margin: 0;
            padding: 0;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </main>
  );
}