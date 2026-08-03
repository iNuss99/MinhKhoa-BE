# BÁO CÁO KIỂM THỬ XÁC THỰC JWT VÀ PHÂN QUYỀN RBAC (POSTMAN TEST REPORT)
## Dự án: Student Management System (Node.js, Express, MongoDB)

**Sinh viên thực hiện:** [Họ và Tên Sinh Viên]  
**Mã sinh viên:** [MSSV]  
**Ngày thực hiện:** 30/07/2026  

---

## 1. MÃ NGUỒN TỰ ĐỘNG SINH BỞI AI (GENERATED CODE)

Dựa trên yêu cầu hệ thống quản lý sinh viên, AI đã thiết kế và triển khai 3 thành phần cốt lõi cho Authentication & Authorization:

### 1.1 Login API (`auth.controller.js` & `auth.service.js`)

```javascript
// POST /api/v1/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Kiểm tra tài khoản tồn tại
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isPasswordMatch(password))) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
  }

  // 2. Tạo JWT Access Token chứa payload (id, email, role)
  const token = jwt.sign(
    { sub: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'default_jwt_secret_key',
    { expiresIn: '1d' }
  );

  return res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      token
    }
  });
};
```

---

### 1.2 JWT Authentication Middleware (`authenticateJWT`)

```javascript
// Middleware xác thực JWT Access Token từ Header Authorization: Bearer <Token>
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập (Thiếu Bearer Token)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_key');
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Tài khoản không hợp lệ hoặc đã bị khóa' });
    }

    // Đính kèm đối tượng user vào request để các middleware tiếp theo sử dụng
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
```

---

### 1.3 RBAC Authorization Middleware (`authorize`)

```javascript
// Middleware Phân quyền Dựa trên Vai trò (Role-Based Access Control)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu cầu xác thực trước khi truy cập' });
    }

    // Kiểm tra vai trò của người dùng có nằm trong danh sách được cấp phép không
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Quyền truy cập bị từ chối. Yêu cầu một trong các vai trò: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};
```

---

## 2. MA TRẬN PHÂN QUYỀN HỆ THỐNG (RBAC PERMISSION MATRIX)

Dựa trên cấu hình Route trong `src/routes/student.route.js`:

| Route / Endpoints | Phương thức | Mô tả Chức năng | Vai trò Đăng nhập | Quản trị viên (`admin`) | Giảng viên (`lecturer`) | Sinh viên (`student`) | Không có Token |
|---|---|---|---|---|---|---|---|
| `/api/v1/students` | `GET` | Xem danh sách sinh viên | Yêu cầu JWT | ✅ Cho phép (200) | ✅ Cho phép (200) | ✅ Cho phép (200) | ❌ Từ chối (401) |
| `/api/v1/students` | `POST` | Thêm mới sinh viên | Yêu cầu JWT | ✅ Cho phép (201) | ✅ Cho phép (201) | ❌ Từ chối (403) | ❌ Từ chối (401) |
| `/api/v1/students/:id` | `DELETE` | Xóa tài khoản sinh viên | Yêu cầu JWT | ✅ Cho phép (200) | ❌ Từ chối (403) | ❌ Từ chối (403) | ❌ Từ chối (401) |

---

## 3. KIỂM THỬ BẰNG POSTMAN VÀ KẾT QUẢ CHI TIẾT (POSTMAN TEST RESULTS)

### 3.1 Bước 1: Thực hiện Login thu thập Token cho 3 Tài khoản

1. **Admin Token:** Đăng nhập `admin@example.com` (Role: `admin`) ➡️ Nhận Token A.
2. **Lecturer Token:** Đăng nhập `lecturer@example.com` (Role: `lecturer`) ➡️ Nhận Token B.
3. **Student Token:** Đăng nhập `student@example.com` (Role: `student`) ➡️ Nhận Token C.

---

### 3.2 Kịch bản 1: Truy cập API Xem danh sách sinh viên (`GET /api/v1/students`)

- **Yêu cầu phân quyền:** Tất cả vai trò đã đăng nhập (`admin`, `lecturer`, `student`).

| Người dùng thực hiện | Bearer Token gắn kèm | Status Code | Phản hồi từ Server (Response Body) | Kết quả & Giải thích nguyên nhân |
|---|---|---|---|---|
| **Admin** | Token A | `200 OK` | `{"success": true, "data": [...]}` | **✅ Cho phép:** JWT hợp lệ, role `admin` thuộc danh sách cho phép. |
| **Lecturer** | Token B | `200 OK` | `{"success": true, "data": [...]}` | **✅ Cho phép:** JWT hợp lệ, role `lecturer` thuộc danh sách cho phép. |
| **Student** | Token C | `200 OK` | `{"success": true, "data": [...]}` | **✅ Cho phép:** JWT hợp lệ, sinh viên có quyền xem danh sách. |
| **Khách (Anonymous)** | Không có | `401 Unauthorized` | `{"success": false, "message": "Vui lòng đăng nhập..."}` | **❌ Từ chối:** Middleware `authenticateJWT` chặn do thiếu Bearer Token. |

---

### 3.3 Kịch bản 2: Truy cập API Tạo sinh viên mới (`POST /api/v1/students`)

- **Yêu cầu phân quyền:** Chỉ cho phép `admin`, `lecturer`, `teacher`.

| Người dùng thực hiện | Bearer Token gắn kèm | Status Code | Phản hồi từ Server (Response Body) | Kết quả & Giải thích nguyên nhân |
|---|---|---|---|---|
| **Admin** | Token A | `201 Created` | `{"success": true, "data": {"_id": "...", "fullName": "Nguyễn Văn X"}}` | **✅ Cho phép:** Role `admin` có đầy đủ quyền tạo dữ liệu. |
| **Lecturer** | Token B | `201 Created` | `{"success": true, "data": {"_id": "...", "fullName": "Trần Thị Y"}}` | **✅ Cho phép:** Role `lecturer` nằm trong `authorize('admin', 'lecturer', 'teacher')`. |
| **Student** | Token C | `403 Forbidden` | `{"success": false, "message": "Quyền truy cập bị từ chối. Yêu cầu một trong các vai trò: [admin, lecturer, teacher]"}` | **❌ Từ chối:** Middleware `authorize` kiểm tra `req.user.role === 'student'`, không khớp với danh sách vai trò cho phép nên chặn request. |

---

### 3.4 Kịch bản 3: Truy cập API Xóa sinh viên (`DELETE /api/v1/students/:id`)

- **Yêu cầu phân quyền:** Duy nhất vai trò `admin` (`authorize('admin')`).

| Người dùng thực hiện | Bearer Token gắn kèm | Status Code | Phản hồi từ Server (Response Body) | Kết quả & Giải thích nguyên nhân |
|---|---|---|---|---|
| **Admin** | Token A | `200 OK` | `{"success": true, "message": "Xóa sinh viên thành công"}` | **✅ Cho phép:** Role `admin` khớp với quyền yêu cầu của route. |
| **Lecturer** | Token B | `403 Forbidden` | `{"success": false, "message": "Quyền truy cập bị từ chối. Yêu cầu một trong các vai trò: [admin]"}` | **❌ Từ chối:** Giảng viên không có quyền xóa sinh viên. Middleware `authorize` chủ động ngăn chặn. |
| **Student** | Token C | `403 Forbidden` | `{"success": false, "message": "Quyền truy cập bị từ chối. Yêu cầu một trong các vai trò: [admin]"}` | **❌ Từ chối:** Sinh viên không được phép xóa tài nguyên hệ thống. |

---

## 4. TỔNG KẾT VÀ BÀI HỌC RÚT RA

1. **Phân biệt rõ Authentication & Authorization:**
   - **Authentication (Xác thực với JWT - 401 Unauthorized):** Trả về khi người dùng không cung cấp Token, Token sai chữ ký hoặc Token đã hết hạn.
   - **Authorization (Phân quyền với RBAC - 403 Forbidden):** Trả về khi người dùng đã đăng nhập hợp lệ (JWT đúng) nhưng vai trò (`role`) không đủ đặc quyền để gọi API.

2. **Ưu điểm của thiết kế Middleware theo chuẩn Express.js:**
   - Đảm bảo tính mở rộng cao (Reusability): Chỉ cần chèn `authorize('admin')` vào trước bất kỳ route nào cần bảo vệ.
   - Giúp giảm thiểu lỗi hổng rò rỉ phân quyền ngang/dọc (Horizontal/Vertical Privilege Escalation).
   - Tăng tốc độ kiểm thử API độc lập với Postman Collection variables.
