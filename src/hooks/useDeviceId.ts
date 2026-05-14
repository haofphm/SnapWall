"use client";

import { useState, useEffect } from "react";

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ chạy trên client
    let id = localStorage.getItem("event_snap_device_id");
    if (!id) {
      // Tạo một ID ngẫu nhiên đơn giản
      id = "device_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      localStorage.setItem("event_snap_device_id", id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}
