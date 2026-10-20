/**
 * Fixture mô phỏng luồng đăng nhập VNeID bằng QR (mock). Adapter thật (OIDC qua sso.mof.gov.vn) sẽ thay
 * `MockVneidAuthAdapter` mà không đổi UI. Người dùng đăng nhập = tài khoản công dân mặc định trong `USERS`.
 */
export const VNEID_MOCK = {
  /** `USERS` → Nguyễn Minh Anh (role `public`). */
  userId: 'u-public',
  /** Thời gian sống của một mã QR (giây). */
  qrTtlSec: 60,
  /** Độ trễ mô phỏng: điện thoại quét xong → "đã quét". */
  scanDelayMs: 1200,
  /** Độ trễ mô phỏng: bấm Xác nhận trên app → đăng nhập thành công. */
  confirmDelayMs: 900,
  /** Endpoint minh hoạ nhúng trong QR (không gọi thật). */
  authorizeUrl: 'https://sso.mof.gov.vn/vneid/authorize',
} as const;
