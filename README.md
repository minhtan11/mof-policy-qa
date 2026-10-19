# MOF-PolicyQA

Mockup Angular cho **Cổng Hỏi đáp chính sách tài chính – Bộ Tài chính**. Nghiệp vụ gốc được lưu tại [`docs/dac-ta-he-thong-hoi-dap-cstc.mdc`](docs/dac-ta-he-thong-hoi-dap-cstc.mdc); source HTML cũ chỉ được tham khảo luồng và dữ liệu mẫu.

## Công nghệ

- Angular 21, standalone components, lazy routes và View Transitions.
- PrimeNG 21, PrimeIcons, Chart.js qua `p-chart`.
- SCSS design tokens, responsive desktop/tablet/mobile, hỗ trợ `prefers-reduced-motion`.
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

Đọc [`AGENTS.md`](AGENTS.md) trước khi thêm màn hình hoặc luồng mới. File quy định bắt buộc về bám MDC, PrimeNG controls, tái sử dụng component, dữ liệu mock tập trung, chuyển động, responsive, comment màn hình và tests.
