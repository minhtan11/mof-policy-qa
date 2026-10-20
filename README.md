# MOF-PolicyQA

Mockup Angular cho **Cổng Hỏi đáp chính sách tài chính – Bộ Tài chính**. Nghiệp vụ gốc được lưu tại [`docs/dac-ta-he-thong-hoi-dap-cstc.mdc`](docs/dac-ta-he-thong-hoi-dap-cstc.mdc); source HTML cũ chỉ được tham khảo luồng và dữ liệu mẫu.

## Công nghệ

- Angular 21, standalone components, lazy routes và View Transitions.
- Shared UI kit nội bộ (không dùng PrimeNG); design token light/dark; i18n `vi`/`en`.
- ApexCharts cho biểu đồ dashboard.
- Tailwind CSS (utility) kết hợp SCSS token; responsive desktop/tablet/mobile; `prefers-reduced-motion`.
- Mock database tập trung, lưu cục bộ bằng `localStorage`; không có dữ liệu nghiệp vụ rải trong component.

## Các không gian đã dựng

| URL | Mục đích |
| --- | --- |
| `/portal` | Cổng công khai: khám phá lĩnh vực, tìm câu trả lời, gửi câu hỏi, tra cứu hồ sơ. |
| `/workspace/login` | Chọn vai trò demo cho cán bộ nội bộ. |
| `/workspace` | Dashboard nghiệp vụ và hàng đợi hồ sơ. |
| `/workspace/ho-so/:id` | Xử lý, lưu dự thảo, trình duyệt, phê duyệt/công khai hồ sơ. |
| `/admin` | Quản trị người dùng, vai trò, danh mục và nhật ký (chỉ role quản trị). |

## Chạy local

```bash
npm install
npm start
```

Mở `http://localhost:4200`. Để kiểm tra chất lượng:

```bash
npm run build
npm test -- --run
```

## Mockup và tích hợp thật

Đăng nhập hiện là mock role-based nhằm trình diễn phân quyền. VNeID/SSO, thư điện tử, chữ ký số, DVCQG và API backend **chưa kết nối thật**; các điểm này cần adapter API và thẩm định bảo mật khi triển khai chính thức.

## Quy tắc phát triển

Đọc [`AGENTS.md`](AGENTS.md) trước khi thêm màn hình hoặc luồng mới. File quy định bắt buộc về bám MDC, shared UI kit (không PrimeNG), theme sáng/tối, i18n vi/en, dữ liệu mock tập trung, chuyển động, responsive, comment màn hình và tests.

Tài liệu nghiệp vụ (tiếng Việt, theo actor): [`docs/nghiep-vu/README.mdc`](docs/nghiep-vu/README.mdc) — `01-nguoi-dan` / `02-can-bo` / `03-admin`.  
Tiến độ giai đoạn: [`docs/nghiep-vu/00-ke-hoach-giai-doan-mockup.mdc`](docs/nghiep-vu/00-ke-hoach-giai-doan-mockup.mdc).
