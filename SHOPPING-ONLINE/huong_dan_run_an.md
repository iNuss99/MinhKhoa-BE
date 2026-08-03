# Hướng dẫn chạy dự án SHOPPING-ONLINE

Dự án bao gồm 3 phần chính:
- **Backend**: Thư mục `server` (chạy trên cổng 5000)
- **Frontend Admin**: Thư mục `client-admin` (chạy trên cổng 3001 - `http://localhost:3001/admin`)
- **Frontend Customer**: Thư mục `client-customer` (chạy trên cổng 3002 - `http://localhost:3002/`)

---

## ⚡ Cách 1: Chạy TẤT CẢ chỉ với 1 lệnh DUY NHẤT (Khuyên dùng)

Bạn chỉ cần mở **1 cửa sổ terminal** tại thư mục gốc `SHOPPING-ONLINE` và gõ:

```bash
npm start
```

Lệnh này sẽ tự động khởi động song song cả 3 dịch vụ: `server`, `client-admin`, và `client-customer` cùng lúc.

---

## 🛠️ Cách 2: Chạy riêng từng phần (3 terminal)

### 1. Chạy Backend (Server)
```bash
cd server
npm start
```
*(Server chạy tại `http://localhost:5000`)*

### 2. Chạy Frontend (Client Admin)
```bash
cd client-admin
npm start
```
*(Trang Admin chạy tại `http://localhost:3001/admin`)*

### 3. Chạy Frontend (Client Customer)
```bash
cd client-customer
npm start
```
*(Trang Customer chạy tại `http://localhost:3002/`)*

---

## ⚠️ Khắc phục lỗi thường gặp

Nếu bạn thấy thông báo lỗi **"Lỗi kết nối server: Request failed with status code 500"** hoặc `ECONNREFUSED`:
1. **Chưa chạy Server:** Đảm bảo `server` đã được khởi động và không bị dừng.
2. **Server bị treo hoặc lỗi kết nối DataBase:** Kiểm tra terminal xem có lỗi kết nối MongoDB không (ví dụ sai tài khoản/mật khẩu trong file cấu hình). Server phải báo kết nối database thành công thì mới nhận API từ frontend.
