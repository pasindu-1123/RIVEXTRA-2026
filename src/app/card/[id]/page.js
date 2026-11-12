// src/app/card/[id]/page.js
import connectDB from "@/lib/db";
import Student from "@/models/Student";
import { notFound } from "next/navigation";
import CardUI from "./CardUI"; // 👈 අලුත් Component එක

// ⚠️ මෙතන පරණ තිබ්බ await io() එකයි, export const instant = false එකයි අයින් කරන්න ඕන

export default async function CardPage({ params }) {
  const { id } = await params;

  await connectDB();
  const student = await Student.findById(id);

  if (!student) {
    notFound();
  }

  // Mongoose Object එක Plain Object එකක් කරලා Client Component එකට යවනවා
  const studentData = JSON.parse(JSON.stringify(student));

  return <CardUI student={studentData} />;
}