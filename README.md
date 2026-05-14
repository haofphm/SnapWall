# SnapWall — Real-time Event Photo Stream

**SnapWall** là một nền tảng chia sẻ ảnh thời gian thực, nơi mọi khoảnh khắc của khách mời được trình chiếu ngay lập tức lên màn hình sự kiện chỉ thông qua một thao tác quét mã QR đơn giản.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ⚡ 48-Hour "Vibe Coding" Challenge
Dự án này được lên ý tưởng và hoàn thiện trong vỏn vẹn **48 giờ**. Đây là một sản phẩm của phong cách "vibe coding" — tập trung tối đa vào trải nghiệm người dùng (UX), giao diện (UI) và tính năng thực tế thay vì sự hoàn hảo của mã nguồn.

> [!NOTE]
> Nếu bạn thấy code có chút "bay bổng" hoặc lộn xộn, đó là dấu vết của những đêm thức trắng để kịp tiến độ sự kiện. Rất hoan nghênh mọi đóng góp để refactor dự án sạch đẹp hơn!

---

## ✨ Tính năng nổi bật
*   **Instant Sync:** Ảnh xuất hiện ngay lập tức nhờ Firebase Cloud Firestore.
*   **Mobile First:** Khách mời chụp và gửi ảnh trực tiếp từ trình duyệt điện thoại, không cần cài app.
*   **Glassmorphism UI:** Dashboard hiện đại, mượt mà, tối ưu cho màn hình trình chiếu lớn.
*   **Interactive Hearts:** Tương tác thả tim real-time đầy sinh động.
*   **Admin Toggle:** Đóng/mở quyền gửi ảnh chỉ với một chạm.

---

## 🛠️ Công nghệ sử dụng
*   **Frontend:** Next.js 15 (App Router), React 19.
*   **Backend:** Firebase (Firestore & Storage).
*   **Layout:** Masonic (Masonry Grid), Tailwind CSS v4.

---

## 🚀 Cài đặt & Chạy thử
1. **Clone & Install:**
   ```bash
   git clone https://github.com/your-username/snap-wall.git
   npm install
   ```
2. **Environment Variables:**
   Tạo file `.env.local` và điền các khóa Firebase của bạn (xem mẫu trong `.env.example`).
3. **Run Dev:**
   ```bash
   npm run dev
   ```

---

## 🏗️ Tầm nhìn & Đóng góp
Dự án được xây dựng với mục tiêu mang lại niềm vui tức thì trong các buổi tiệc. Vì được build quá nhanh, SnapWall rất cần sự chung tay của cộng đồng để:
- Tối ưu hóa hiệu năng (Refactoring).
- Nâng cấp bảo mật cho hệ thống upload.
- Thêm các hiệu ứng chuyển cảnh cho Dashboard.

---
*Concept inspired by existing design patterns, reimagined and developed by **I2FLabs** within a 48-hour sprint.*
