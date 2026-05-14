"use client";

import { useEffect, useState, use, useCallback, useRef } from "react";
import { fetchPhotosPage, subscribeToNewPhotos, toggleLikePhoto, setProjectLive, subscribeToProjectLive, subscribeToPhotoChanges } from "@/lib/firestore";
import type { DocumentSnapshot } from "firebase/firestore";
import { useDeviceId } from "@/hooks/useDeviceId";
import type { Photo } from "@/types";
import { Timestamp } from "firebase/firestore";
import PhotoCard from "@/components/PhotoCard";
import QRCodeDisplay from "@/components/QRCodeDisplay";

import dynamic from "next/dynamic";

const Masonry = dynamic(() => import("masonic").then((mod) => mod.Masonry), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl skeleton" style={{ height: `${200 + (i * 57) % 180}px` }} />
      ))}
    </div>
  ),
});

type Props = { params: Promise<{ projectId: string }> };

const generateMockPhotos = (count: number, projectId: string): Photo[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `mock-photo-${projectId}-${i}`,
    projectId,
    userName: `Khách mời ${i + 1}`,
    imageUrl: `https://picsum.photos/seed/${projectId}-${i}/500/${300 + ((i * 137) % 500)}`,
    createdAt: Timestamp.now(),
  }));

export default function DashboardPage({ params }: Props) {
  const { projectId } = use(params);

  const [photos, setPhotos]           = useState<Photo[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const [lastDoc, setLastDoc]         = useState<DocumentSnapshot | null>(null);
  const [isScrolled, setIsScrolled]   = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [colWidth, setColWidth]       = useState(250);
  const [isHost, setIsHost]           = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLive, setIsLive]           = useState(true);


  // Refs for stale-closure-safe infinite scroll
  const loadingMoreRef = useRef(false);
  const hasMoreRef     = useRef(true);
  const lastDocRef     = useRef<DocumentSnapshot | null>(null);
  const sentinelRef    = useRef<HTMLDivElement>(null);
  const mockOffsetRef  = useRef(0);

  // Lightbox swipe state
  const touchStartX = useRef<number | null>(null);

  const PAGE_SIZE  = 10;
  const MOCK_TOTAL = 0; // Set >0 for testing

  const deviceId = useDeviceId();

  const currentPhoto = selectedIdx !== null ? photos[selectedIdx] ?? null : null;
  const isLiked   = currentPhoto && deviceId ? currentPhoto.likedBy?.includes(deviceId) : false;
  const likesCount = currentPhoto?.likedBy?.length || 0;

  // ── Init ──────────────────────────────────────────────────
  // Đọc localStorage và window SAU KHI mount để tránh Hydration Mismatch
  useEffect(() => {
    setIsHost(localStorage.getItem(`snap_wall_host_${projectId}`) === "true");
    setColWidth(window.innerWidth < 640 ? 150 : 250);

    const onResize = () => setColWidth(window.innerWidth < 640 ? 150 : 250);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [projectId]);

  // Subscribe real-time trạng thái Live từ Firestore
  useEffect(() => {
    return subscribeToProjectLive(projectId, setIsLive);
  }, [projectId]);

  // Subscribe real-time cập nhật ảnh (like, v.v.) — đồng bộ số tim từ mọi thiết bị
  useEffect(() => {
    return subscribeToPhotoChanges(projectId, (changedPhotos) => {
      setPhotos((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        changedPhotos.forEach((p) => map.set(p.id, p));
        return Array.from(map.values());
      });
    });
  }, [projectId]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Data load + realtime ───────────────────────────────────
  useEffect(() => {
    const mountedAt = Timestamp.now();
    fetchPhotosPage(projectId, PAGE_SIZE).then(({ photos: init, lastDoc: cursor }) => {
      const mock = MOCK_TOTAL > 0 ? generateMockPhotos(MOCK_TOTAL, projectId).slice(0, PAGE_SIZE) : [];
      mockOffsetRef.current = mock.length;
      setPhotos([...init, ...mock]);
      setLastDoc(cursor);
      lastDocRef.current = cursor;
      const more = cursor !== null || mockOffsetRef.current < MOCK_TOTAL;
      setHasMore(more);
      hasMoreRef.current = more;
      setLoading(false);
    });

    const unsub = subscribeToNewPhotos(projectId, mountedAt, (newPhotos) => {
      setPhotos((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const unique = newPhotos.filter((p) => !ids.has(p.id));
        if (unique.length === 0) return prev;

        return [...unique, ...prev];
      });
    });
    return () => unsub();
  }, [projectId]);

  // ── Infinite scroll ────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    let newReal: Photo[] = [], newCursor: DocumentSnapshot | null = null;
    if (lastDocRef.current) {
      const r = await fetchPhotosPage(projectId, PAGE_SIZE, lastDocRef.current);
      newReal = r.photos; newCursor = r.lastDoc;
      lastDocRef.current = newCursor; setLastDoc(newCursor);
    }

    let newMock: Photo[] = [];
    if (MOCK_TOTAL > 0 && mockOffsetRef.current < MOCK_TOTAL) {
      newMock = generateMockPhotos(MOCK_TOTAL, projectId).slice(mockOffsetRef.current, mockOffsetRef.current + PAGE_SIZE);
      mockOffsetRef.current += newMock.length;
    }

    const combined = [...newReal, ...newMock];
    if (combined.length > 0) {
      setPhotos((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...combined.filter((p) => !ids.has(p.id))];
      });
    }
    const stillMore = newCursor !== null || mockOffsetRef.current < MOCK_TOTAL;
    hasMoreRef.current = stillMore; setHasMore(stillMore);
    loadingMoreRef.current = false; setLoadingMore(false);
  }, [projectId]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (e) => { if (e[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // ── Lightbox keyboard ──────────────────────────────────────
  useEffect(() => {
    if (selectedIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setSelectedIdx((i) => i !== null && i > 0 ? i - 1 : photos.length - 1);
      if (e.key === "ArrowRight") setSelectedIdx((i) => i !== null && i < photos.length - 1 ? i + 1 : 0);
      if (e.key === "Escape")     setSelectedIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIdx, photos.length]);

  // ── Lightbox like ──────────────────────────────────────────
  const handleLikeModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentPhoto || !deviceId) return;
    if (currentPhoto.id.startsWith("mock-photo-")) return;
    try { await toggleLikePhoto(currentPhoto.id, deviceId, !isLiked); }
    catch (err) { console.error(err); }
  };

  // ── Masonry card render ────────────────────────────────────
  const MasonryCard = useCallback(
    ({ data, index }: { data: Photo; index: number }) => (
      <PhotoCard photo={data} onClick={() => setSelectedIdx(index)} />
    ), []
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-10" style={{ background: "var(--color-bg)" }}>



      {/* ── Sticky Glass Header ── */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? "animate-slideDown shadow-xl" : ""}`}
        style={isScrolled ? {
          background: "var(--glass-bg)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          borderBottom: "1px solid var(--glass-border)",
        } : { background: "transparent" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="font-extrabold text-transparent bg-clip-text text-base md:text-lg whitespace-nowrap"
              style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
              SnapWall
            </span>

            {/* LIVE badge — admin can toggle, others see read-only */}
            {isHost ? (
              <button
                onClick={() => setProjectLive(projectId, !isLive)}
                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-200 active:scale-95 cursor-pointer hover:opacity-80"
                style={isLive
                  ? { background: "rgba(74,222,128,0.15)", color: "var(--color-live)", border: "1px solid rgba(74,222,128,0.3)" }
                  : { background: "rgba(244,63,94,0.15)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.35)" }
                }
                title={isLive ? "Nhấn để tắt sự kiện" : "Nhấn để bật lại sự kiện"}
              >
                <span className="w-2 h-2 rounded-full inline-block"
                  style={isLive
                    ? { background: "var(--color-live)", animation: "glow-pulse 1.5s infinite" }
                    : { background: "#F43F5E" }
                  } />
                {isLive ? "LIVE" : "OFF"}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={isLive
                  ? { background: "rgba(74,222,128,0.15)", color: "var(--color-live)", border: "1px solid rgba(74,222,128,0.3)" }
                  : { background: "rgba(244,63,94,0.15)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.35)" }
                }
              >
                <span className="w-2 h-2 rounded-full inline-block"
                  style={isLive
                    ? { background: "var(--color-live)", animation: "glow-pulse 1.5s infinite" }
                    : { background: "#F43F5E" }
                  } />
                {isLive ? "LIVE" : "OFF"}
              </span>
            )}


          </div>

          {/* QR button for host */}
          {isHost && (
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs text-white transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                boxShadow: "0 0 16px rgba(124,106,246,0.4)",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="hidden sm:inline">Chia sẻ QR</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Page Hero (non-sticky) ── */}
      {!isScrolled && (
        <div className="px-4 md:px-8 pt-6 pb-4 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
            Event Snap Gallery
          </h1>
          <p className="mt-1" style={{ color: "rgba(240,239,248,0.5)", fontSize: "0.95rem" }}>
            Đang phát trực tiếp
          </p>
        </div>
      )}

      {/* ── Gallery ── */}
      <main className="px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl skeleton"
                style={{ height: `${220 + (i * 57) % 160}px` }} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          /* ── Empty State ── */
          <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto" style={{ color: "rgba(124,106,246,0.4)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Chưa có khoảnh khắc nào</h2>
            <p className="text-sm mb-1" style={{ color: "rgba(240,239,248,0.45)" }}>
              Hãy là người đầu tiên chia sẻ!
            </p>

            {/* 3-step mini guide */}
            <div className="flex items-center gap-3 mt-6 mb-8 text-xs" style={{ color: "rgba(240,239,248,0.35)" }}>
              {["Quét QR", "Chụp ảnh", "Chia sẻ"].map((label, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(124,106,246,0.15)", color: "var(--color-primary)", border: "1px solid rgba(124,106,246,0.25)" }}>
                      {i + 1}
                    </div>
                    <span>{label}</span>
                  </div>
                  {i < 2 && <span className="opacity-25 -mt-4">›</span>}
                </div>
              ))}
            </div>

            {isHost && (
              <button
                onClick={() => setShowQRModal(true)}
                className="px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                  boxShadow: "0 0 20px rgba(124,106,246,0.4)",
                }}
              >
                Chia sẻ QR code
              </button>
            )}
          </div>
        ) : (
          <Masonry
            items={photos}
            columnGutter={12}
            columnWidth={colWidth}
            render={MasonryCard as any}
          />
        )}

        <div ref={sentinelRef} className="h-1" />

        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3" style={{ color: "rgba(240,239,248,0.4)" }}>
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: "rgba(124,106,246,0.3)", borderTopColor: "var(--color-primary)" }} />
              <span className="text-sm">Đang tải thêm...</span>
            </div>
          </div>
        )}

        {!hasMore && photos.length > 0 && (
          <div className="flex justify-center py-8">
            <span className="text-sm" style={{ color: "rgba(240,239,248,0.25)" }}>― Đã hiển thị hết ảnh ―</span>
          </div>
        )}
      </main>

      {/* ── QR Modal ── */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: "rgba(9,9,15,0.88)", backdropFilter: "blur(12px)" }}
          onClick={() => setShowQRModal(false)}>
          <div className="w-full max-w-sm animate-scaleIn" onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--color-surface)", border: "1px solid var(--glass-border)", borderRadius: "1.5rem", padding: "2rem" }}>
            <button onClick={() => setShowQRModal(false)}
              className="absolute" style={{ position: "relative", float: "right", color: "rgba(240,239,248,0.4)", marginBottom: "-1rem" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-white text-center mb-1">Quét để tham gia</h2>

            <div className="bg-white p-4 rounded-2xl flex justify-center mb-4">
              <QRCodeDisplay projectId={projectId} size={260} />
            </div>
            <p className="text-center text-xs animate-pulse" style={{ color: "var(--color-primary)" }}>
              Đang phát trực tiếp...
            </p>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {currentPhoto && selectedIdx !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn no-select"
          style={{ background: "rgba(9,9,15,0.96)", backdropFilter: "blur(16px)" }}
          onClick={() => setSelectedIdx(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) < 40) return;
            if (dx < 0) setSelectedIdx((i) => i !== null && i < photos.length - 1 ? i + 1 : 0);
            else        setSelectedIdx((i) => i !== null && i > 0 ? i - 1 : photos.length - 1);
          }}
        >
          {/* Prev */}
          <button
            className="absolute left-3 md:left-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
            style={{ background: "rgba(240,239,248,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => { e.stopPropagation(); setSelectedIdx((i) => i !== null && i > 0 ? i - 1 : photos.length - 1); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.imageUrl}
              alt={`Photo by ${currentPhoto.userName}`}
              className="object-contain rounded-xl"
              style={{
                maxHeight: "calc(100vh - 8rem)",
                maxWidth: "calc(100vw - 7rem)",
                boxShadow: "0 0 80px rgba(0,0,0,0.7)",
              }}
            />

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: "rgba(240,239,248,0.08)", color: "rgba(240,239,248,0.5)", backdropFilter: "blur(8px)" }}>
              {selectedIdx + 1} / {photos.length}
            </div>

            {/* Close */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
              style={{ background: "rgba(240,239,248,0.1)", backdropFilter: "blur(8px)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Bottom info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 rounded-full"
              style={{ background: "rgba(9,9,15,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-white font-semibold text-sm whitespace-nowrap">{currentPhoto.userName}</span>
              <span className="w-px h-4 shrink-0" style={{ background: "rgba(255,255,255,0.15)" }} />
              <span className="text-xs whitespace-nowrap" style={{ color: "rgba(240,239,248,0.4)" }}>
                {currentPhoto.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "Vừa xong"}
              </span>
              <span className="w-px h-4 shrink-0" style={{ background: "rgba(255,255,255,0.15)" }} />
              <button onClick={handleLikeModal}
                className="flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95">
                <svg
                  className={`w-5 h-5 transition-all duration-300 ${isLiked ? "scale-110" : ""}`}
                  style={{ fill: isLiked ? "var(--color-like)" : "none", color: isLiked ? "var(--color-like)" : "rgba(240,239,248,0.6)" }}
                  stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likesCount > 0 && (
                  <span className="text-sm font-bold" style={{ color: isLiked ? "var(--color-like)" : "rgba(240,239,248,0.6)" }}>
                    {likesCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Next */}
          <button
            className="absolute right-3 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
            style={{ background: "rgba(240,239,248,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => { e.stopPropagation(); setSelectedIdx((i) => i !== null && i < photos.length - 1 ? i + 1 : 0); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
