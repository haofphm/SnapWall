import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  limit,
  startAfter,
  type DocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Photo } from "@/types";

/**
 * Upload ảnh lên Storage và lưu thông tin vào Firestore
 */
export async function uploadPhoto(
  projectId: string,
  userName: string,
  file: File
): Promise<void> {
  // Tạo tên file duy nhất tránh trùng lặp
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const storageRef = ref(storage, `photos/${projectId}/${fileName}`);

  // 1. Upload file lên Cloud Storage
  const snapshot = await uploadBytes(storageRef, file);
  
  // 2. Lấy URL tải xuống của ảnh vừa upload
  const imageUrl = await getDownloadURL(snapshot.ref);

  // 3. Lưu thông tin vào Firestore
  await addDoc(collection(db, "photos"), {
    projectId,
    userName: userName.trim(),
    imageUrl,
    createdAt: serverTimestamp(),
  });
}

/**
 * Lấy trang ảnh đầu tiên hoặc tiếp theo (Pagination)
 * Trả về danh sách ảnh và cursor cho trang tiếp theo
 */
export async function fetchPhotosPage(
  projectId: string,
  pageSize: number,
  cursor?: DocumentSnapshot
): Promise<{ photos: Photo[]; lastDoc: DocumentSnapshot | null }> {
  const constraints = [
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc"),
    limit(pageSize),
    ...(cursor ? [startAfter(cursor)] : []),
  ];

  const q = query(collection(db, "photos"), ...constraints);
  const snapshot = await getDocs(q);

  const photos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Photo[];
  const lastDoc = snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { photos, lastDoc };
}

/**
 * Lắng nghe real-time chỉ những ảnh MỚI được upload SAU thời điểm mountedAt
 * Trả về một hàm unsubscribe
 */
export function subscribeToNewPhotos(
  projectId: string,
  mountedAt: Timestamp,
  callback: (newPhotos: Photo[]) => void
): () => void {
  const q = query(
    collection(db, "photos"),
    where("projectId", "==", projectId),
    where("createdAt", ">", mountedAt),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) return;
    const photos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Photo[];
    callback(photos);
  });
}

/**
 * Thả tim / Bỏ thả tim cho một bức ảnh
 */
export async function toggleLikePhoto(
  photoId: string,
  deviceId: string,
  isLiking: boolean
): Promise<void> {
  const photoRef = doc(db, "photos", photoId);
  await updateDoc(photoRef, {
    likedBy: isLiking ? arrayUnion(deviceId) : arrayRemove(deviceId),
  });
}

/**
 * Lắng nghe real-time mọi thay đổi (cập nhật) của ảnh trong project.
 * Dùng để đồng bộ số tim / likedBy trên dashboard mà không cần reload.
 */
export function subscribeToPhotoChanges(
  projectId: string,
  callback: (changed: Photo[]) => void
): () => void {
  const q = query(
    collection(db, "photos"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const changed = snapshot
      .docChanges()
      .filter((c) => c.type === "modified")
      .map((c) => ({ id: c.doc.id, ...c.doc.data() }) as Photo);
    if (changed.length > 0) callback(changed);
  });
}

/**
 * Lấy trạng thái Live của project (mặc định true nếu chưa có)
 */
export async function getProjectLive(projectId: string): Promise<boolean> {
  const ref = doc(db, "projects", projectId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return true;
  const data = snap.data();
  return data.isLive !== false;
}

/**
 * Bật/Tắt trạng thái Live của project (chỉ admin)
 */
export async function setProjectLive(projectId: string, isLive: boolean): Promise<void> {
  const ref = doc(db, "projects", projectId);
  await setDoc(ref, { isLive }, { merge: true });
}

/**
 * Subscribe real-time trạng thái Live của project
 */
export function subscribeToProjectLive(
  projectId: string,
  callback: (isLive: boolean) => void
): () => void {
  const ref = doc(db, "projects", projectId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) { callback(true); return; }
    callback(snap.data().isLive !== false);
  });
}
