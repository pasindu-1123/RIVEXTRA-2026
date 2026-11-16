"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Download, Loader2, Printer, QrCode } from "lucide-react";

// Card eka design karala thiyenne meka width ekata. Screen/print dekatama meka scale wenawa.
const BASE_W = 400;

// A4 print card eke real size (mm). Meka wenas karanna puluwan.
// TIP: height eka ~87mm karoth template image eka stretch wenne naha (template eke natural shape eka).
const PRINT_W_MM = 65;
const PRINT_H_MM = 95;
const PX_PER_MM = 96 / 25.4;

export default function CardPreview({
  details,
  generatedQr,
  isGenerated,
  showActions = true,
  isPrintOnly = false, // A4 sheet eke print karanna
  isBulk = false, // bulk list eke podi preview (float/tilt nathuwa)
}) {
  const cardRef = useRef(null);
  const bgRef = useRef(null);
  const wrapRef = useRef(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bgSize, setBgSize] = useState(null);
  const [scale, setScale] = useState(1);
  const [tilt, setTilt] = useState({ x: 0, y: 0, hover: false });

  const isStatic = isPrintOnly || isBulk;

  useEffect(() => {
    const img = bgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setBgSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || isPrintOnly) return;
    const update = () => setScale(Math.min(1, el.clientWidth / BASE_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isPrintOnly]);

  const aspect = bgSize ? bgSize.w / bgSize.h : 3 / 4;
  const baseH = BASE_W / aspect; // template eke natural height (400px width ekata)

  // Print card eke height (400px design width ekata)
  const printBaseH = BASE_W * (PRINT_H_MM / PRINT_W_MM);
  const printScale = (PRINT_W_MM * PX_PER_MM) / BASE_W;

  // Print card eka template eken wenas shape ekak nam, padding tika proportion ekata wenas karanawa
  const cardH = isPrintOnly ? printBaseH : baseH;
  const ratio = cardH / baseH;
  const headerPt = Math.round(40 * ratio);
  const detailsPb = Math.round(88 * ratio);

  const handleMove = (e) => {
    if (isStatic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 8, y: px * 8, hover: true });
  };

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    setIsDownloading(true);
    try {
      const cardWidth = cardRef.current.offsetWidth;
      const pixelRatio = bgSize
        ? Math.min(8, Math.max(3, bgSize.w / cardWidth))
        : 4;
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio,
      });
      const link = document.createElement("a");
      link.download = `Rivextra-Card-${details.name || "Student"}.png`;
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

  // ================= CARD (screen + print dekatama ekama layout eka) =================
  const cardEl = (
    <div
      ref={cardRef}
      className={`print-card relative flex flex-col overflow-hidden bg-white ${
        isPrintOnly
          ? ""
          : "w-full rounded-[1.6rem] shadow-[0_25px_60px_-15px_rgba(10,27,77,0.7)]"
      }`}
      style={
        isPrintOnly
          ? { width: BASE_W, height: printBaseH }
          : { aspectRatio: `${aspect}` }
      }
    >
      <img
        ref={bgRef}
        src="/assets/template.jpeg"
        alt=""
        draggable={false}
        crossOrigin="anonymous"
        onLoad={(e) =>
          setBgSize({
            w: e.currentTarget.naturalWidth,
            h: e.currentTarget.naturalHeight,
          })
        }
        className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-fill"
      />

      {/* HEADER */}
      <div
        className="relative z-10 flex w-full items-center justify-between px-8"
        style={{ paddingTop: headerPt }}
      >
        <div className="flex w-[21%] items-center justify-center">
          <img
            src="/assets/school-logo.png"
            alt="School Logo"
            className="h-[90px] w-auto object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <div className="h-[94px] w-px bg-[#0a1b4d]/30" />

        <div className="flex w-[20%] items-center justify-center">
          <img
            src="/assets/technology-logo.png"
            alt="Technology Faculty Logo"
            className="h-[68px] w-auto object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <div className="h-[94px] w-px bg-[#0a1b4d]/30" />

        <div className="flex flex-1 items-center justify-center overflow-visible pl-1">
          <img
            src="/assets/rivextra-logo.png"
            alt="RIVEXTRA '26"
            className="h-auto w-full origin-center scale-[1.1] object-contain"
            crossOrigin="anonymous"
          />
        </div>
      </div>

      {/* QR */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        {isGenerated && generatedQr ? (
          <div className="animate-fade-in rounded-xl bg-white p-1.5 shadow-[0_10px_30px_rgba(10,27,77,0.18)]">
            <img
              src={generatedQr}
              alt="QR Code"
              className="h-[208px] w-[208px]"
            />
          </div>
        ) : (
          <div className="flex h-[216px] w-[216px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#0a1b4d]/30 bg-white/60 backdrop-blur-sm">
            <QrCode className="h-12 w-12 animate-pulse text-[#0a1b4d]/40" />
            <span className="px-4 text-center text-sm font-semibold text-[#0a1b4d]/50">
              Generate QR
              <br />
              to view
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div
        className="relative z-10 flex w-full flex-col items-center px-8 text-center"
        style={{ paddingBottom: detailsPb }}
      >
        <h1 className="max-w-full break-words text-[19px] font-extrabold uppercase tracking-wide text-[#0a1b4d]">
          {details.name || "STUDENT NAME"}
        </h1>

        <div className={`flex w-full items-center justify-center ${isPrintOnly ? "mt-1 gap-1" : "mt-3 gap-3"}`}>
                    <div className="h-px flex-1 bg-[#0a1b4d]/30" />
                    <p className={`font-bold text-gray-800 ${isPrintOnly ? "text-[10px]" : "text-[19px]"}`}>
                      Grade: {details.grade || "—"}
                    </p>
                    <div className="h-px flex-1 bg-[#0a1b4d]/30" />
                  </div>

        <p className="mt-3 text-[14px] font-semibold leading-snug text-gray-700">
          {details.school || "School Name"}
        </p>
      </div>
    </div>
  );

  // ================= PRINT ONLY: exact 65mm x 95mm box, card eka scale karala =================
  if (isPrintOnly) {
    return (
      <div
        className="relative overflow-hidden"
        style={{
          display: "block",
          width: `${PRINT_W_MM}mm`,
          height: `${PRINT_H_MM}mm`,
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            width: BASE_W,
            height: printBaseH,
            transform: `scale(${printScale})`,
            transformOrigin: "top left",
          }}
        >
          {cardEl}
        </div>
      </div>
    );
  }

  // ================= SCREEN =================
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <div ref={wrapRef} className="w-full max-w-[400px]">
        <div
          className={isStatic ? "" : "card-float animate-float-slow"}
          style={{ height: baseH * scale }}
        >
          <div
            className="relative h-full w-full"
            onMouseMove={handleMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0, hover: false })}
            style={
              isStatic
                ? {}
                : {
                    transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
                      tilt.hover ? 1.02 : 1
                    })`,
                    transition: tilt.hover
                      ? "transform 0.1s ease-out"
                      : "transform 0.6s ease",
                  }
            }
          >
            {!isStatic && (
              <div className="pointer-events-none absolute inset-0 scale-90 rounded-[2rem] bg-blue-600/30 blur-[60px]" />
            )}

            <div
              className="card-scaler absolute left-0 top-0"
              style={{
                width: BASE_W,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {cardEl}
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {showActions && isGenerated && (
        <div className="flex w-full max-w-[400px] animate-fade-in gap-3 sm:gap-4">
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
                <Check className="h-5 w-5 animate-pop" />
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
      )}
    </div>
  );
}
