# TỔNG HỢP BÁO CÁO THỰC HÀNH - MERN STACK SHOPPING ONLINE
**Dự án:** MERN Stack - Shopping Online  
**Thời gian:** Tuần 1 - Tuần 5 (Lab 01 - Lab 05)  
**Mục tiêu:** Xây dựng ứng dụng mua sắm trực tuyến 3 tầng (Backend Express, Frontend Admin React, Frontend Customer React)

---

## MỤC LỤC
1. [Tuần 1 - Lab 01: Khởi tạo cấu trúc dự án](#tuần-1---lab-01-khởi-tạo-cấu-trúc-dự-án)
2. [Tuần 2 - Lab 02: Mongoose Models & Đăng nhập Admin](#tuần-2---lab-02-mongoose-models--đăng-nhập-admin)
3. [Tuần 3 - Lab 03: Quản lý Danh mục (Category CRUD)](#tuần-3---lab-03-quản-lý-danh-mục-category-crud)
4. [Tuần 4 - Lab 04: Quản lý Sản phẩm (Product CRUD & Pagination)](#tuần-4---lab-04-quản-lý-sản-phẩm-product-crud--pagination)
5. [Tuần 5 - Lab 05: Phát triển Customer Frontend & Backend](#tuần-5---lab-05-phát-triển-customer-frontend--backend)
6. [Tóm tắt toàn bộ dự án](#tóm-tắt-toàn-bộ-dự-án)

---

# TUẦN 1 - LAB 01: KHỞI TẠO CẤU TRÚC DỰ ÁN

## 1.1 Mục tiêu công việc
- Chuẩn bị môi trường phát triển cho ứng dụng Shopping Online 3 tầng
- Cấu hình kết nối cơ sở dữ liệu MongoDB Atlas
- Cấu hình dịch vụ Microsoft Mail (Hotmail/Nodemailer)
- Thiết lập Proxy và Homepage cho các ứng dụng React

## 1.2 Cấu trúc dự án
Dự án được khởi tạo tại thư mục gốc `d:\SHOPPINGONLIE_2`:
```
d:\SHOPPINGONLIE_2\
├── PDF/
├── docs/
├── server/
├── client-admin/
└── client-customer/
```

## 1.3 Chi tiết các thành phần

### A. Backend Server (`server/`)
- **package.json**: Cấu hình các thư viện cốt lõi
  - `express`: Framework web server
  - `body-parser`: Middleware xử lý JSON
  - `mongoose`: ODM cho MongoDB
  - `jsonwebtoken`: Tạo và xác thực JWT
  - `nodemailer`: Gửi email

- **index.js**: 
  - Khởi tạo Server Express lắng nghe tại cổng `3000`
  - Cấu hình middleware `body-parser` với hạn mức `10mb` cho JSON và URL-encoded
  - Route thử nghiệm: API `GET /hello` trả về `{"message": "Hello from server!"}`

### B. Client Admin (`client-admin/`)
- **package.json**:
  - Khai báo `"homepage": "/admin"`
  - Khai báo `"proxy": "http://localhost:3000"`
  - Chạy tại cổng `3001`

### C. Client Customer (`client-customer/`)
- **package.json**:
  - Khai báo `"homepage": "/"`
  - Khai báo `"proxy": "http://localhost:3000"`
  - Chạy tại cổng `3002`

## 1.4 Xác minh & Kiểm thử
✓ `npm install` hoàn tất không phát sinh lỗi tại cả 3 thư mục  
✓ Kiểm tra API `http://localhost:3000/hello` trả về kết quả chính xác

## 1.5 Kết luận
Tuần 1 đã hoàn thành toàn bộ mục tiêu thiết lập nền tảng dự án theo đúng yêu cầu bài Lab 01.

---

# TUẦN 2 - LAB 02: MONGOOSE MODELS & ĐĂNG NHẬP ADMIN

## 2.1 Mục tiêu công việc
- Thiết lập Mongoose Schemas & Models cho toàn bộ hệ thống
- Xây dựng các lớp Tiện ích (Utils)
- Xây dựng chức năng Đăng nhập / Đăng xuất Admin bằng JWT
- Thiết lập React Context quản lý trạng thái đăng nhập

## 2.2 Kết quả thực hiện Backend

### 2.2.1 Mongoose Models & DAO
- **models/Models.js**:
  - Định nghĩa Mongoose Schemas với `versionKey: false`
  - Các Collections: `Admin`, `Category`, `Customer`, `Product`, `Order`

- **models/AdminDAO.js**:
  - `selectByUsernameAndPassword()`: Xác thực tài khoản Admin

### 2.2.2 Utilities

- **utils/MyConstants.js**:
  - Lưu trữ hằng số cấu hình:
    - MongoDB Atlas connection string
    - Email configuration
    - JWT Secret: `jwt_secret`
    - JWT Expires: `'86400000'` (24 giờ)

- **utils/MongooseUtil.js**:
  - Kết nối CSDL MongoDB Atlas qua `mongoose.connect()`

- **utils/CryptoUtil.js**:
  - Hỗ trợ mã hóa MD5 cho mật khẩu

- **utils/EmailUtil.js**:
  - Dịch vụ gửi Email kích hoạt tài khoản
  - Cấu hình Nodemailer cho Hotmail

- **utils/JwtUtil.js**:
  - `genToken()`: Tạo JWT token
  - `checkToken()`: Middleware xác thực header `x-access-token`

### 2.2.3 Admin APIs

- **api/admin.js**:
  - `POST /api/admin/login`: Xác thực tài khoản và cấp JWT Token
  - `GET /api/admin/token`: Kiểm tra tính hợp lệ của token

## 2.3 Kết quả thực hiện Frontend Admin

### 2.3.1 Context & State Management

- **src/contexts/MyContext.js**:
  - Định nghĩa Context cho trạng thái toàn cục

- **src/contexts/MyProvider.js**:
  - Quản lý trạng thái: `token`, `username`
  - Cung cấp dữ liệu cho tất cả components

### 2.3.2 Components

- **src/components/LoginComponent.js**:
  - Giao diện form đăng nhập Admin
  - Căn giữa màn hình
  - Xác thực tài khoản thông qua API Backend

- **src/components/MenuComponent.js**:
  - Thanh điều hướng Admin
  - Nút Đăng xuất

- **src/components/HomeComponent.js**:
  - Trang chủ chào mừng Admin

- **src/components/MainComponent.js** & **src/App.js**:
  - Điều phối luồng màn hình dựa trên token đăng nhập
  - Hiển thị LoginComponent nếu chưa đăng nhập
  - Hiển thị MainComponent nếu đã đăng nhập

### 2.3.3 Styling

- **src/App.css**:
  - `.body-admin`: Style chính cho trang Admin
  - `.align-valign-center`: Căn giữa nội dung
  - `.datatable`: Style cho bảng dữ liệu
  - `.menu`: Style cho menu điều hướng

## 2.4 Xác minh & Kiểm thử
✓ Đăng nhập thành công với tài khoản Admin mặc định (`admin` / `123`)  
✓ Server trả về JWT token hợp lệ  
✓ Khi chưa đăng nhập, hiển thị Form Đăng nhập  
✓ Khi đăng nhập thành công, tự động chuyển sang trang Home Admin

## 2.5 Kết luận
Tuần 2 đã hoàn thành toàn bộ cấu trúc dữ liệu cơ bản và cơ chế xác thực Admin bằng JWT.

---

# TUẦN 3 - LAB 03: QUẢN LÝ DANH MỤC (CATEGORY CRUD)

## 3.1 Mục tiêu công việc
- Xây dựng lớp truy xuất dữ liệu `CategoryDAO`
- Thực hiện các thao tác CRUD trên collection `categories`
- Xây dựng các API RESTful phía Backend
- Xây dựng giao diện tương tác phía Client Admin

## 3.2 Kết quả thực hiện Backend

### 3.2.1 CategoryDAO

- **models/CategoryDAO.js**:
  - `selectAll()`: Lấy toàn bộ danh mục từ Mongoose model `Category`
  - `insert(category)`: Tạo mã `ObjectId` mới và thêm danh mục
  - `update(category)`: Cập nhật tên danh mục theo `_id`
  - `delete(_id)`: Xóa danh mục theo `_id`
  - `selectByID(_id)`: Tìm kiếm danh mục theo `_id`

### 3.2.2 Category APIs

- **api/admin.js**:
  - `GET /api/admin/categories`: 
    - Yêu cầu JWT token xác thực
    - Trả về danh sách danh mục
  
  - `POST /api/admin/categories`:
    - Yêu cầu JWT token xác thực
    - Thêm danh mục mới
  
  - `PUT /api/admin/categories/:id`:
    - Yêu cầu JWT token xác thực
    - Cập nhật danh mục
  
  - `DELETE /api/admin/categories/:id`:
    - Yêu cầu JWT token xác thực
    - Xóa danh mục

## 3.3 Kết quả thực hiện Frontend Admin

### 3.3.1 Components

- **src/components/CategoryComponent.js**:
  - Hiển thị bảng danh sách danh mục (CATEGORY LIST) phía bên trái
  - Khi click vào 1 dòng, truyền item được chọn sang component con

- **src/components/CategoryDetailComponent.js**:
  - Hiển thị chi tiết danh mục (CATEGORY DETAIL) phía bên phải
  - Gồm các ô nhập liệu
  - 3 nút chức năng: **ADD NEW**, **UPDATE**, **DELETE**

## 3.4 Xác minh & Kiểm thử
✓ **Xem danh sách**: Bảng hiển thị các danh mục (iPad, iPhone, MacBook)  
✓ **Thêm mới**: Nhập tên danh mục mới, bấm ADD NEW, thông báo `"OK BABY!"`  
✓ **Cập nhật**: Chọn danh mục, sửa tên, bấm UPDATE - tên được cập nhật  
✓ **Xóa**: Bấm DELETE, hiển thị hộp thoại `"ARE YOU SURE?"`, xóa thành công

## 3.5 Kết luận
Tuần 3 đã hoàn thành trọn vẹn mô-đun quản lý danh mục sản phẩm (Category CRUD).

---

# TUẦN 4 - LAB 04: QUẢN LÝ SẢN PHẨM (PRODUCT CRUD & PAGINATION)

## 4.1 Mục tiêu công việc
- Phát triển lớp truy xuất dữ liệu `ProductDAO`
- Xây dựng giải thuật phân trang (Pagination)
- Hỗ trợ tải tệp hình ảnh và chuyển đổi sang Base64
- Xây dựng giao diện xem và chỉnh sửa chi tiết sản phẩm

## 4.2 Kết quả thực hiện Backend

### 4.2.1 ProductDAO

- **models/ProductDAO.js**:
  - `selectAll()`: Lấy danh sách toàn bộ sản phẩm
  - `selectByID(_id)`: Lấy chi tiết sản phẩm theo `_id`
  - `insert(product)`: 
    - Thêm sản phẩm mới
    - Kèm thời gian tạo `cdate` (milliseconds)
  - `update(product)`: 
    - Cập nhật tên, giá, hình ảnh base64 và danh mục
  - `delete(_id)`: Xóa sản phẩm

### 4.2.2 Product APIs

- **api/admin.js**:
  - `GET /api/admin/products?page=x`:
    - Phân trang với `sizePage = 4` (4 sản phẩm/trang)
    - Tính toán `noPages` (số trang)
    - Cắt dữ liệu bằng `slice()`
  
  - `POST /api/admin/products`:
    - Thêm sản phẩm mới
  
  - `PUT /api/admin/products/:id`:
    - Cập nhật sản phẩm
  
  - `DELETE /api/admin/products/:id`:
    - Xóa sản phẩm

## 4.3 Kết quả thực hiện Frontend Admin

### 4.3.1 Components

- **src/components/ProductComponent.js**:
  - Bảng danh sách sản phẩm với các cột:
    - ID
    - Name
    - Price
    - Creation date
    - Category
    - Image
  - Thanh phân trang: `| 1 | 2 | 3 |` phía dưới bảng

- **src/components/ProductDetailComponent.js**:
  - Form nhập liệu sản phẩm
  - Dropdown chọn Danh mục
  - Chọn tệp ảnh (`<input type="file">`)
  - Đọc tệp ảnh bằng `FileReader`
  - Hiển thị xem trước (Image Preview) bằng chuỗi Base64
  - Format: `data:image/jpg;base64,...`
  - Ẩn khung ảnh khi chưa chọn tệp để tránh lỗi hiển thị

## 4.4 Xác minh & Kiểm thử
✓ **Phân trang**: 12 sản phẩm chia thành 3 trang (4 sản phẩm/trang)  
✓ **Tải ảnh Base64**: Ảnh tự động hiển thị xem trước và được lưu vào MongoDB  
✓ **Thao tác CRUD**: ADD NEW, UPDATE, DELETE đều hoạt động chính xác

## 4.5 Kết luận
Tuần 4 đã hoàn thành trọn vẹn mô-đun quản lý sản phẩm, phân trang và xử lý hình ảnh Base64.

---

# TUẦN 5 - LAB 05: PHÁT TRIỂN CUSTOMER FRONTEND & BACKEND

## 5.1 Mục tiêu công việc
- Xây dựng giao diện mua sắm dành cho Khách hàng
- Xây dựng các API Backend phục vụ trang chủ khách hàng
- Xây dựng tính năng lọc sản phẩm theo danh mục
- Xây dựng tìm kiếm theo từ khóa
- Xây dựng tiện ích `withRouter` cho React Router v6

## 5.2 Kết quả thực hiện Backend

### 5.2.1 ProductDAO mở rộng

- **models/ProductDAO.js**:
  - `selectTopNew(top)`:
    - Lấy 3 sản phẩm mới nhất
    - Sắp xếp giảm dần theo `cdate: -1`
  
  - `selectTopHot(top)`:
    - Thống kê 3 sản phẩm bán chạy nhất
    - Sử dụng Mongoose Aggregation:
      - `$match`: Lọc đơn hàng `APPROVED`
      - `$unwind`: Giải nén sản phẩm
      - `$group`: Tổng số lượng bán
      - `$sort`: Sắp xếp giảm dần
  
  - `selectByCatID(_cid)`:
    - Lấy danh sách sản phẩm theo mã danh mục
  
  - `selectByKeyword(keyword)`:
    - Tìm kiếm theo tên sản phẩm
    - Sử dụng Regex không phân biệt hoa/thường: `i`

### 5.2.2 Customer APIs

- **api/customer.js**:
  - `GET /api/customer/categories`:
    - Lấy toàn bộ danh mục
  
  - `GET /api/customer/products/new`:
    - Lấy 3 sản phẩm mới
  
  - `GET /api/customer/products/hot`:
    - Lấy 3 sản phẩm bán chạy
  
  - `GET /api/customer/products/category/:cid`:
    - Lọc sản phẩm theo danh mục
  
  - `GET /api/customer/products/search/:keyword`:
    - Tìm kiếm sản phẩm theo từ khóa
  
  - `GET /api/customer/products/:id`:
    - Lấy thông tin chi tiết một sản phẩm

## 5.3 Kết quả thực hiện Frontend Customer

### 5.3.1 Utilities

- **src/utils/withRouter.js**:
  - HOC (Higher-Order Component) chuyển đổi:
    - `useParams` → `params` prop
    - `useNavigate` → `navigate` prop
  - Hỗ trợ Class Components trong React Router v6

### 5.3.2 Components

- **src/components/MenuComponent.js**:
  - Thanh Menu động hiển thị danh mục:
    - IPAD
    - IPHONE
    - MACBOOK
  - Thanh tìm kiếm sản phẩm

- **src/components/InformComponent.js**:
  - Thanh thông tin người dùng
  - Tóm tắt số lượng sản phẩm trong giỏ hàng

- **src/components/HomeComponent.js**:
  - Trang chủ khách hàng
  - Hiển thị 2 khối sản phẩm:
    - **NEW PRODUCTS** (3 sản phẩm mới nhất)
    - **HOT PRODUCTS** (3 sản phẩm bán chạy)

- **src/components/ProductComponent.js**:
  - Danh sách sản phẩm dạng lưới
  - Theo danh mục hoặc từ khóa tìm kiếm

- **src/components/ProductDetailComponent.js**:
  - Trang chi tiết sản phẩm
  - Hình ảnh lớn
  - Thông số sản phẩm:
    - ID
    - Name
    - Price
    - Category
  - Ô chọn số lượng (`Quantity`)
  - Nút **ADD TO CART**

### 5.3.3 Routing

- **src/components/MainComponent.js** & **src/App.js**:
  - Thiết lập bộ tuyến đường (Routes)
  - Quản lý điều hướng giữa các trang:
    - Trang chủ (`/`)
    - Danh mục (`/product/category/:cid`)
    - Tìm kiếm (`/product/search/:keyword`)
    - Chi tiết sản phẩm (`/product/:id`)

## 5.4 Xác minh & Kiểm thử
✓ **Trang chủ** (`http://localhost:3002/`):
  - Hiển thị Menu danh mục đầy đủ
  - Khối NEW PRODUCTS (3 sản phẩm mới)
  - Khối HOT PRODUCTS (3 sản phẩm bán chạy từ đơn hàng đã duyệt)

✓ **Lọc theo danh mục**:
  - Click IPHONE, IPAD, MACBOOK
  - Danh sách sản phẩm hiển thị đúng theo loại

✓ **Tìm kiếm**:
  - Nhập từ khóa (ví dụ: `Pro`)
  - Bấm **SEARCH**
  - Lọc chính xác các sản phẩm thỏa mãn

✓ **Xem chi tiết**:
  - Click vào sản phẩm bất kỳ
  - Hiển thị đầy đủ ID, Name, Price, Category
  - Hình ảnh lớn
  - Nút **ADD TO CART**

## 5.5 Kết luận
Tuần 5 đã hoàn thành toàn bộ các tính năng dành cho Khách hàng phía Frontend & Backend.

---

# TÓM TẮT TOÀN BỘ DỰ ÁN

## Kiến trúc ứng dụng

```
┌─────────────────────────────────────────────────────────────┐
│                    MERN STACK APPLICATION                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Client Admin    │    │ Client Customer  │               │
│  │  (React)         │    │  (React)         │               │
│  │  Port: 3001      │    │  Port: 3002      │               │
│  └────────┬─────────┘    └────────┬─────────┘               │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       │ API Calls                           │
│           ┌───────────▼───────────┐                         │
│           │  Backend Server       │                         │
│           │  (Express.js)         │                         │
│           │  Port: 3000           │                         │
│           └───────────┬───────────┘                         │
│                       │                                     │
│           ┌───────────▼───────────┐                         │
│           │  MongoDB Atlas        │                         │
│           │  - Admin              │                         │
│           │  - Category           │                         │
│           │  - Customer           │                         │
│           │  - Product            │                         │
│           │  - Order              │                         │
│           └───────────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Công nghệ sử dụng

### Backend
- **Express.js**: Framework web server
- **Mongoose**: ODM (Object Data Modeling)
- **MongoDB Atlas**: Cloud database
- **JWT (JSON Web Token)**: Xác thực
- **Nodemailer**: Gửi email
- **MD5**: Mã hóa mật khẩu

### Frontend
- **React.js**: Framework UI
- **React Router v6**: Định tuyến
- **Context API**: Quản lý state toàn cục
- **CSS**: Styling

## Các chức năng chính

### Admin Panel
| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực Admin bằng JWT |
| Quản lý danh mục | CRUD Category |
| Quản lý sản phẩm | CRUD Product + Phân trang + Upload ảnh Base64 |

### Customer Frontend
| Chức năng | Mô tả |
|-----------|-------|
| Xem danh mục | Hiển thị tất cả danh mục |
| Xem sản phẩm mới | TOP 3 NEW PRODUCTS |
| Xem sản phẩm hot | TOP 3 HOT PRODUCTS |
| Lọc theo danh mục | Xem sản phẩm theo category |
| Tìm kiếm | Tìm kiếm theo từ khóa |
| Xem chi tiết | Thông tin chi tiết sản phẩm |

## Tổng kết hoàn thành

✅ **Tuần 1**: Cấu trúc dự án + Môi trường  
✅ **Tuần 2**: Database Models + JWT Authentication  
✅ **Tuần 3**: Category Management CRUD  
✅ **Tuần 4**: Product Management + Pagination + Image Upload  
✅ **Tuần 5**: Customer Interface + Product Browsing & Search  

**Trạng thái dự án**: Hoàn thành 5 tuần đầu tiên với đầy đủ tính năng cơ bản cho Admin Panel và Customer Frontend.

---

**Ngày lập báo cáo**: Tháng 8, 2026  
**Tổng thời gian thực hiện**: 5 tuần  
**Trạng thái**: ✅ Hoàn thành tất cả Lab 01 - Lab 05