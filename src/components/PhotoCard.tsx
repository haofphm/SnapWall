"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/types";
import { useDeviceId } from "@/hooks/useDeviceId";
import { toggleLikePhoto } from "@/lib/firestore";

interface PhotoCardProps {
  photo: Photo;
  onClick?: () => void;
}

export default function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const deviceId = useDeviceId();
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);


  const [likeAnim, setLikeAnim] = useState(false);
  // localLiked = null nghĩa là chưa tương tác, dùng giá trị từ Firestore
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);
  const isLiked    = localLiked !== null ? localLiked : (deviceId ? (photo.likedBy?.includes(deviceId) ?? false) : false);
  const likesCount = photo.likedBy?.length || 0;




  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deviceId) return;
    if (photo.id.startsWith("mock-photo-")) return;

    const willLike = !isLiked;

    // Optimistic update — đổi màu ngay lập tức
    setLocalLiked(willLike);

    if (willLike) {
      // Trigger heartbeat animation
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 500);

      // Floating hearts
      const newHeart = { id: Date.now(), x: Math.random() * 40 - 20 };
      setHearts((prev) => [...prev, newHeart]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1100);
    }

    try {
      await toggleLikePhoto(photo.id, deviceId, willLike);
    } catch (err) {
      console.error("Lỗi thả tim:", err);
      // Rollback nếu lỗi
      setLocalLiked(!willLike);
    }
  };

  const timeStr = photo.createdAt
    ?.toDate()
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    || "Vừa xong";

  return (
    <div
      className={`relative group rounded-2xl overflow-hidden shadow-xl border border-white/5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(124,106,246,0.25)] hover:-translate-y-0.5 ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{ background: "var(--color-surface)" }}
      onClick={onClick}
    >


      {/* Image */}
      <div className="relative w-full">
        <Image
          src={photo.imageUrl}
          alt={`Photo by ${photo.userName}`}
          width={500}
          height={750}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Gradient overlay — always visible at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Info bar — always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {/* Message Icon instead of Avatar */}
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(124,106,246,0.15)", border: "1px solid rgba(124,106,246,0.2)" }}>
            <svg className="w-3.5 h-3.5" style={{ color: "var(--color-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium text-[11px] line-clamp-2 drop-shadow-sm leading-tight italic">
              &quot;{photo.userName}&quot;
            </p>
            <p className="text-white/40 text-[9px] mt-0.5">{timeStr}</p>
          </div>
        </div>

        {/* Like button — 44px tap target */}
        <div className="relative shrink-0">
          <button
            onClick={handleLike}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-xl backdrop-blur-sm transition-all duration-200 active:scale-95"
            style={{
              background: isLiked ? "rgba(244,63,94,0.2)" : "rgba(0,0,0,0.4)",
              border: isLiked ? "1px solid rgba(244,63,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
            }}
            aria-label={`${isLiked ? "Bỏ like" : "Like"} ảnh của ${photo.userName}`}
          >
            <svg
              className={`w-5 h-5 transition-all duration-300 ${
                likeAnim ? "animate-heartbeat" : ""
              } ${isLiked ? "fill-[#F43F5E] text-[#F43F5E]" : "fill-none text-white"}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {likesCount > 0 && (
              <span className={`text-[10px] font-bold leading-none mt-0.5 ${isLiked ? "text-[#F43F5E]" : "text-white/70"}`}>
                {likesCount}
              </span>
            )}
          </button>

          {/* Floating Hearts */}
          {hearts.map((heart) => (
            <div
              key={heart.id}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none animate-float-heart"
              style={{ "--tx": `${heart.x}px` } as React.CSSProperties}
            >
              <svg className="w-7 h-7 drop-shadow-lg" viewBox="0 0 24 24" style={{ fill: "var(--color-like)" }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
