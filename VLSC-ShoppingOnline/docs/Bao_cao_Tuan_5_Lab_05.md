# BÁO CÁO THỰC HÀNH TUẦN 5 - LAB 05
**Dự án:** MERN Stack - Shopping Online  
**Nội dung:** Phát triển các tính năng dành cho Khách hàng (Customer Frontend & Backend)

---

## 1. Mục tiêu công việc
- Xây dựng giao diện mua sắm dành cho Khách hàng (Customer Client).
- Xây dựng các API Backend phục vụ trang chủ khách hàng: Lấy danh mục, Sản phẩm mới (`NEW PRODUCTS`), Sản phẩm bán chạy (`HOT PRODUCTS`).
- Xây dựng tính năng lọc sản phẩm theo danh mục (`/product/category/:cid`), tìm kiếm theo từ khóa (`/product/search/:keyword`) và xem chi tiết sản phẩm (`/product/:id`).
- Xây dựng tiện ích `withRouter` hỗ trợ React Router v6 cho Class Components.

---

## 2. Kết quả thực hiện

### 2.1 Backend Server (`server/`)
- **[models/ProductDAO.js](file:///d:/SHOPPINGONLIE_2/server/models/ProductDAO.js)**:
  - `selectTopNew(top)`: Lấy 3 sản phẩm mới nhất sắp xếp giảm dần theo thời gian tạo `cdate: -1`.
  - `selectTopHot(top)`: Thống kê 3 sản phẩm bán chạy nhất bằng Mongoose Aggregation (`$match` các đơn hàng `APPROVED`, `$unwind` sản phẩm, `$group` tổng số lượng và `$sort` giảm dần).
  - `selectByCatID(_cid)`: Lấy danh sách sản phẩm theo mã danh mục `category._id`.
  - `selectByKeyword(keyword)`: Tìm kiếm sản phẩm theo tên chứa từ khóa (sử dụng Regex không phân biệt hoa thường `i`).
- **[api/customer.js](file:///d:/SHOPPINGONLIE_2/server/api/customer.js)**:
  - `GET /api/customer/categories`: Lấy toàn bộ danh mục.
  - `GET /api/customer/products/new`: Lấy 3 sản phẩm mới.
  - `GET /api/customer/products/hot`: Lấy 3 sản phẩm bán chạy.
  - `GET /api/customer/products/category/:cid`: Lọc sản phẩm theo danh mục.
  - `GET /api/customer/products/search/:keyword`: Tìm kiếm sản phẩm theo từ khóa.
  - `GET /api/customer/products/:id`: Lấy thông tin chi tiết một sản phẩm.

### 2.2 Client Customer (`client-customer/`)
- **[src/utils/withRouter.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/utils/withRouter.js)**: HOC chuyển đổi `useParams` và `useNavigate` cho các Class Component trong React Router v6.
- **[src/components/MenuComponent.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/components/MenuComponent.js)**: Thanh Menu động hiển thị danh mục (`IPAD`, `IPHONE`, `MACBOOK`) và thanh tìm kiếm sản phẩm.
- **[src/components/InformComponent.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/components/InformComponent.js)**: Thanh thông tin người dùng và tóm tắt số lượng sản phẩm trong giỏ hàng.
- **[src/components/HomeComponent.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/components/HomeComponent.js)**: Trang chủ khách hàng hiển thị 2 khối sản phẩm: **NEW PRODUCTS** và **HOT PRODUCTS**.
- **[src/components/ProductComponent.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/components/ProductComponent.js)**: Danh sách sản phẩm dạng lưới theo danh mục hoặc từ khóa tìm kiếm.
- **[src/components/ProductDetailComponent.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/components/ProductDetailComponent.js)**: Trang chi tiết sản phẩm gồm hình ảnh lớn, thông số và ô chọn số lượng (`Quantity`).
- **[src/components/MainComponent.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/components/MainComponent.js)** & **[src/App.js](file:///d:/SHOPPINGONLIE_2/client-customer/src/App.js)**: Thiết lập bộ tuyến đường (Routes) cho trang khách hàng.

---

## 3. Xác minh & Kiểm thử
1. **Trang chủ (`http://localhost:3002/`)**: Hiển thị đầy đủ Menu danh mục, khối NEW PRODUCTS (3 sản phẩm mới nhất) và khối HOT PRODUCTS (3 sản phẩm bán chạy từ đơn hàng đã duyệt).
2. **Lọc theo danh mục**: Click vào `IPHONE`, `IPAD` hoặc `MACBOOK` trên Menu, danh sách sản phẩm hiển thị đúng theo từng loại.
3. **Tìm kiếm**: Nhập từ khóa (ví dụ: `Pro`) và bấm **SEARCH**, hệ thống lọc chính xác các sản phẩm thỏa mãn từ khóa.
4. **Xem chi tiết**: Click vào sản phẩm bất kỳ, trang chi tiết hiển thị đầy đủ ID, Name, Price, Category, hình ảnh lớn và nút **ADD TO CART**.

---

## 4. Kết luận
Tuần 5 đã hoàn thành toàn bộ các tính năng dành cho Khách hàng phía Frontend & Backend theo đúng yêu cầu bài Lab 05.
