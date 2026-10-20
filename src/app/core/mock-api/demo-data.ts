import { DashboardMetric, Dossier, Notice, PortalUser, Topic } from '../models/domain.models';

export const TOPICS: Topic[] = [
  { id: 'tax', name: 'Thuế', description: 'Thuế nội địa, thuế xuất nhập khẩu và hóa đơn.', icon: 'pi-receipt', count: 1248 },
  { id: 'budget', name: 'Ngân sách nhà nước', description: 'Quản lý, phân bổ và quyết toán ngân sách.', icon: 'pi-wallet', count: 846 },
  { id: 'customs', name: 'Hải quan', description: 'Thủ tục hải quan, xuất nhập khẩu.', icon: 'pi-box', count: 664 },
  { id: 'finance', name: 'Tài chính doanh nghiệp', description: 'Chính sách tài chính đối với doanh nghiệp.', icon: 'pi-building', count: 531 },
  { id: 'public-assets', name: 'Tài sản công', description: 'Quản lý, sử dụng tài sản công.', icon: 'pi-briefcase', count: 392 },
  { id: 'other', name: 'Lĩnh vực khác', description: 'Các chính sách tài chính khác.', icon: 'pi-compass', count: 218 },
];

export const USERS: PortalUser[] = [
  { id: 'u-public', username: 'minhanh', name: 'Nguyễn Minh Anh', email: 'minhanh@example.vn', organization: 'Công ty CP An Phát', role: 'public', avatar: 'MA' },
  { id: 'u-reception', username: 'ha.tt', name: 'Trần Thu Hà', email: 'ha.tt@moj.gov.vn', organization: 'Văn phòng Bộ', role: 'reception', avatar: 'TH' },
  { id: 'u-specialist', username: 'hung.lq', name: 'Lê Quốc Hưng', email: 'hung.lq@moj.gov.vn', organization: 'Vụ Chính sách thuế', role: 'specialist', avatar: 'LH' },
  { id: 'u-leader', username: 'long.pd', name: 'Phạm Đức Long', email: 'long.pd@moj.gov.vn', organization: 'Vụ Chính sách thuế', role: 'leader', avatar: 'PL' },
  { id: 'u-coordinator', username: 'ngoc.db', name: 'Đỗ Bích Ngọc', email: 'ngoc.db@moj.gov.vn', organization: 'Tổ điều phối', role: 'coordinator', avatar: 'BN' },
  { id: 'u-admin', username: 'admin', name: 'Quản trị hệ thống', email: 'admin@moj.gov.vn', organization: 'Trung tâm CNTT', role: 'system-admin', avatar: 'QT' },
];

export const DOSSIERS: Dossier[] = [
  {
    id: 'd-001', code: 'CSTC-2026-001284', question: 'Doanh nghiệp mới thành lập cần thực hiện các thủ tục khai thuế ban đầu như thế nào?', topicId: 'tax', sender: 'Nguyễn Minh Anh', senderEmail: 'minhanh@example.vn', organization: 'Công ty CP An Phát', receivedAt: '2026-10-15T08:30:00', dueAt: '2026-10-22T17:00:00', status: 'processing', priority: 'high', assignedTo: 'Lê Quốc Hưng', answer: '', legalBasis: ['Luật Quản lý thuế số 38/2019/QH14', 'Nghị định số 126/2020/NĐ-CP'], attachments: ['giay-chung-nhan-dkkd.pdf'], isPublic: false,
    timeline: [
      { at: '15/10/2026 08:30', title: 'Tiếp nhận câu hỏi', description: 'Hệ thống đã ghi nhận hồ sơ từ Cổng công khai.', actor: 'Hệ thống', state: 'done' },
      { at: '15/10/2026 10:15', title: 'Phân loại và chuyển xử lý', description: 'Chuyển Vụ Chính sách thuế.', actor: 'Trần Thu Hà', state: 'done' },
      { at: '16/10/2026 09:00', title: 'Đang soạn dự thảo', description: 'Chuyên viên đang nghiên cứu hồ sơ.', actor: 'Lê Quốc Hưng', state: 'current' },
    ],
  },
  {
    id: 'd-002', code: 'CSTC-2026-001279', question: 'Hồ sơ quyết toán ngân sách cấp xã cần gửi trước thời hạn nào?', topicId: 'budget', sender: 'UBND phường Hòa Bình', senderEmail: 'vanthu@hoabinh.gov.vn', organization: 'UBND phường Hòa Bình', receivedAt: '2026-10-14T14:20:00', dueAt: '2026-10-21T17:00:00', status: 'waiting-approval', priority: 'normal', assignedTo: 'Lê Quốc Hưng', answer: 'Theo quy định hiện hành, báo cáo quyết toán ngân sách cấp xã được lập và gửi cơ quan tài chính cấp trên đúng thời hạn quy định.', legalBasis: ['Luật Ngân sách nhà nước 2015'], attachments: [], isPublic: false,
    timeline: [{ at: '14/10/2026 14:20', title: 'Tiếp nhận câu hỏi', description: 'Đã tiếp nhận.', actor: 'Hệ thống', state: 'done' }, { at: '16/10/2026 15:40', title: 'Trình lãnh đạo duyệt', description: 'Dự thảo đang chờ phê duyệt.', actor: 'Lê Quốc Hưng', state: 'current' }],
  },
  {
    id: 'd-003', code: 'CSTC-2026-001261', question: 'Thủ tục hoàn thuế giá trị gia tăng đối với hàng xuất khẩu?', topicId: 'tax', sender: 'Công ty TNHH Hưng Thịnh', senderEmail: 'contact@hungthinh.vn', organization: 'Công ty TNHH Hưng Thịnh', receivedAt: '2026-10-10T09:00:00', dueAt: '2026-10-17T17:00:00', status: 'published', priority: 'normal', assignedTo: 'Lê Quốc Hưng', answer: 'Người nộp thuế chuẩn bị hồ sơ hoàn thuế theo quy định của pháp luật về thuế và gửi cơ quan thuế quản lý trực tiếp.', legalBasis: ['Thông tư số 80/2021/TT-BTC'], attachments: [], isPublic: true,
    timeline: [{ at: '10/10/2026 09:00', title: 'Tiếp nhận câu hỏi', description: 'Đã tiếp nhận.', actor: 'Hệ thống', state: 'done' }, { at: '15/10/2026 16:30', title: 'Công khai câu trả lời', description: 'Câu trả lời đã được công bố.', actor: 'Phạm Đức Long', state: 'done' }],
  },
];

export const NOTICES: Notice[] = [
  { id: 'n1', title: 'Hướng dẫn gửi câu hỏi chính sách tài chính', body: 'Chuẩn bị đầy đủ thông tin, tài liệu liên quan để cơ quan chuyên môn hỗ trợ nhanh chóng.', date: '15/10/2026', category: 'guide' },
  { id: 'n2', title: 'Bộ Tài chính công bố danh mục thủ tục hành chính mới', body: 'Danh mục được cập nhật trên Cổng thông tin điện tử.', date: '11/10/2026', category: 'notice' },
  { id: 'n3', title: 'Các câu hỏi thường gặp về kê khai thuế', body: 'Tổng hợp hướng dẫn dành cho người nộp thuế.', date: '08/10/2026', category: 'news' },
];

export const DASHBOARD_METRICS: DashboardMetric[] = [
  { label: 'Chờ tiếp nhận', value: 18, delta: '+4 hôm nay', icon: 'pi-inbox', tone: 'blue' },
  { label: 'Đang xử lý', value: 42, delta: '8 sắp đến hạn', icon: 'pi-file-edit', tone: 'amber' },
  { label: 'Chờ phê duyệt', value: 11, delta: '3 cần ưu tiên', icon: 'pi-verified', tone: 'violet' },
  { label: 'Đúng hạn', value: 96, delta: 'Tỷ lệ 98,4%', icon: 'pi-check-circle', tone: 'green' },
];
