"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface ToastData {
  id: string;
  userName: string;
  imageUrl?: string;
  message?: string; // optional override
}

interface Props {
  toast: ToastData | null;
  onClick?: () => void;
}

/**
 * LiveToast — Hiện thông báo khi có ảnh mới upload realtime.
 * Tự động ẩn sau 3.5 giây, click để scroll đến ảnh.
 */
export default function LiveToast({ toast, onClick }: Props) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setLeaving(false);
    setVisible(true);

    // Auto-dismiss
    const hideTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => setVisible(false), 350);
    }, 3500);

    return () => clearTimeout(hideTimer);
  }, [toast?.id]);

  if (!toast || !visible) return null;

  return (
    <div
      className={`fixed top-5 right-4 z-[70] max-w-[280px] w-full cursor-pointer select-none ${
        leaving ? "animate-slideOutRight" : "animate-slideInRight"
      }`}
      onClick={() => {
        setLeaving(true);
        setTimeout(() => setVisible(false), 350);
        onClick?.();
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,106,246,0.2)",
        }}
      >
        {/* Thumbnail */}
        {toast.imageUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
            <Image
              src={toast.imageUrl}
              alt=""
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate">
            {toast.userName}
          </p>
          <p className="text-white/50 text-[11px]">
            {toast.message ?? "vừa gửi ảnh lên!"}
          </p>
        </div>

        {/* Live indicator */}
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-live)", boxShadow: "0 0 6px var(--color-live)" }} />
      </div>
    </div>
  );
}
