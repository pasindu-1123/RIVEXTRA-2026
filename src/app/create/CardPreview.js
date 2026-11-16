"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Download, Loader2, Printer, QrCode } from "lucide-react";

const BASE_W = 400;

export default function CardPreview({
  details,
  generatedQr,
  isGenerated,
  showActions = true,
  isPrintOnly = false, // A4 ප්‍රින්ට් එකට විතරක්
}) {
  const cardRef = useRef(null);
  const bgRef = useRef(null);
  const wrapRef = useRef(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bgSize, setBgSize] = useState(null);
  const [scale, setScale] = useState(1);
  const [tilt, setTilt] = useState({ x: 0, y: 0, hover: false });

  useEffect(() => {
    const img = bgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setBgSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || isPrintOnly) return; // Print view එකේදී scale කරන්නේ නෑ
    const update = () => setScale(Math.min(1, el.clientWidth / BASE_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isPrintOnly]);

  const aspect = bgSize ? bgSize.w / bgSize.h : 3 / 4;
  const baseH = BASE_W / aspect;

  const handleMove = (e) => {
    if (isPrintOnly) return;
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
      const pixelRatio = bgSize ? Math.min(8, Math.max(3, bgSize.w / cardWidth)) : 4;
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio });
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

  // 👇 ප්‍රින්ට් වෙද්දී කාඩ් එකේ හරියටම ප්‍රමාණය (65mm x 95mm)
  const printContainerStyle = isPrintOnly
    ? { width: "65mm", height: "95mm", minWidth: "65mm", minHeight: "95mm" }
    : {};

  return (
    <div className={isPrintOnly ? "w-full h-full m-0 p-0" : "flex w-full flex-col items-center gap-6 sm:gap-8"}>
      <div ref={wrapRef} className={isPrintOnly ? "w-full h-full m-0 p-0" : "w-full max-w-[400px]"}>
        
        {/* float animation */}
        <div
          className={isPrintOnly ? "h-full w-full m-0 p-0" : "card-float animate-float-slow"}
          style={isPrintOnly ? {} : { height: baseH * scale }}
        >
          
          <div
            className="relative h-full w-full m-0 p-0"
            onMouseMove={handleMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0, hover: false })}
            style={
              isPrintOnly
                ? {}
                : {
                    transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.hover ? 1.02 : 1})`,
                    transition: tilt.hover ? "transform 0.1s ease-out" : "transform 0.6s ease",
                  }
            }
          >
            <div className={`pointer-events-none absolute inset-0 scale-90 rounded-[2rem] bg-blue-600/30 blur-[60px] ${isPrintOnly ? "hidden" : ""}`} />

            {/* fixed-width card, scaled to fit */}
            <div
              className="absolute left-0 top-0 m-0 p-0"
              style={
                isPrintOnly
                  ? { width: "100%", height: "100%" }
                  : { width: BASE_W, transform: `scale(${scale})`, transformOrigin: "top left" }
              }
            >
              
              {/* ================= CARD ================= */}
              <div
                ref={cardRef}
                className={`print-card relative flex flex-col overflow-hidden bg-white ${
                  isPrintOnly ? "h-full w-full rounded-none border-none m-0 p-0" : "w-full rounded-[1.6rem] shadow-[0_25px_60px_-15px_rgba(10,27,77,0.7)]"
                }`}
                style={isPrintOnly ? { ...printContainerStyle } : { aspectRatio: `${aspect}` }}
              >
                {/* Background Image */}
                <img
                  ref={bgRef}
                  src="/assets/template.jpeg"
                  alt=""
                  draggable={false}
                  crossOrigin="anonymous"
                  onLoad={(e) => setBgSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-cover"
                />

                {/* HEADER */}
                <div className={`relative z-10 flex w-full items-center justify-between ${isPrintOnly ? "px-3 pt-3" : "px-8 pt-10"}`}>
                  <div className="flex w-[17%] items-center justify-center">
                    <img src="/assets/school-logo.png" alt="School Logo" className={`w-auto object-contain ${isPrintOnly ? "h-[25px]" : "h-[68px]"}`} crossOrigin="anonymous" />
                  </div>
                  <div className={`bg-[#0a1b4d]/30 ${isPrintOnly ? "h-[25px] w-px" : "h-[78px] w-px"}`} />
                  <div className="flex w-[22%] items-center justify-center">
                    <img src="/assets/technology-logo.png" alt="Technology Faculty Logo" className={`w-auto object-contain ${isPrintOnly ? "h-[25px]" : "h-[68px]"}`} crossOrigin="anonymous" />
                  </div>
                  <div className={`bg-[#0a1b4d]/30 ${isPrintOnly ? "h-[25px] w-px" : "h-[78px] w-px"}`} />
                  <div className="flex flex-1 items-center justify-center overflow-visible pl-1">
                    <img src="/assets/rivextra-logo.png" alt="RIVEXTRA '26" className={`h-auto w-full origin-center scale-[1.1] object-contain`} crossOrigin="anonymous" />
                  </div>
                </div>

                {/* QR */}
                <div className="relative z-10 flex flex-1 items-center justify-center">
                  {isGenerated && generatedQr ? (
                    <div className={`animate-fade-in rounded-lg bg-white shadow-sm ${isPrintOnly ? "p-1" : "p-1.5"}`}>
                      <img src={generatedQr} alt="QR Code" className={`${isPrintOnly ? "h-[85px] w-[85px]" : "h-[208px] w-[208px]"}`} />
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#0a1b4d]/30 bg-white/60 backdrop-blur-sm ${isPrintOnly ? "h-[85px] w-[85px]" : "h-[216px] w-[216px]"}`}>
                      <QrCode className={`animate-pulse text-[#0a1b4d]/40 ${isPrintOnly ? "h-5 w-5" : "h-12 w-12"}`} />
                      <span className={`px-2 text-center font-semibold text-[#0a1b4d]/50 ${isPrintOnly ? "text-[6px]" : "text-sm"}`}>
                        Generate QR<br />to view
                      </span>
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className={`relative z-10 flex w-full flex-col items-center text-center ${isPrintOnly ? "px-3 pb-3" : "px-8 pb-[88px]"}`}>
                  <h1 className={`max-w-full break-words font-extrabold uppercase tracking-wide text-[#0a1b4d] ${isPrintOnly ? "text-[9px] mt-1" : "text-[19px]"}`}>
                    {details.name || "STUDENT NAME"}
                  </h1>
                  <div className={`flex w-full items-center justify-center ${isPrintOnly ? "mt-1 gap-1" : "mt-3 gap-3"}`}>
                    <div className="h-px flex-1 bg-[#0a1b4d]/30" />
                    <p className={`font-semibold text-gray-600 ${isPrintOnly ? "text-[7px]" : "text-xs"}`}>
                      Grade: {details.grade || "—"}
                    </p>
                    <div className="h-px flex-1 bg-[#0a1b4d]/30" />
                  </div>
                  <p className={`font-medium text-gray-600 ${isPrintOnly ? "mt-1 text-[7px]" : "mt-4 text-[11px]"}`}>
                    {details.school || "School Name"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {showActions && isGenerated && !isPrintOnly && (
        <div className="flex w-full max-w-[400px] animate-fade-in gap-3 sm:gap-4">
          <button onClick={() => window.print()} className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 py-3 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-white/20 active:scale-95">
            <Printer className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" /> Print
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="group primary-button flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50">
            {isDownloading ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : isSaved ? <><Check className="h-5 w-5 animate-pop" /> Saved!</> : <><Download className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" /> Download</>}
          </button>
        </div>
      )}
    </div>
  );
}
