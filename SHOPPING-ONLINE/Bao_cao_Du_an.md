# Báo Cáo Kết Quả Thực Hiện Dự Án SHOPPING-ONLINE (MERN Stack)

## 1. Giới thiệu
Dự án **SHOPPING-ONLINE** được xây dựng dựa trên ngăn xếp công nghệ **MERN** (MongoDB, Express, React, Node.js).
Hệ thống bao gồm hai phần chính:
- **Backend (Server):** Xử lý logic nghiệp vụ, giao tiếp với cơ sở dữ liệu MongoDB và cung cấp các RESTful APIs.
- **Frontend (Client-Admin):** Giao diện quản trị viên (Admin) được xây dựng bằng React để quản lý các thực thể trong hệ thống.

## 2. Những công việc đã hoàn thành

Trong quá trình thực hiện dự án (đặc biệt là ở học phần Lab 04 - Quản lý Sản Phẩm), em đã áp dụng và hoàn thiện các chức năng sau:

### 2.1. Backend (Node.js + Express + MongoDB)
- **Thiết kế Model & DAO (Data Access Object):**
  - Xây dựng Schema cho các thực thể: `Admin`, `Category`, `Product`, `Customer`, `Order`.
  - Khởi tạo file `ProductDAO.js` để thực hiện các thao tác CRUD cơ bản với Collection `products` trong MongoDB:
    - `selectAll()`: Lấy danh sách sản phẩm.
    - `insert(product)`: Thêm mới sản phẩm.
    - `update(product)`: Cập nhật thông tin sản phẩm.
    - `delete(_id)`: Xóa sản phẩm.
  - Cập nhật `CategoryDAO.js` thêm hàm `selectByID` để hỗ trợ việc lấy chi tiết category khi map với product.

- **Xây dựng RESTful API (`server/api/admin.js`):**
  - Xây dựng các endpoint để Frontend gọi đến:
    - `GET /api/admin/products?page=xxx`: Lấy danh sách sản phẩm có xử lý phân trang (pagination) trực tiếp ở phía server.
    - `POST /api/admin/products`: Thêm sản phẩm mới kèm hình ảnh (chuỗi base64) và liên kết Category.
    - `PUT /api/admin/products/:id`: Chỉnh sửa thông tin sản phẩm.
    - `DELETE /api/admin/products/:id`: Xóa sản phẩm.
  - Tích hợp Middleware `JwtUtil.checkToken` để bảo mật API, đảm bảo chỉ Admin đã đăng nhập mới có quyền gọi API.

### 2.2. Frontend (React)
- **Tích hợp Routing & Layout:**
  - Cấu hình `react-router-dom` trong `MainComponent.js` để điều hướng các trang Admin.
  - Cập nhật `MenuComponent.js` để điều hướng mượt mà giữa các mục Home, Category, và Product.

- **Chức năng Quản lý Sản phẩm (`ProductComponent.js`):**
  - Hiển thị danh sách sản phẩm dưới dạng bảng (Data Table) lấy từ API.
  - Xây dựng thanh phân trang (Pagination) dựa trên số lượng trang (`noPages`) trả về từ Server.
  - Xử lý sự kiện click vào từng dòng (row) để hiển thị chi tiết sản phẩm sang Form kế bên.

- **Chức năng Chi tiết Sản phẩm (`ProductDetailComponent.js`):**
  - Thiết kế Form bao gồm các trường: ID, Name, Price, Category, và Image.
  - Xử lý Image Preview: Chuyển đổi file ảnh được chọn bằng `FileReader` sang định dạng `base64` để hiển thị preview ngay lập tức trên UI và gửi lên Server.
  - Gắn các sự kiện (Event handlers) cho các nút hành động:
    - `btnAddClick`: Validate form và gọi API `POST`.
    - `btnUpdateClick`: Validate form và gọi API `PUT`.
    - `btnDeleteClick`: Hiển thị `window.confirm` xác nhận trước khi gọi API `DELETE`.
  - Xử lý tự động load lại danh sách sản phẩm (`updateProducts`) sau khi Thêm/Sửa/Xóa thành công.

### 2.3. Customer Functionalities (Lab 05)
- **Backend APIs (`server/api/customer.js` & `ProductDAO.js`):**
  - Bổ sung các phương thức truy xuất dữ liệu trong `ProductDAO.js`:
    - `selectTopNew(top)`: Lấy danh sách sản phẩm mới nhất (sắp xếp giảm dần theo `cdate`).
    - `selectTopHot(top)`: Lấy danh sách sản phẩm bán chạy nhất dựa trên tổng số lượng đặt hàng (`Order.aggregate` với trạng thái `APPROVED`).
    - `selectByCatID(_cid)`: Lấy danh sách sản phẩm thuộc danh mục chỉ định.
    - `selectByKeyword(keyword)`: Tìm kiếm sản phẩm theo từ khóa (sử dụng `$regex` không phân biệt hoa thường).
    - `selectByID(_id)`: Lấy chi tiết sản phẩm theo ID.
  - Xây dựng các RESTful endpoints cho phía Khách hàng:
    - `GET /api/customer/categories`: Lấy danh sách danh mục sản phẩm.
    - `GET /api/customer/products/new`: Lấy top 3 sản phẩm mới nhất.
    - `GET /api/customer/products/hot`: Lấy top 3 sản phẩm HOT nhất.
    - `GET /api/customer/products/category/:cid`: Lấy sản phẩm theo danh mục.
    - `GET /api/customer/products/search/:keyword`: Tìm kiếm sản phẩm theo từ khóa.
    - `GET /api/customer/products/:id`: Lấy thông tin chi tiết của sản phẩm.

- **Frontend Customer (`client-customer`):**
  - **Tích hợp HOC `withRouter` (`src/utils/withRouter.js`):** Hỗ trợ Class Components lấy `params` từ `useParams()` và điều hướng bằng `useNavigate()` của React Router v6/v7.
  - **Menu Navigation (`MenuComponent.js`):** Hiển thị thanh menu chứa liên kết Trang chủ (`Home`), động danh sách các danh mục sản phẩm lấy từ API, và ô tìm kiếm sản phẩm.
  - **Thông tin Khách hàng (`InformComponent.js`):** Thanh thông tin hiển thị các liên kết Login, Sign-up, Active và giỏ hàng.
  - **Trang chủ (`HomeComponent.js`):** Tự động tải và hiển thị 2 khối sản phẩm: **NEW PRODUCTS** và **HOT PRODUCTS** kèm hình ảnh, tên và giá bán.
  - **Trang danh sách & Tìm kiếm Sản phẩm (`ProductComponent.js`):**
    - Lắng nghe sự thay đổi của `cid` (danh mục) và `keyword` (từ khóa tìm kiếm) thông qua `componentDidMount` và `componentDidUpdate` để tự động cập nhật danh sách sản phẩm.
  - **Trang chi tiết sản phẩm (`ProductDetailComponent.js`):** Hiển thị chi tiết thông tin sản phẩm, hình ảnh kích thước lớn, thông tin danh mục, chọn số lượng và nút "ADD TO CART".
  - **Cấu hình Routing (`MainComponent.js` & `App.js`):** Thiết lập `<BrowserRouter>` và định tuyến cho tất cả các đường dẫn `/home`, `/product/category/:cid`, `/product/search/:keyword`, và `/product/:id`.

## 3. Những kiến thức đã hiểu và áp dụng
- **Kiến trúc MVC & API:** Hiểu rõ cách tách biệt giữa Router (Controller), DAO (Model) và việc trả về dữ liệu định dạng JSON.
- **Tương tác Database qua Mongoose:** Biết cách sử dụng `Mongoose` để định nghĩa Schema, tham chiếu object (giữa Product và Category), thực hiện aggregate pipeline cho thống kê sản phẩm HOT, và query tìm kiếm regex dùng `async/await`.
- **Quản lý State và Lifecycle trong React:**
  - Áp dụng `this.state` để lưu trữ dữ liệu nội bộ của Component.
  - Dùng `componentDidMount` để tự động gọi API lấy dữ liệu ngay khi component vừa render lần đầu.
  - Dùng `componentDidUpdate` để phản ứng với thay đổi của `props` (khi chuyển đổi danh mục hoặc tìm kiếm từ khóa mới).
- **Giao tiếp Client-Server (Axios):** Sử dụng thư viện `axios` để gửi các HTTP Request (GET, POST, PUT, DELETE) kết nối giữa Frontend và Backend.
- **Xử lý Routing & HOC trong React Router:** Sử dụng Higher-Order Component (`withRouter`) để làm mịn khả năng điều hướng và nhận params trong React Router cho Class Components.

## 4. Tổng kết
Thông qua việc hoàn thiện **Lab 04 (Quản lý Sản phẩm Admin)** và **Lab 05 (Trang Khách hàng Customer)**, dự án SHOPPING-ONLINE đã hoàn chỉnh hai luồng trải nghiệm chính: Quản trị viên và Khách hàng mua sắm. Toàn bộ kiến trúc backend (Express, MongoDB, Mongoose DAO) và frontend (React Components, Routing, Axios) đã được xây dựng và kết nối đồng bộ.
