import { Timestamp } from "firebase/firestore";

export interface Photo {
  id: string;
  projectId: string;
  userName: string;
  imageUrl: string;
  createdAt: Timestamp;
  likedBy?: string[];
}
