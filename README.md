# SnapWall — Nền tảng chia sẻ khoảnh khắc sự kiện thời gian thực

**SnapWall** là giải pháp công nghệ giúp kết nối khách mời và ban tổ chức thông qua việc chia sẻ hình ảnh trực tiếp. Khách mời chỉ cần quét mã QR để gửi ảnh, và những khoảnh khắc đó sẽ ngay lập tức được trình chiếu lên màn hình chính của sự kiện, tạo nên một không gian tương tác sống động và hiện đại.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## Các tính năng chính

*   **Real-time Dashboard:** Tự động cập nhật và hiển thị ảnh mới ngay lập tức mà không cần tải lại trang nhờ tích hợp Firebase Cloud Firestore.
*   **Mobile Optimized:** Giao diện web-app được tối ưu hoàn toàn cho thiết bị di động, cho phép khách mời chụp và gửi ảnh nhanh chóng mà không cần cài đặt ứng dụng.
*   **Thiết kế Glassmorphism:** Giao diện Dashboard mang phong cách hiện đại với hiệu ứng kính mờ, phù hợp cho các sự kiện sang trọng và cao cấp.
*   **Tương tác thả tim:** Khách mời có thể tương tác với các bức ảnh yêu thích, số lượng lượt yêu thích được đồng bộ hóa thời gian thực trên tất cả các thiết bị.
*   **Quản trị sự kiện (Live/Off):** Admin có thể dễ dàng kiểm soát trạng thái sự kiện, bật hoặc tắt quyền gửi ảnh của khách mời trực tiếp từ Dashboard.
*   **Bố cục Masonry thông minh:** Hình ảnh được sắp xếp tự động theo dạng lưới nghệ thuật, tối ưu hóa không gian hiển thị cho mọi kích thước màn hình.

---

## Công nghệ cốt lõi

*   **Framework:** Next.js 15 (App Router) & React 19.
*   **Backend:** Firebase (Firestore & Storage).
*   **Styling:** Modern CSS & Tailwind CSS v4.
*   **Tiện ích:** Masonic Layout, QR Code React.

---

## Hướng dẫn triển khai nhanh

1.  **Sao chép mã nguồn:**
    ```bash
    git clone https://github.com/your-username/event-snap.git
    cd event-snap
    ```

2.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    ```

3.  **Thiết lập cấu hình môi trường:**
    Tạo file `.env.local` tại thư mục gốc và cung cấp các thông số từ Firebase Console của bạn:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Khởi chạy môi trường phát triển:**
    ```bash
    npm run dev
    ```
    Truy cập ứng dụng tại đường dẫn [http://localhost:3000](http://localhost:3000).

---

## Tầm nhìn sản phẩm

SnapWall được xây dựng để thay đổi cách chúng ta lưu giữ kỷ niệm trong các sự kiện tập thể. Thay vì để những bức ảnh nằm lại trong điện thoại cá nhân, chúng tôi mang chúng lên "bức tường chung", nơi mọi người cùng chia sẻ niềm vui và cảm xúc ngay tại thời điểm nó diễn ra.

---

## Liên hệ và Đóng góp

Mọi ý tưởng đóng góp hoặc báo cáo lỗi vui lòng liên hệ qua các kênh thông tin chính thức của dự án.

---
*Developed by **I2FLabs** — Creating technology for beautiful memories.*
