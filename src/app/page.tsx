"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const DEMO_IMAGES = [
  "https://picsum.photos/seed/ev1/300/400",
  "https://picsum.photos/seed/ev2/300/500",
  "https://picsum.photos/seed/ev3/300/350",
  "https://picsum.photos/seed/ev4/300/460",
  "https://picsum.photos/seed/ev5/300/380",
];

export default function Home() {
  const [projectId, setProjectId]   = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [mode, setMode]             = useState<"create" | "join">("create");
  const [joinId, setJoinId]         = useState("");
  const router = useRouter();

  const handleGenerate = () => {
    const id = projectId.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedId(id);
  };

  const handleJoin = () => {
    const id = joinId.trim().toUpperCase();
    if (id) router.push(`/dashboard/${id}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Animated mesh background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-bg opacity-70" />
        {/* Glow orbs */}
        <div className="absolute top-[-10%] left-[20%] w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "var(--color-primary)" }} />
        <div className="absolute bottom-[-5%] right-[15%] w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--color-primary-2)" }} />
      </div>

      {/* ── Floating demo photos (background decoration) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {DEMO_IMAGES.map((src, i) => (
          <div
            key={i}
            className="absolute rounded-2xl overflow-hidden opacity-10"
            style={{
              width: "120px",
              left: `${[5, 75, 15, 82, 55][i]}%`,
              top:  `${[10, 5, 55, 50, 75][i]}%`,
              transform: `rotate(${[-8,-4,6,-10,4][i]}deg)`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full object-cover" style={{ height: "160px" }} />
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">

          {/* Hero */}
          <div className="text-center space-y-3 animate-fadeIn">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-3"
              style={{ background: "rgba(124,106,246,0.15)", color: "var(--color-primary)", border: "1px solid rgba(124,106,246,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "var(--color-primary)" }} />
              Chia sẻ khoảnh khắc realtime
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)" }}>
              Event Snap
            </h1>
            <p className="text-base" style={{ color: "rgba(240,239,248,0.5)" }}>
              Sự kiện của bạn, qua góc nhìn của mọi người.
            </p>
          </div>

          {/* Card */}
          {!generatedId ? (
            <div className="animate-scaleIn rounded-3xl p-6 space-y-5"
              style={{ background: "var(--color-surface)", border: "1px solid var(--glass-border)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>

              {/* Tab switcher */}
              <div className="flex rounded-2xl p-1" style={{ background: "var(--color-bg)" }}>
                {(["create", "join"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={mode === m ? {
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(124,106,246,0.4)",
                    } : { color: "rgba(240,239,248,0.4)" }}>
                    {m === "create" ? "Tạo sự kiện" : "Tham gia"}
                  </button>
                ))}
              </div>

              {mode === "create" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "rgba(240,239,248,0.5)" }}>
                      Mã sự kiện (để trống để tạo ngẫu nhiên)
                    </label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                      placeholder="VD: MY-WEDDING-2025"
                      className="w-full px-4 py-3.5 rounded-2xl text-white text-center font-mono tracking-widest text-sm outline-none transition-all"
                      style={{
                        background: "var(--color-bg)",
                        border: "1px solid var(--glass-border)",
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(124,106,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,106,246,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <button onClick={handleGenerate}
                    className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                      boxShadow: "0 0 24px rgba(124,106,246,0.4)",
                    }}>
                    Tạo Sự Kiện Mới
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "rgba(240,239,248,0.5)" }}>
                      Nhập mã sự kiện được chia sẻ
                    </label>
                    <input
                      type="text"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      placeholder="VD: ABC123"
                      className="w-full px-4 py-3.5 rounded-2xl text-white text-center font-mono tracking-widest text-sm outline-none transition-all uppercase"
                      style={{ background: "var(--color-bg)", border: "1px solid var(--glass-border)" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(124,106,246,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,106,246,0.12)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <button onClick={handleJoin} disabled={!joinId.trim()}
                    className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-95 disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                      boxShadow: joinId.trim() ? "0 0 24px rgba(124,106,246,0.4)" : "none",
                    }}>
                    Xem Gallery →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* QR Display */
            <div className="animate-scaleIn rounded-3xl p-6 space-y-5"
              style={{ background: "var(--color-surface)", border: "1px solid var(--glass-border)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: "rgba(240,239,248,0.4)" }}>Mã sự kiện</p>
                <h2 className="text-2xl font-extrabold font-mono" style={{ color: "var(--color-primary)" }}>{generatedId}</h2>
                <p className="text-sm mt-1" style={{ color: "rgba(240,239,248,0.45)" }}>Mời khách quét QR để tải ảnh lên!</p>
              </div>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl">
                  <QRCodeDisplay projectId={generatedId} size={220} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem(`event_snap_host_${generatedId}`, "true");
                    router.push(`/dashboard/${generatedId}`);
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))", boxShadow: "0 0 20px rgba(124,106,246,0.4)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Mở Dashboard
                </button>
                <button onClick={() => setGeneratedId("")}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  style={{ background: "var(--color-surface-2)", color: "rgba(240,239,248,0.5)", border: "1px solid var(--glass-border)" }}>
                  Tạo sự kiện khác
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
