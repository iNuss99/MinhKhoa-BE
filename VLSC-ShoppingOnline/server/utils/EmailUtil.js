const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

const isPlaceholderCredentials = (user, pass) => {
  if (!user || !pass) return true;
  const lowerUser = user.toLowerCase();
  const lowerPass = pass.toLowerCase();
  if (lowerUser === 'email_user@hotmail.com' || lowerUser === 'your_email@domain.com') return true;
  if (lowerPass === 'email_pass' || lowerPass === 'your_email_password') return true;
  if (lowerUser.includes('example.com')) return true;
  return false;
};

const createTransporter = () => {
  if (MyConstants.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: MyConstants.EMAIL_HOST,
      port: Number(MyConstants.EMAIL_PORT) || 587,
      secure: Number(MyConstants.EMAIL_PORT) === 465,
      auth: {
        user: MyConstants.EMAIL_USER,
        pass: MyConstants.EMAIL_PASS
      }
    });
  }

  const service = MyConstants.EMAIL_SERVICE || 'gmail';
  return nodemailer.createTransport({
    service: service,
    auth: {
      user: MyConstants.EMAIL_USER,
      pass: MyConstants.EMAIL_PASS
    }
  });
};

const EmailUtil = {
  send(email, id, token) {
    const text = `Cảm ơn bạn đã đăng ký tài khoản tại VLSC Shopping Online.\n\nThông tin kích hoạt tài khoản của bạn:\n- ID: ${id}\n- Token: ${token}\n\nVui lòng nhập mã ID và Token trên vào trang kích hoạt tài khoản để hoàn tất đăng ký.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="background-color: #2563eb; color: #ffffff; padding: 16px; text-align: center; border-radius: 6px 6px 0 0;">
          <h2 style="margin: 0; font-size: 20px;">VLSC Shopping Online</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px;">Xác thực & Kích hoạt tài khoản</p>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 15px; color: #334155;">Xin chào,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản tại hệ thống thương mại điện tử <strong>VLSC Shopping Online</strong>.</p>
          <p style="font-size: 14px; color: #475569;">Dưới đây là thông tin mã xác thực kích hoạt tài khoản của bạn:</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 15px; margin: 15px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>ID Khách hàng:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; color: #1e293b; font-size: 13px;">${id}</code></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Token xác thực:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; color: #2563eb; font-weight: bold; font-size: 14px;">${token}</code></p>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 15px;">Vui lòng nhập ID và Token vào form Kích hoạt trên website để hoàn tất và bắt đầu trải nghiệm mua sắm.</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          © ${new Date().getFullYear()} VLSC Shopping Online. All rights reserved.
        </div>
      </div>
    `;

    return new Promise(function (resolve, reject) {
      if (isPlaceholderCredentials(MyConstants.EMAIL_USER, MyConstants.EMAIL_PASS)) {
        console.log(`\n================== [EMAIL SIMULATION (DEV MODE)] ==================`);
        console.log(`[Lưu ý]: Hệ thống đang chạy ở chế độ Giả lập gửi mail do chưa cấu hình EMAIL_USER / EMAIL_PASS thực tế trong server/.env`);
        console.log(`To: ${email}`);
        console.log(`Subject: VLSC Shopping Online | Kích hoạt tài khoản`);
        console.log(`ID: ${id}`);
        console.log(`Token: ${token}`);
        console.log(`===================================================================\n`);
        return resolve(true);
      }

      const transporter = createTransporter();
      const mailOptions = {
        from: `"VLSC Shopping Online" <${MyConstants.EMAIL_USER}>`,
        to: email,
        subject: 'VLSC Shopping Online - Xác thực kích hoạt tài khoản',
        text: text,
        html: html
      };

      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.error('\n[EmailUtil Error]: Không thể gửi email qua SMTP:', err.message);
          console.error('[EmailUtil Gợi ý]: Nếu dùng Gmail, hãy tạo Mật khẩu ứng dụng (App Password 16 ký tự).');
          console.log(`[EmailUtil Dev Fallback] Kích hoạt giả lập cho: ${email} (ID: ${id}, Token: ${token})\n`);
          resolve(true);
        } else {
          console.log(`[EmailUtil Success] Đã gửi email kích hoạt thành công tới: ${email}`);
          resolve(true);
        }
      });
    });
  }
};

module.exports = EmailUtil;
