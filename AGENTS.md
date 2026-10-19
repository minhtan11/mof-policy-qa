# MOF-PolicyQA – Quy tắc bắt buộc của dự án

## 1. Nguồn yêu cầu và phạm vi

1. `docs/dac-ta-he-thong-hoi-dap-cstc.mdc` là đặc tả nghiệp vụ ưu tiên cao nhất. File này tổng hợp ba tài liệu khách hàng; mọi thay đổi nghiệp vụ phải đối chiếu file này trước.
2. Source `D:\SourceCode\QA-html` chỉ là tài liệu tham khảo về dữ liệu demo, tình huống và luồng cũ. Không sao chép cấu trúc HTML/JS, UI, CSS hoặc dữ liệu rải rác của source cũ.
3. Đây là functional mockup: các luồng nghiệp vụ phải thao tác được end-to-end bằng mock repository. Tích hợp ngoài (VNeID, SSO/AD, Email/SMS, ký số, AI/OCR, VBPQ) chỉ mô phỏng qua adapter/service cho đến khi có API thật.

## 2. Kiến trúc bắt buộc

1. Một Angular standalone application, không tách nhiều ứng dụng theo role.
2. Route gốc:
   - `/portal/**`: Người dân/Doanh nghiệp.
   - `/workspace/**`: Cán bộ nghiệp vụ nội bộ.
   - `/admin/**`: Quản trị hệ thống.
3. Tổ chức code theo feature nghiệp vụ, không tổ chức theo từng role hoặc theo từng trang HTML.
4. Quyền gồm ba lớp: route guard, permission hành động và data scope. Ẩn nút không thay thế việc kiểm tra quyền.
5. Mỗi hồ sơ hỏi–đáp dùng cùng một domain model và màn hình chi tiết dùng chung; hành động hiển thị theo permission/trạng thái.

## 3. PrimeNG và design system

1. Dùng PrimeNG cho mọi interactive control: button, input, select, table, dialog, drawer, tabs, timeline, upload, editor, toast, confirm, skeleton, progress, chart và menu.
2. Không dùng control HTML thô để thay thế control PrimeNG. Có thể dùng HTML semantic cho cấu trúc, nhưng control tương tác phải là PrimeNG hoặc shared wrapper của PrimeNG.
3. Không dùng giao diện/theme PrimeNG mặc định nguyên bản. Tất cả phải đi qua design token và shared styles của dự án.
4. Tái sử dụng shared UI trước khi tạo component mới: `data-table`, `status-badge`, `sla-badge`, `filter-bar`, `timeline`, `empty-state`, `loading-state`, `page-header`, `confirm-dialog`, `file-upload`.
5. Không tạo CSS rải rác để ghi đè tùy hứng. Dùng token cho màu, spacing, radius, typography, elevation, z-index và motion.

## 4. Quy tắc UI/UX và motion bắt buộc

1. Mọi trang phải thống nhất header, sidebar, page header, action bar, form layout, validation, empty/loading/error state, table, badge trạng thái và SLA.
2. Responsive bắt buộc trên desktop, laptop, tablet/iPad và mobile. Cổng công khai ưu tiên mobile; workspace/admin ưu tiên desktop nhưng phải dùng được ở tablet.
3. Animation phục vụ phản hồi và định hướng, không trang trí quá mức:
   - hover/focus: 120–160ms;
   - click/pressed: 100–140ms;
   - dropdown/dialog: 180–240ms;
   - sidebar/drawer: 220–280ms;
   - route transition: 180–220ms.
4. Mọi thao tác bất đồng bộ phải có phản hồi ngay: loading/disabled chống bấm lặp, skeleton hoặc overlay, thành công/thất bại qua toast/dialog rõ ràng.
5. Không được để màn hình chớp trắng, nhảy layout hay giật khi đổi route/lọc bảng/mở modal. Dùng skeleton, view transition nhẹ và giữ kích thước layout ổn định.
6. Toast phải lịch sự, có icon, tiêu đề, nội dung, timeout phù hợp và CTA khi cần; không dùng `alert()` hay thông báo thô.
7. Có `prefers-reduced-motion`; animation giảm/tắt đối với người dùng yêu cầu.
8. UI nghiêm túc: navy/xanh Bộ, trắng/xám xanh nhạt; màu đỏ/cam/xanh lá chỉ để biểu thị trạng thái nghiệp vụ.

## 5. Dữ liệu mock và mock API

1. Không viết dữ liệu mock trực tiếp trong component/template/form.
2. Toàn bộ dữ liệu seed tập trung tại `src/app/mock-api/fixtures/` theo từng domain: users, roles, permissions, organizations, catalogs, dossiers, legal-documents, notifications, reports.
3. Component chỉ làm việc qua repository/service; ví dụ `DossierRepository`, `AuthRepository`, `ReportRepository`.
4. Mock database phải có quan hệ nhất quán: user → role → permission → organization → dossier → task/workflow → notification/audit log.
5. Thao tác mock phải cập nhật dữ liệu tập trung và persistence qua browser storage/IndexedDB adapter. Có chức năng reset seed rõ ràng cho demo.
6. Thiết kế adapter để sau này thay mock bằng API thật mà không phải viết lại component/luồng nghiệp vụ.

## 6. Comment, tài liệu và test

1. Mỗi screen/page component bắt đầu bằng comment nêu: mã màn hình, người dùng, mục đích nghiệp vụ, use case MDC liên quan và permission chính.
2. Mỗi feature mới phải có `.spec.ts` cho logic quan trọng: guard/permission, repository, state transition, SLA hoặc form validation.
3. Không comment lại điều hiển nhiên từng dòng; comment phải giải thích quyết định nghiệp vụ/UX.
4. Khi bổ sung hoặc thay đổi nghiệp vụ, cập nhật tài liệu liên quan trong `docs/`.

## 7. Chất lượng và an toàn

1. Form dùng Reactive Forms, validation nhất quán và thông báo lỗi dễ hiểu.
2. Không hard-code permission, trạng thái, danh mục, color mapping hoặc route trong nhiều component; đưa vào constants/config/domain service.
3. Không đưa dữ liệu cá nhân đầy đủ vào toast, URL, log hoặc dữ liệu công khai. Dữ liệu mock vẫn phải che/mã hóa mô phỏng theo role.
4. Chạy `npm run build` và test phù hợp sau các thay đổi quan trọng.

## 8. Theo dõi nghiệp vụ và cập nhật MDC bắt buộc

1. Mỗi nhóm nghiệp vụ phải có một file MDC riêng trong `docs/nghiep-vu/`; tên file bắt đầu bằng số thứ tự và slug nghiệp vụ.
2. Mọi thay đổi liên quan đến thao tác, trạng thái, quyền, dữ liệu, điều kiện chuyển bước, SLA hoặc thông báo phải cập nhật file MDC của nhóm đó trong cùng thay đổi code.
3. Mỗi file MDC nghiệp vụ phải có: phạm vi UC, actor/permission, precondition, main flow, alternate/error flow, state transition, dữ liệu vào/ra, acceptance criteria, test mapping và changelog.
4. Không được sửa code nghiệp vụ mà không cập nhật `Changed on`, `Changed by`, `Change reason` và `Affected UC` trong changelog của file MDC tương ứng.
5. Khi một nghiệp vụ liên quan nhiều nhóm, cập nhật tất cả file bị ảnh hưởng và ghi cross-reference hai chiều.
6. Mỗi use case phải có trạng thái traceability: `specified`, `mocked`, `tested`, `integrated` hoặc `blocked`; không đánh dấu `integrated` nếu chưa có adapter/API thật.
7. File spec/test phải tham chiếu mã UC và acceptance criteria trong MDC, để khi thay đổi nghiệp vụ có thể truy ngược test bị ảnh hưởng.

## 9. Cấu trúc component bắt buộc

1. Mỗi nghiệp vụ/màn hình phải nằm trong một feature folder riêng, ví dụ `src/app/features/auth/internal-login/`.
2. Mỗi component phải tách thành ba file: `*.component.ts`, `*.component.html`, `*.component.scss`; không viết template hoặc style inline trong TypeScript.
3. Component TypeScript chỉ giữ state, dependency injection, event handler và điều phối nghiệp vụ; HTML chỉ giữ markup/binding; SCSS chỉ giữ style của màn hình.
4. Tài nguyên dùng chung đặt trong `src/app/shared/`; không sao chép markup/style dùng chung giữa các feature.
5. Khi tách hoặc thêm component, phải cập nhật router, comment Screen/UC đầu file TypeScript, test tương ứng và MDC router nếu route/role thay đổi.
