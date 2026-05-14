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
  const [generatedId, setGeneratedId] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [joinId, setJoinId] = useState("");
  const router = useRouter();

  const handleGenerate = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedId(id);
  };

  const handleJoin = () => {
    const id = joinId.trim().toUpperCase();
    if (id) router.push(`/dashboard/${id}`);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Animated mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-bg opacity-70" />
        <div
          className="absolute top-[-10%] left-[20%] w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="absolute bottom-[-5%] right-[15%] w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--color-primary-2)" }}
        />
      </div>

      {/* Floating demo photos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {DEMO_IMAGES.map((src, i) => (
          <div
            key={i}
            className="absolute rounded-2xl overflow-hidden opacity-10"
            style={{
              width: "120px",
              left: `${[5, 75, 15, 82, 55][i]}%`,
              top: `${[10, 5, 55, 50, 75][i]}%`,
              transform: `rotate(${[-8, -4, 6, -10, 4][i]}deg)`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="w-full object-cover"
              style={{ height: "160px" }}
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {!generatedId && (
            <div className="text-center space-y-3 animate-fadeIn">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-3"
                style={{
                  background: "rgba(124,106,246,0.15)",
                  color: "var(--color-primary)",
                  border: "1px solid rgba(124,106,246,0.25)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                  style={{ background: "var(--color-primary)" }}
                />
                Chia sẻ khoảnh khắc theo thời gian thực
              </div>
              <h1
                className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 100%)",
                }}
              >
                SnapWall
              </h1>
              <p className="text-base" style={{ color: "rgba(240,239,248,0.5)" }}>
                Sự kiện của bạn, qua góc nhìn của mọi người.
              </p>
            </div>
          )}

          {!generatedId ? (
            <div
              className="animate-scaleIn rounded-3xl p-6 space-y-5"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--glass-border)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex rounded-2xl p-1" style={{ background: "var(--color-bg)" }}>
                {(["create", "join"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={
                      mode === m
                        ? {
                            background:
                              "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(124,106,246,0.4)",
                          }
                        : { color: "rgba(240,239,248,0.4)" }
                    }
                  >
                    {m === "create" ? "Tạo sự kiện" : "Nhập mã"}
                  </button>
                ))}
              </div>

              {mode === "create" ? (
                <div className="space-y-8 py-6 text-center animate-fadeIn">
                  <div
                    className="relative mx-auto w-20 h-20 rounded-3xl flex items-center justify-center transform rotate-12"
                    style={{
                      background: "rgba(124,106,246,0.1)",
                      border: "1px solid rgba(124,106,246,0.2)",
                    }}
                  >
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.143-7.714L1 12l6.857-2.143L11 3z"
                      />
                    </svg>
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse"
                      style={{ background: "var(--color-primary-2)" }}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Khởi tạo sự kiện
                    </h3>
                    <p className="text-sm px-4" style={{ color: "rgba(240,239,248,0.4)" }}>
                      Tạo một không gian chia sẻ ảnh cho sự kiện chỉ trong vài giây.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full py-4.5 rounded-2xl font-bold text-base text-white transition-all active:scale-95 group relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                      boxShadow: "0 12px 32px rgba(124,106,246,0.4)",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Bắt đầu sự kiện ngay
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-xs font-medium mb-2"
                      style={{ color: "rgba(240,239,248,0.5)" }}
                    >
                      Nhập mã sự kiện
                    </label>
                    <input
                      type="text"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      placeholder="VD: ABC123"
                      className="w-full px-4 py-3.5 rounded-2xl text-white text-center font-mono tracking-widest text-sm outline-none transition-all uppercase"
                      style={{
                        background: "var(--color-bg)",
                        border: "1px solid var(--glass-border)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(124,106,246,0.6)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,106,246,0.12)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "var(--glass-border)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={!joinId.trim()}
                    className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-95 disabled:opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                      boxShadow: joinId.trim() ? "0 0 24px rgba(124,106,246,0.4)" : "none",
                    }}
                  >
                    Xem thư viện ảnh →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="animate-scaleIn rounded-3xl p-6 space-y-5"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--glass-border)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: "rgba(240,239,248,0.4)" }}>
                  Mã sự kiện
                </p>
                <h2
                  className="text-2xl font-extrabold font-mono"
                  style={{ color: "var(--color-primary)" }}
                >
                  {generatedId}
                </h2>
                <p className="text-sm mt-1" style={{ color: "rgba(240,239,248,0.45)" }}>
                  Mời khách quét QR để gửi ảnh lên sự kiện.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl">
                  <QRCodeDisplay projectId={generatedId} size={220} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem(`snap_wall_host_${generatedId}`, "true");
                    router.push(`/upload?projectId=${generatedId}`);
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Gửi ảnh
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem(`snap_wall_host_${generatedId}`, "true");
                    router.push(`/dashboard/${generatedId}`);
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                    boxShadow: "0 0 20px rgba(124,106,246,0.4)",
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Mở thư viện ảnh
                </button>
                <button
                  onClick={() => setGeneratedId("")}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  style={{
                    background: "var(--color-surface-2)",
                    color: "rgba(240,239,248,0.5)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  Tạo sự kiện mới
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
