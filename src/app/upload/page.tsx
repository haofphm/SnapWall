"use client";

import { useEffect, useState, use } from "react";
import UploadForm from "@/components/UploadForm";
import { subscribeToProjectLive } from "@/lib/firestore";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function UploadPage({ searchParams }: Props) {
  const params = use(searchParams);
  const projectId = params.projectId;
  const [isLive, setIsLive] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!projectId || typeof projectId !== "string") {
      setChecked(true);
      return;
    }
    const unsub = subscribeToProjectLive(projectId, (live) => {
      setIsLive(live);
      setChecked(true);
    });
    return unsub;
  }, [projectId]);

  if (!projectId || typeof projectId !== "string") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>
        <div className="text-center max-w-sm p-8 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid rgba(244,63,94,0.3)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ background: "rgba(244,63,94,0.15)" }}>
              <svg className="w-8 h-8" style={{ color: "var(--color-like)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          <h1 className="text-xl font-bold text-white mb-2">Link không hợp lệ</h1>
          <p className="text-sm" style={{ color: "rgba(240,239,248,0.45)" }}>
            Vui lòng quét lại mã QR tại sự kiện để tiếp tục.
          </p>
        </div>
      </div>
    );
  }

  // Chờ kiểm tra trạng thái live trước khi render
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Sự kiện đã kết thúc
  if (!isLive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>
        <div className="text-center max-w-sm p-8 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid rgba(100,100,120,0.2)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(100,100,120,0.15)" }}>
            <svg className="w-8 h-8" style={{ color: "rgba(200,200,220,0.5)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Sự kiện đã kết thúc</h1>
          <p className="text-sm" style={{ color: "rgba(240,239,248,0.45)" }}>
            Ban tổ chức đã đóng việc gửi ảnh. Cảm ơn bạn đã tham gia!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--color-primary)" }} />
        <div className="absolute bottom-[-10%] right-[20%] w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: "var(--color-primary-2)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 pb-8">
        {/* Header */}
        <header className="w-full max-w-sm mx-auto text-center pt-10 pb-6">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
            Event Snap
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(240,239,248,0.4)" }}>
          Lưu giữ khoảnh khắc cùng nhau
          </p>
        </header>

        {/* Form */}
        <main className="flex-1 flex items-start justify-center">
          <UploadForm projectId={projectId} />
        </main>
      </div>
    </div>
  );
}
