"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  projectId: string;
  size?: number;
}

export default function QRCodeDisplay({ projectId, size = 100 }: QRCodeDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Dev local: dùng LAN IP để điện thoại quét được
  // Production (Vercel): dùng domain thật từ window.location.origin
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const lanIp = process.env.NEXT_PUBLIC_LAN_IP;
  const origin = isLocal && lanIp
    ? `http://${lanIp}:3000`
    : (typeof window !== 'undefined' ? window.location.origin : '');
  
  const url = `${origin}/upload?projectId=${projectId}`;

  return (
    <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-indigo-500/30 flex flex-col items-center">
      <QRCodeSVG 
        value={url} 
        size={size}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        marginSize={0}
      />
      <div className="flex flex-col items-center gap-1 mt-2">
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Mã sự kiện</div>
        <div className="text-xl font-black text-indigo-600 font-mono tracking-tighter">{projectId}</div>
        <div className="text-[9px] text-gray-400 mt-0.5">Quét để gửi ảnh</div>
      </div>
    </div>
  );
}
