/**
 * Fixture thông tin đăng nhập DEMO (mock, không phải bảo mật thật). Backend thật thay `MockCredentialsAuthAdapter`.
 * Mọi tài khoản demo dùng chung mật khẩu mặc định.
 */
export const DEMO_DEFAULT_PASSWORD = 'mof123456';

/** userId → mật khẩu demo (cho phép đổi riêng từng tài khoản sau này). */
export const DEMO_CREDENTIALS: Record<string, string> = {
  'u-public': DEMO_DEFAULT_PASSWORD,
  'u-reception': DEMO_DEFAULT_PASSWORD,
  'u-specialist': DEMO_DEFAULT_PASSWORD,
  'u-leader': DEMO_DEFAULT_PASSWORD,
  'u-coordinator': DEMO_DEFAULT_PASSWORD,
  'u-admin': DEMO_DEFAULT_PASSWORD,
};

/** Tài khoản điền sẵn trên form đăng nhập cổng. */
export const DEMO_LOGIN_PREFILL_USER_ID = 'u-public';

/** Tài khoản điền sẵn trên form đăng nhập cán bộ (/workspace/login) — tài khoản nội bộ đầu tiên. */
export const DEMO_INTERNAL_PREFILL_USER_ID = 'u-reception';
