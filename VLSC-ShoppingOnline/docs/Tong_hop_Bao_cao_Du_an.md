# TỔNG HỢP BÁO CÁO DỰ ÁN MERN STACK - SHOPPING ONLINE
**Dự án:** Shopping Online (Tài liệu hướng dẫn Lab 01 - Lab 05)  
**Thư mục báo cáo:** `docs/`

---

## Danh sách Báo cáo theo tuần

| Tuần thực hiện | Nội dung thực hành | File báo cáo chi tiết | Trang ứng dụng |
| :--- | :--- | :--- | :--- |
| **Tuần 1** | Cấu trúc dự án & Chuẩn bị môi trường (Lab 01) | [Bao_cao_Tuan_1_Lab_01.md](file:///d:/SHOPPINGONLIE_2/docs/Bao_cao_Tuan_1_Lab_01.md) | Môi trường Express & React |
| **Tuần 2** | Models, Utils & Đăng nhập Admin JWT (Lab 02) | [Bao_cao_Tuan_2_Lab_02.md](file:///d:/SHOPPINGONLIE_2/docs/Bao_cao_Tuan_2_Lab_02.md) | Admin Login (`localhost:3001/admin`) |
| **Tuần 3** | Quản lý Danh mục Category CRUD (Lab 03) | [Bao_cao_Tuan_3_Lab_03.md](file:///d:/SHOPPINGONLIE_2/docs/Bao_cao_Tuan_3_Lab_03.md) | Admin Category (`localhost:3001/admin/category`) |
| **Tuần 4** | Quản lý Sản phẩm Product CRUD & Phân trang (Lab 04) | [Bao_cao_Tuan_4_Lab_04.md](file:///d:/SHOPPINGONLIE_2/docs/Bao_cao_Tuan_4_Lab_04.md) | Admin Product (`localhost:3001/admin/product`) |
| **Tuần 5** | Tính năng Khách hàng Customer Home, Search, Details (Lab 05) | [Bao_cao_Tuan_5_Lab_05.md](file:///d:/SHOPPINGONLIE_2/docs/Bao_cao_Tuan_5_Lab_05.md) | Customer Web (`localhost:3002/`) |

---

## Tóm tắt hệ thống

1. **Backend Server (`server/`)**: Cổng 3000, kết nối CSDL MongoDB Atlas (`shoppingonline`), xác thực bảo mật qua JWT, mã hóa MD5.
2. **Client Admin (`client-admin/`)**: Cổng 3001 (`homepage: "/admin"`), quản lý đăng nhập Admin, quản lý danh mục và sản phẩm kèm phân trang và upload ảnh xem trước.
3. **Client Customer (`client-customer/`)**: Cổng 3002 (`homepage: "/"`), mua sắm dành cho khách hàng, xem sản phẩm mới/nóng, lọc theo danh mục, tìm kiếm và xem chi tiết sản phẩm.
