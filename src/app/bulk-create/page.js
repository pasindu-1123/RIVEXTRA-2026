"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2, Printer, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import CardPreview from "../create/CardPreview";

const initialDetails = {
  name: "", grade: "", height: "", weight: "", school: "", birthday: "", age: "", bmi: "",
};

export default function BulkCreatePage() {
  const router = useRouter();
  const [details, setDetails] = useState(initialDetails);
  const [addedStudents, setAddedStudents] = useState([]); // Add කරපු සිසුන්
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPrintView, setShowPrintView] = useState(false); // Print කරන scene එක පෙන්නන්න

  // Age Auto Calculate
  useEffect(() => {
    if (details.birthday) {
      const birthDate = new Date(details.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
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
        const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
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
  const handleAddStudent = () => {
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

    setAddedStudents([...addedStudents, { ...details }]);
    setDetails(initialDetails); // ඊළඟ සිසුවාට ෆෝම් එක ක්ලියර් කරනවා
    setErrorMsg("");
  };

  // සිසුවෙක් අයින් කිරීම
  const handleRemoveStudent = (index) => {
    setAddedStudents(addedStudents.filter((_, i) => i !== index));
  };

  // ඔක්කොම Generate කරලා Print View එකට යනවා
  const handleGenerateAll = async () => {
    if (addedStudents.length === 0) {
      setErrorMsg("කරුණාකර එක් සිසුවෙකු හෝ එකතු කරන්න.");
      return;
    }
    
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const generatedResults = [];
      
      for (const student of addedStudents) {
        // 1. Save
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...student,
            height: Number(student.height), weight: Number(student.weight),
            bmi: Number(student.bmi), age: Number(student.age),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "දත්ත සුරැකීමේ දෝෂයක්.");

        // 2. QR එක ගන්න
        const qrRes = await fetch("/api/create-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: data.student._id }),
        });
        const qrData = await qrRes.json();
        if (!qrRes.ok) throw new Error(qrData.error || "QR සෑදීමේ දෝෂයක්.");

        generatedResults.push({
          ...student,
          qrCode: qrData.qrCode
        });
      }

      // Generate වුනාට පස්සේ, ඒක Print View එකට මාරු කරනවා
      setAddedStudents(generatedResults);
      setShowPrintView(true);
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const isAgeInvalid = parseInt(details.age) >= 20;

  // ================= PRINT VIEW (A4 Sheet) =================
  if (showPrintView) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-[210mm] mx-auto mb-8 flex justify-between items-center print:hidden">
          <button onClick={() => setShowPrintView(false)} className="text-gray-600 hover:text-black flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Edit Students
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700">
            <Printer className="h-5 w-5" /> Print A4 Sheet
          </button>
        </div>

        {/* A4 Print Area - 2 Columns (දෙපැත්තට) */}
        <div className="mx-auto bg-white w-[210mm] min-h-[297mm] p-[15mm] grid grid-cols-2 gap-8 print:shadow-none shadow-xl print:w-full print:p-0">
          {addedStudents.map((student, idx) => (
            <div key={idx} className="flex justify-center items-center">
              <CardPreview 
                details={student} 
                generatedQr={student.qrCode} 
                isGenerated={true} 
                isBulk={true} 
              />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // ================= FORM VIEW (Add Students) =================
  return (
    <main className="min-h-screen bg-[#05080f] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bulk Card Generator</h1>
            <p className="text-gray-400">Add up to 6 students, then print them on one A4 sheet.</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
            {errorMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: ADD STUDENT FORM */}
          <div>
            <div className="bg-[#0c1424] border border-white/10 p-6 md:p-8 rounded-2xl sticky top-8">
              <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                <UserPlus className="h-5 w-5" /> Add a Student
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                    <input type="text" name="name" value={details.name} onChange={handleChange} className="w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">School</label>
                    <input type="text" name="school" value={details.school} onChange={handleChange} className="w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="School Name" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Grade</label>
                    <input type="text" name="grade" value={details.grade} onChange={handleChange} className="w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Birthday</label>
                    <input type="date" name="birthday" value={details.birthday} onChange={handleChange} className="w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none" style={{ colorScheme: "dark" }} />
                    {details.age && <p className={`text-xs mt-1 ${isAgeInvalid ? "text-red-400" : "text-blue-400"}`}>Age: {details.age}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Height (cm)</label>
                    <input type="number" name="height" value={details.height} onChange={handleChange} className="w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="e.g. 170" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Weight (kg)</label>
                    <input type="number" name="weight" value={details.weight} onChange={handleChange} className="w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="e.g. 60" />
                  </div>
                </div>

                {details.bmi && (
                  <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <span className="text-xs text-gray-300">Auto BMI</span>
                    <span className="text-sm font-bold text-blue-400">{details.bmi}</span>
                  </div>
                )}

                <button onClick={handleAddStudent} disabled={isAgeInvalid || !details.name} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  Add to List ({addedStudents.length}/6)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: ADDED STUDENTS PREVIEW */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Added Students ({addedStudents.length})</h2>
              {addedStudents.length > 0 && (
                <button onClick={handleGenerateAll} disabled={isGenerating} className="primary-button px-6 py-2 rounded-lg font-bold flex items-center gap-2 text-sm disabled:opacity-50">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
                  Generate A4 Sheet
                </button>
              )}
            </div>

            {addedStudents.length === 0 ? (
              <div className="h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500">
                <UserPlus className="h-10 w-10 mb-2 opacity-50" />
                <p>No students added yet.</p>
                <p className="text-sm">Fill the form and click "Add to List"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {addedStudents.map((student, idx) => (
                  <div key={idx} className="relative group bg-[#0c1424] rounded-xl overflow-hidden border border-white/10 p-2">
                    {/* අයින් කරන බටන් එක */}
                    <button onClick={() => handleRemoveStudent(idx)} className="absolute top-2 right-2 z-20 bg-red-500/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    {/* Live Preview (අර අපේ CardPreview එකම තමයි) */}
                    <div className="scale-90 origin-top -mb-10 pointer-events-none">
                      <CardPreview details={student} generatedQr={null} isGenerated={false} />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-xs text-white p-1 rounded text-center">
                      {student.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          main { padding: 0 !important; background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #eee !important; }
        }
      `}</style>
    </main>
  );
}
