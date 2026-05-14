"use client";

import { useState, useRef, useEffect } from "react";
import { uploadPhoto } from "@/lib/firestore";
import Image from "next/image";
import Link from "next/link";

interface UploadFormProps {
  projectId: string;
}

type UploadStage = "idle" | "uploading" | "success" | "error";

const LOCAL_KEY = "event_snap_user_name";

export default function UploadForm({ projectId }: UploadFormProps) {
  const [caption, setCaption]         = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(LOCAL_KEY) || "";
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [stage, setStage]             = useState<UploadStage>("idle");
  const [progress, setProgress]       = useState(0);
  const [error, setError]             = useState<string | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef  = useRef<ReturnType<typeof setInterval> | null>(null);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  // Fake progress animation trong khi upload thật đang chạy
  const startFakeProgress = () => {
    setProgress(0);
    let current = 0;
    progressRef.current = setInterval(() => {
      current += Math.random() * 12;
      if (current >= 85) {
        clearInterval(progressRef.current!);
        current = 85;
      }
      setProgress(current);
    }, 180);
  };

  const finishProgress = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(100);
  };

  const handleUpload = async () => {
    if (!caption.trim()) { setError("Nhập lời nhắn cho ảnh nhé!"); return; }
    if (!selectedFile)    { setError("Chưa chọn ảnh nào cả!");  return; }

    // Lưu tên vào localStorage để lần sau khỏi nhập lại
    localStorage.setItem(LOCAL_KEY, caption.trim());

    setStage("uploading");
    setError(null);
    startFakeProgress();

    try {
      await uploadPhoto(projectId, caption.trim(), selectedFile);
      finishProgress();
      // Chờ bar lên 100% rồi mới show success
      setTimeout(() => setStage("success"), 400);
    } catch (err) {
      console.error("Upload failed:", err);
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(0);
      setStage("error");
      setError("Có lỗi khi tải ảnh lên. Thử lại nhé!");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStage("idle");
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── SUCCESS STATE ─────────────────────────────────────────── */
  if (stage === "success") {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 text-center animate-scaleIn">
        {/* Confetti circle */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl animate-confetti"
            style={{ background: "linear-gradient(135deg, #4ADE80, #22C55E)", boxShadow: "0 0 40px rgba(74,222,128,0.4)" }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Ảnh đã được gửi</h2>
          <p className="text-white/60 mt-1 text-sm">
            Ảnh của bạn đang chờ hiển thị trên thư viện ảnh sự kiện
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 max-w-xs">
          <button
            onClick={handleReset}
            className="w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
              boxShadow: "0 0 20px rgba(124,106,246,0.4)",
            }}
          >
            Gửi thêm ảnh
          </button>
          <Link
            href={`/dashboard/${projectId}`}
            className="w-full py-3.5 rounded-2xl font-bold text-white/80 text-center transition-all active:scale-95 block"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--glass-border)" }}
          >
            Xem thư viện ảnh
          </Link>
        </div>
      </div>
    );
  }

  const canUpload = caption.trim() && selectedFile && stage !== "uploading";

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* ── Name Input ──────────────────────────────────── */}
      <div className="relative">
        <div
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            border: nameFocused
              ? "1px solid rgba(124,106,246,0.6)"
              : "1px solid var(--glass-border)",
            background: "var(--color-surface)",
            boxShadow: nameFocused ? "0 0 0 3px rgba(124,106,246,0.12)" : "none",
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <svg className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="Thêm lời nhắn cho ảnh của bạn"
              className="flex-1 bg-transparent text-white placeholder-white/30 text-sm font-medium outline-none"
              disabled={stage === "uploading"}
            />
          </div>
        </div>
        <p className="text-white/30 text-[11px] mt-1.5 ml-1">Lời nhắn sẽ hiển thị cùng ảnh trên sự kiện</p>
      </div>

      {/* ── Hidden file input ──────────────────────────── */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={stage === "uploading"}
      />

      {/* ── Photo Picker / Preview ─────────────────────── */}
      <div>
        {previewUrl ? (
          /* Preview */
          <div className="relative rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--glass-border)" }}>
            <div className="relative w-full overflow-hidden bg-black/40" style={{ minHeight: "260px" }}>
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
              />
              {/* Overlay khi uploading */}
              {stage === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: "rgba(9,9,15,0.65)", backdropFilter: "blur(4px)" }}>
                  <p className="text-white font-semibold text-sm mb-3">Đang gửi lên...</p>
                  {/* Progress bar */}
                  <div className="w-4/5 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-2))",
                        boxShadow: "0 0 10px var(--color-primary)",
                      }}
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-2">{Math.round(progress)}%</p>
                </div>
              )}
            </div>

            {/* Change photo button */}
            {stage !== "uploading" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 p-2.5 rounded-xl text-white transition-all active:scale-90"
                style={{ background: "rgba(9,9,15,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          /* Camera button */
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={stage === "uploading"}
            className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-12 transition-all duration-300 group active:scale-95"
            style={{
              border: "2px dashed rgba(124,106,246,0.3)",
              background: "rgba(124,106,246,0.04)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,106,246,0.7)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,106,246,0.08)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,106,246,0.3)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,106,246,0.04)";
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: "rgba(124,106,246,0.15)" }}>
            <svg className="w-10 h-10" style={{ color: "var(--color-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            </div>
            <div className="text-center">
              <p className="text-white/80 font-semibold text-sm">Chụp ảnh hoặc chọn từ thư viện</p>
              <p className="text-white/30 text-xs mt-1">Nhấn để mở camera hoặc thư viện ảnh</p>
            </div>
          </button>
        )}
      </div>

      {/* ── Error Message ──────────────────────────────── */}
      {error && (
        <div className="animate-fadeIn px-4 py-3 rounded-xl text-sm text-center"
          style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      {/* ── Submit ─────────────────────────────────────── */}
      <button
        onClick={handleUpload}
        disabled={!canUpload}
        className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        style={canUpload ? {
          background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
          boxShadow: "0 0 24px rgba(124,106,246,0.45)",
        } : {
          background: "var(--color-surface-2)",
        }}
      >
        {stage === "uploading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Đang gửi lên...
          </span>
        ) : (
          "Gửi ảnh"
        )}
      </button>

      {/* Redirect to Dashboard Link */}
      <Link
        href={`/dashboard/${projectId}`}
        className="w-full py-3.5 rounded-2xl font-bold text-white/40 text-center transition-all hover:text-white/70 active:scale-95 block text-sm"
      >
        Quay lại thư viện ảnh
      </Link>
    </div>
  );
}
