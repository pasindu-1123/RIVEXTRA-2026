import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; 
import Student from "@/models/Student";
import QRCode from "qrcode"; 

export async function POST(req) {
  try {
    await connectDB(); 
    const body = await req.json();

    const newStudent = await Student.create(body);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const profileUrl = `${baseUrl}/card/${newStudent._id}`;

    const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 400,
      margin: 2,
    });

    newStudent.qrCode = qrCodeDataUrl;
    await newStudent.save();

    return NextResponse.json(
      { message: "Student saved and QR generated", student: newStudent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving student:", error);
    return NextResponse.json(
      { error: "Failed to save student details" },
      { status: 500 }
    );
  }
}