"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2, Printer, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import CardPreview from "../create/CardPreview";

const initialDetails = {
  name: "", grade: "", height: "", weight: "", school: "", birthday: "", age: "", bmi: "", gender: "Male"
};

export default function BulkCreatePage() {
  const router = useRouter();
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
          height: Number(details.height), weight: Number(details.weight),
          bmi: Number(details.bmi), age: Number(details.age),
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
      <main className="min-h-screen bg-gray-200 print:bg-white">
        <div className="w-full bg-white shadow-sm p-4 mb-8 flex justify-between items-center print:hidden">
          <button onClick={() => setShowPrintView(false)} className="text-gray-600 hover:text-black flex items-center gap-2 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="h-5 w-5" /> Edit Students
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 shadow-lg transition">
            <Printer className="h-5 w-5" /> Print A4 Sheet
          </button>
        </div>

        {/* A4 Print Area - මෙතන ප්‍රධාන වෙනස්කම් */}
        <div className="mx-auto bg-white shadow-2xl print:shadow-none" 
             style={{ width: '210mm', minHeight: '297mm' }}>
          
          {/* මෙතන p-[0mm] දුන්නා අද්දරින් ඉඩ නැතුව තියෙන්න, gap-0 දුන්නා කාඩ් අතරේ ඉඩ නැතුව තියෙන්න */}
          <div className="grid grid-cols-3 p-[0mm] gap-0">
  {addedStudents.map((student, idx) => (
    <div key={idx} className="flex justify-center items-start w-[65mm] h-[95mm] m-0 p-0">
      <CardPreview 
        details={student} 
        generatedQr={student.qrCode} 
        isGenerated={true} 
        isPrintOnly={true}
        showActions={false}
      />
    </div>
  ))}
</div>
        </div>
      </main>
    );
  }

  // ================= FORM VIEW =================
  return (
    <main className="min-h-screen bg-[#05080f] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
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
            <AlertTriangle className="h-5 w-5" /> {errorMsg}
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
                    <label className="text-xs text-gray-400 mb-1 block">Gender</label>
                    <select name="gender" value={details.gender} onChange={handleChange} className="w-full bg-[#05080f] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none text-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
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

                <button onClick={handleAddStudent} disabled={isAgeInvalid || !details.name || isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2">
                  {isGenerating ? <><Loader2 className="h-5 w-5 animate-spin"/> Generating Card...</> : `Add to List (${addedStudents.length}/6)`}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: ADDED STUDENTS PREVIEW */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Added Students ({addedStudents.length})</h2>
              
              {/* 👇 මෙතන තමයි වෙනස්කම - දැන් එක සිසුවෙක් ආවම බටන් එක එනවා */}
              {addedStudents.length > 0 && (
                <button onClick={() => setShowPrintView(true)} className="primary-button px-6 py-2 rounded-lg font-bold flex items-center gap-2 text-sm animate-fade-in shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-4 w-4"/> Generate A4 Sheet
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
                    <button onClick={() => handleRemoveStudent(idx)} className="absolute top-2 right-2 z-20 bg-red-500/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="scale-90 origin-top -mb-10 pointer-events-none">
                      <CardPreview details={student} generatedQr={student.qrCode} isGenerated={true} isBulk={true} />
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
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}
