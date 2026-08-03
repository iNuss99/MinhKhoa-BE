# BÁO CÁO THỰC HÀNH TUẦN 4 - LAB 04
**Dự án:** MERN Stack - Shopping Online  
**Nội dung:** Quản lý Sản phẩm (Product CRUD & Pagination) dành cho Admin

---

## 1. Mục tiêu công việc
- Phát triển lớp truy xuất dữ liệu `ProductDAO` quản lý sản phẩm trên collection `products`.
- Xây dựng giải thuật phân trang (Pagination) phía Server (mỗi trang hiển thị 4 sản phẩm).
- Hỗ trợ tải tệp hình ảnh sản phẩm từ máy tính và chuyển đổi sang chuỗi mã hóa **Base64** để lưu trữ và hiển thị.
- Xây dựng giao diện xem và chỉnh sửa chi tiết sản phẩm phía Client Admin.

---

## 2. Kết quả thực hiện

### 2.1 Backend Server (`server/`)
- **[models/ProductDAO.js](file:///d:/SHOPPINGONLIE_2/server/models/ProductDAO.js)**:
  - `selectAll()`: Lấy danh sách toàn bộ sản phẩm.
  - `selectByID(_id)`: Lấy chi tiết sản phẩm theo `_id`.
  - `insert(product)`: Thêm sản phẩm mới kèm thời gian tạo `cdate` (milliseconds).
  - `update(product)`: Cập nhật tên, giá, hình ảnh base64 và danh mục.
  - `delete(_id)`: Xóa sản phẩm.
- **[api/admin.js](file:///d:/SHOPPINGONLIE_2/server/api/admin.js)**:
  - `GET /api/admin/products?page=x`: Phân trang với `sizePage = 4`, tính toán `noPages` và cắt dữ liệu bằng `slice()`.
  - `POST /api/admin/products`: Thêm sản phẩm mới.
  - `PUT /api/admin/products/:id`: Cập nhật sản phẩm.
  - `DELETE /api/admin/products/:id`: Xóa sản phẩm.

### 2.2 Client Admin (`client-admin/`)
- **[src/components/ProductComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/ProductComponent.js)**: 
  - Bảng danh sách sản phẩm gồm các cột: ID, Name, Price, Creation date, Category, Image.
  - Thanh phân trang `| 1 | 2 | 3 |` phía dưới bảng.
- **[src/components/ProductDetailComponent.js](file:///d:/SHOPPINGONLIE_2/client-admin/src/components/ProductDetailComponent.js)**:
  - Form nhập liệu sản phẩm, dropdown chọn Danh mục và chọn tệp ảnh (`<input type="file">`).
  - Đọc tệp ảnh bằng `FileReader` và hiển thị xem trước (Image Preview) bằng chuỗi Base64 `data:image/jpg;base64,...`.
  - Ẩn khung ảnh khi chưa chọn tệp hoặc chưa chọn sản phẩm nhằm tránh lỗi hiển thị khung ảnh vỡ.

---

## 3. Xác minh & Kiểm thử
1. **Phân trang**: Khi có 12 sản phẩm, hệ thống tự động chia thành 3 trang (mỗi trang 4 sản phẩm). Chuyển trang hoạt động mượt mà.
2. **Tải ảnh Base64**: Chọn tệp hình ảnh từ máy tính, ảnh tự động hiển thị xem trước và được lưu vào MongoDB dạng chuỗi Base64.
3. **Thao tác CRUD**: Thử nghiệm các nút **ADD NEW**, **UPDATE**, **DELETE** đều hoạt động chính xác và tự động cập nhật lại bảng dữ liệu.

---

## 4. Kết luận
Tuần 4 đã hoàn thành trọn vẹn mô-đun quản lý sản phẩm, phân trang và xử lý hình ảnh Base64 phía Admin theo đúng yêu cầu bài Lab 04.
