# BÁO CÁO THỰC HÀNH TUẦN 1 - LAB 01
**Dự án:** MERN Stack - Shopping Online  
**Nội dung:** Khởi tạo cấu trúc dự án và thiết lập môi trường

---

## 1. Mục tiêu công việc
- Chuẩn bị môi trường phát triển cho ứng dụng Shopping Online 3 tầng: `server` (Backend Express), `client-admin` (Frontend Admin React), `client-customer` (Frontend Customer React).
- Cấu hình kết nối cơ sở dữ liệu MongoDB Atlas và dịch vụ Microsoft Mail (Hotmail/Nodemailer).
- Thiết lập Proxy và Homepage cho các ứng dụng React.

---

## 2. Kết quả thực hiện

### 2.1 Cấu trúc dự án
Dự án được khởi tạo tại thư mục gốc [d:\SHOPPINGONLIE_2](file:///d:/SHOPPINGONLIE_2):
```text
d:\SHOPPINGONLIE_2\
├── PDF/
├── docs/
├── server/
├── client-admin/
└── client-customer/
```

### 2.2 Chi tiết các thành phần

#### A. Backend Server (`server/`)
- **[package.json](file:///d:/SHOPPINGONLIE_2/server/package.json)**: Đã cấu hình các thư viện cốt lõi `express`, `body-parser`, `mongoose`, `jsonwebtoken`, `nodemailer`.
- **[index.js](file:///d:/SHOPPINGONLIE_2/server/index.js)**: Khởi tạo Server Express lắng nghe tại cổng `3000`, cấu hình middleware `body-parser` với hạn mức `10mb` cho JSON và URL-encoded.
- **Route thử nghiệm**: API `GET /hello` trả về JSON `{"message": "Hello from server!"}`.

#### B. Client Admin (`client-admin/`)
- **[package.json](file:///d:/SHOPPINGONLIE_2/client-admin/package.json)**: Khai báo `"homepage": "/admin"` và `"proxy": "http://localhost:3000"`.
- Chạy thử nghiệm kết nối API tới server tại địa chỉ `http://localhost:3001/admin`.

#### C. Client Customer (`client-customer/`)
- **[package.json](file:///d:/SHOPPINGONLIE_2/client-customer/package.json)**: Khai báo `"homepage": "/"` và `"proxy": "http://localhost:3000"`.
- Chạy thử nghiệm kết nối API tới server tại địa chỉ `http://localhost:3002/`.

---

## 3. Xác minh & Kiểm thử
1. `npm install` hoàn tất không phát sinh lỗi tại cả 3 thư mục `server`, `client-admin`, `client-customer`.
2. Kiểm tra API `http://localhost:3000/hello` trả về kết quả chính xác từ server.

---

## 4. Kết luận
Tuần 1 đã hoàn thành toàn bộ mục tiêu thiết lập nền tảng dự án theo đúng yêu cầu bài Lab 01.
