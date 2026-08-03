# BÁO CÁO THỰC HÀNH TUẦN 3 - LAB 03
**Dự án:** MERN Stack - Shopping Online  
**Nội dung:** Quản lý Danh mục Sản phẩm (Category CRUD) dành cho Admin

---

## 1. Mục tiêu công việc
- Xây dựng lớp truy xuất dữ liệu `CategoryDAO` thực hiện các thao tác CRUD trên collection `categories`.
- Xây dựng các API RESTful phía Backend phục vụ quản lý danh mục (Xem danh sách, Thêm mới, Cập nhật, Xóa).
- Xây dựng giao diện tương tác phía Client Admin cho phép thao tác trực tiếp trên bảng dữ liệu.

---

## 2. Kết quả thực hiện

### 2.1 Backend Server (`server/`)
- **[models/CategoryDAO.js](file:///d:/SHOPPINGONLIE_2/server/models/CategoryDAO.js)**:
  - `selectAll()`: Lấy toàn bộ danh mục từ Mongoose model `Category`.
  - `insert(category)`: Tạo mã `ObjectId` mới và thêm danh mục.
  - `update(category)`: Cập nhật tên danh mục theo `_id`.
  - `delete(_id)`: Xóa danh mục theo `_id`.
  - `selectByID(_id)`: Tìm kiếm danh mục theo `_id`.
- **[api/admin.js](file:///d:/SHOPPINGONLIE_2/server/api/admin.js)**:
  - `GET /api/admin/categories`: Yêu cầu JWT token, trả về danh sách danh mục.
  - `POST /api/admin/categories`: Yêu cầu JWT token, thêm danh mục mới.
  - `PUT /api/admin/categories/:id`: Yêu cầu JWT token, cập nhật danh mục.
  - `DELETE /api/admin/categories/:id`: Yêu cầu JWT token, xóa danh mục.

### 2.2 Client Admin (`client-admin/`)
- **[src/components/CategoryComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/CategoryComponent.js)**: Hiển thị bảng danh sách danh mục (CATEGORY LIST) phía bên trái. Khi click vào 1 dòng trong bảng, truyền item được chọn sang component con.
- **[src/components/CategoryDetailComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/CategoryDetailComponent.js)**: Hiển thị chi tiết danh mục (CATEGORY DETAIL) phía bên phải gồm các ô nhập liệu và 3 nút chức năng **ADD NEW**, **UPDATE**, **DELETE**.

---

## 3. Xác minh & Kiểm thử
1. **Xem danh sách**: Bảng hiển thị các danh mục hiện có (iPad, iPhone, MacBook).
2. **Thêm mới**: Nhập tên danh mục mới và bấm **ADD NEW**, danh sách tự động cập nhật và thông báo `"OK BABY!"`.
3. **Cập nhật**: Chọn 1 danh mục, sửa tên và bấm **UPDATE**, tên danh mục được cập nhật thành công.
4. **Xóa**: Bấm **DELETE**, hiển thị hộp thoại xác nhận `"ARE YOU SURE?"`, sau khi đồng ý danh mục được xóa khỏi hệ thống.

---

## 4. Kết luận
Tuần 3 đã hoàn thành trọn vẹn mô-đun quản lý danh mục sản phẩm (Category CRUD) phía Admin theo đúng yêu cầu bài Lab 03.
