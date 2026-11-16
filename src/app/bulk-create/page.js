"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Trash2,
  Printer,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import CardPreview from "../create/CardPreview";

const initialDetails = {
  name: "",
  grade: "",
  height: "",
  weight: "",
  school: "",
  birthday: "",
  age: "",
  bmi: "",
  gender: "Male",
};

const inputCls =
  "w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none";

export default function BulkCreatePage() {
  const [details, setDetails] = useState(initialDetails);
  const [addedStudents, setAddedStudents] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPrintView, setShowPrintView] = useState(false);

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

  // සිසුවෙක් එකතු කිරීම
  const handleAddStudent = async () => {
    if (!details.name) {
      setErrorMsg("කරුණාකර සිසුවාගේ නම ඇතුළත් කරන්න.");
      return;
    }
    if (parseInt(details.age) >= 20) {
      setErrorMsg("වයස අවුරුදු 20ට අඩු විය යුතුය.");
      return;
    }
    if (addedStudents.length >= 6) {
      setErrorMsg("උපරිම සිසුන් 6 දෙනෙකුට පමණක් එකවර කාඩ්පත් සෑදිය හැක.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/students", {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "දත්ත සුරැකීමේ දෝෂයක්.");

      const qrRes = await fetch("/api/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: data.student._id }),
      });
      const qrData = await qrRes.json();
      if (!qrRes.ok) throw new Error(qrData.error || "QR සෑදීමේ දෝෂයක්.");

      setAddedStudents([...addedStudents, { ...details, qrCode: qrData.qrCode }]);
      setDetails(initialDetails);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveStudent = (index) => {
    setAddedStudents(addedStudents.filter((_, i) => i !== index));
  };

  const isAgeInvalid = parseInt(details.age) >= 20;

  // ================= PRINT VIEW (A4 Sheet) =================
  if (showPrintView) {
    return (
      <main className="min-h-screen bg-gray-200 print:min-h-0 print:bg-white">
        <div className="mb-8 flex w-full items-center justify-between bg-white p-4 shadow-sm print:hidden">
          <button
            onClick={() => setShowPrintView(false)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" /> Edit Students
          </button>
          <div className="flex items-center gap-4">
            <p className="hidden text-xs text-gray-500 md:block">
              Print settings: Paper A4 · Margins None · Scale 100% · Background
              graphics ON
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700"
            >
              <Printer className="h-5 w-5" /> Print A4 Sheet
            </button>
          </div>
        </div>

        {/* A4 Print Area: 3 cards x 2 rows (65mm x 95mm) */}
        <div
          className="mx-auto overflow-hidden bg-white shadow-2xl print:shadow-none"
          style={{ width: "210mm", height: "297mm", paddingTop: "10mm" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 65mm)",
              justifyContent: "center",
              gap: 0,
            }}
          >
            {addedStudents.map((student, idx) => (
              <CardPreview
                key={idx}
                details={student}
                generatedQr={student.qrCode}
                isGenerated={true}
                isPrintOnly={true}
                showActions={false}
              />
            ))}
          </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html,
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-card {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}</style>
      </main>
    );
  }

  // ================= FORM VIEW =================
  return (
    <main className="min-h-screen bg-[#05080f] p-6 text-white md:p-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bulk Card Generator</h1>
            <p className="text-gray-400">
              Add up to 6 students, then print them on one A4 sheet.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertTriangle className="h-5 w-5" /> {errorMsg}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT: ADD STUDENT FORM */}
          <div>
            <div className="sticky top-8 rounded-2xl border border-white/10 bg-[#0c1424] p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-400">
                <UserPlus className="h-5 w-5" /> Add a Student
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs text-gray-400">Full Name</label>
                    <input type="text" name="name" value={details.name} onChange={handleChange} className={inputCls} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">School</label>
                    <input type="text" name="school" value={details.school} onChange={handleChange} className={inputCls} placeholder="School Name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Grade</label>
                    <input type="text" name="grade" value={details.grade} onChange={handleChange} className={inputCls} placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Gender</label>
                    <select name="gender" value={details.gender} onChange={handleChange} className={`${inputCls} text-white`}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Birthday</label>
                    <input type="date" name="birthday" value={details.birthday} onChange={handleChange} className={inputCls} style={{ colorScheme: "dark" }} />
                    {details.age && (
                      <p className={`mt-1 text-xs ${isAgeInvalid ? "text-red-400" : "text-blue-400"}`}>
                        Age: {details.age}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Height (cm)</label>
                    <input type="number" name="height" value={details.height} onChange={handleChange} className={inputCls} placeholder="e.g. 170" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Weight (kg)</label>
                    <input type="number" name="weight" value={details.weight} onChange={handleChange} className={inputCls} placeholder="e.g. 60" />
                  </div>
                </div>

                {details.bmi && (
                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                    <span className="text-xs text-gray-300">Auto BMI</span>
                    <span className="text-sm font-bold text-blue-400">{details.bmi}</span>
                  </div>
                )}

                <button
                  onClick={handleAddStudent}
                  disabled={isAgeInvalid || !details.name || isGenerating}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Generating Card...
                    </>
                  ) : (
                    `Add to List (${addedStudents.length}/6)`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: ADDED STUDENTS PREVIEW */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Added Students ({addedStudents.length})</h2>

              {addedStudents.length > 0 && (
                <button
                  onClick={() => setShowPrintView(true)}
                  className="primary-button animate-fade-in flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold shadow-lg shadow-blue-500/20"
                >
                  <Sparkles className="h-4 w-4" /> Generate A4 Sheet
                </button>
              )}
            </div>

            {addedStudents.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 text-gray-500">
                <UserPlus className="mb-2 h-10 w-10 opacity-50" />
                <p>No students added yet.</p>
                <p className="text-sm">Fill the form and click &quot;Add to List&quot;</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {addedStudents.map((student, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl border border-white/10 bg-[#0c1424] p-3"
                  >
                    <button
                      onClick={() => handleRemoveStudent(idx)}
                      aria-label="Remove student"
                      className="absolute right-2 top-2 z-20 rounded-full bg-red-500/80 p-1.5 text-white transition hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="pointer-events-none">
                      <CardPreview
                        details={student}
                        generatedQr={student.qrCode}
                        isGenerated={true}
                        showActions={false}
                        isBulk={true}
                      />
                    </div>

                    <p className="mt-3 truncate text-center text-xs text-gray-300">
                      {student.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
