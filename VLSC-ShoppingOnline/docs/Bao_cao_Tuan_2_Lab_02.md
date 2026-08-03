# BÁO CÁO THỰC HÀNH TUẦN 2 - LAB 02
**Dự án:** MERN Stack - Shopping Online  
**Nội dung:** Xây dựng Mongoose Models, Utilities & Đăng nhập Admin với JWT

---

## 1. Mục tiêu công việc
- Thiết lập Mongoose Schemas & Models cho toàn bộ hệ thống (`Admin`, `Category`, `Customer`, `Product`, `Item`, `Order`).
- Xây dựng các lớp Tiện ích (Utils): `MyConstants`, `MongooseUtil`, `CryptoUtil`, `EmailUtil`, `JwtUtil`.
- Xây dựng chức năng Đăng nhập / Đăng xuất Admin bảo mật bằng JSON Web Token (JWT).
- Thiết lập React Context (`MyContext`, `MyProvider`) quản lý trạng thái đăng nhập phía Admin Client.

---

## 2. Kết quả thực hiện

### 2.1 Backend (`server/`)
- **[models/Models.js](file:///d:/SHOPPINGONLIE_2/server/models/Models.js)**: Định nghĩa Mongoose Schemas với `versionKey: false` và xuất các Models `Admin`, `Category`, `Customer`, `Product`, `Order`.
- **[utils/MyConstants.js](file:///d:/SHOPPINGONLIE_2/server/utils/MyConstants.js)**: Lưu trữ hằng số cấu hình MongoDB Atlas, Email, JWT Secret (`jwt_secret`) và thời gian hết hạn (`JWT_EXPIRES: '86400000'`).
- **[utils/MongooseUtil.js](file:///d:/SHOPPINGONLIE_2/server/utils/MongooseUtil.js)**: Kết nối CSDL MongoDB Atlas qua `mongoose.connect()`.
- **[utils/CryptoUtil.js](file:///d:/SHOPPINGONLIE_2/server/utils/CryptoUtil.js)**: Hỗ trợ mã hóa MD5.
- **[utils/EmailUtil.js](file:///d:/SHOPPINGONLIE_2/server/utils/EmailUtil.js)**: Dịch vụ gửi Email kích hoạt tài khoản qua Nodemailer (`hotmail`).
- **[utils/JwtUtil.js](file:///d:/SHOPPINGONLIE_2/server/utils/JwtUtil.js)**: Tạo token `genToken()` và Middleware `checkToken()` xác thực header `x-access-token`.
- **[models/AdminDAO.js](file:///d:/SHOPPINGONLIE_2/server/models/AdminDAO.js)**: Phương thức `selectByUsernameAndPassword()`.
- **[api/admin.js](file:///d:/SHOPPINGONLIE_2/server/api/admin.js)**:
  - `POST /api/admin/login`: Xác thực tài khoản và cấp JWT Token.
  - `GET /api/admin/token`: Kiểm tra tính hợp lệ của token.

### 2.2 Client Admin (`client-admin/`)
- **[src/App.css](file:///d:/SHOPPINGONLIE_2/client-admin/src/App.css)**: Định nghĩa stylesheet dùng chung (`.body-admin`, `.align-valign-center`, `.datatable`, `.menu`).
- **[src/contexts/MyContext.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/contexts/MyContext.js)** & **[src/contexts/MyProvider.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/contexts/MyProvider.js)**: Quản lý trạng thái toàn cục `token`, `username`.
- **[src/components/LoginComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/LoginComponent.js)**: Giao diện form đăng nhập Admin căn giữa màn hình.
- **[src/components/MenuComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/MenuComponent.js)**: Thanh điều hướng Admin & nút Đăng xuất.
- **[src/components/HomeComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/HomeComponent.js)**: Trang chủ chào mừng Admin.
- **[src/components/MainComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/MainComponent.js)** & **[src/App.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/App.js)**: Điều phối luồng màn hình dựa trên token đăng nhập.

---

## 3. Xác minh & Kiểm thử
1. Đăng nhập thành công với tài khoản Admin mặc định (`admin` / `123`), Server trả về JWT token hợp lệ.
2. Khi người dùng chưa đăng nhập, giao diện chỉ hiển thị Form Đăng nhập Admin. Khi đăng nhập thành công, tự động chuyển sang trang Home Admin.

---

## 4. Kết luận
Tuần 2 đã hoàn thành toàn bộ cấu trúc dữ liệu cơ bản và cơ chế xác thực Admin bằng JWT theo đúng yêu cầu bài Lab 02.
