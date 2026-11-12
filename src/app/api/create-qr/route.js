import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(req) {
  try {
    const body = await req.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const profileUrl = `${baseUrl}/card/${studentId}`;

    const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return NextResponse.json(
      { 
        message: "QR Code generated successfully", 
        qrCode: qrCodeDataUrl, 
        profileUrl: profileUrl 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error generating QR:", error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}