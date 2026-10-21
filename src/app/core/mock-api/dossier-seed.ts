import { Dossier, DossierStatus, IntakeChannel, PortalQaType } from '../models/domain.models';

/**
 * Một bảng hồ sơ mock (như database): người gửi, cán bộ, đơn vị, trạng thái, kênh.
 * Mọi màn đọc `SEED_DOSSIERS` qua `MockDbService` — không có bộ số thứ hai.
 * Mốc hạn SLA cố định quanh 20/10/2026 để spec và demo cùng một đồng hồ.
 */
export const MY_QUESTIONS_FIXTURE_NOW = new Date('2026-10-20T09:00:00').getTime();
export const MY_QUESTIONS_DEMO_EMAIL = 'minhanh@example.vn';

/** Đơn giá nhuận bút (đồng / bài đã xuất bản) — bảng giá, nhân với số bài published. */
export const ROYALTY_RATE_VND = 350_000;

export interface SeedParty {
  id: string;
  name: string;
  email: string;
  organization: string;
}

export interface SeedOfficer {
  id: string;
  name: string;
  unitId: string;
}

export interface IncomingLink {
  id: string;
  code: string;
  dossierId: string;
  status: 'new' | 'distributed' | 'processing' | 'done';
}

export const SEED_PARTIES: SeedParty[] = [
  { id: 'p-minh-anh', name: 'Nguyễn Minh Anh', email: MY_QUESTIONS_DEMO_EMAIL, organization: 'Công ty CP An Phát' },
  { id: 'p-hung-thinh', name: 'Công ty TNHH Hưng Thịnh', email: 'contact@hungthinh.vn', organization: 'Công ty TNHH Hưng Thịnh' },
  { id: 'p-hoa-binh', name: 'UBND phường Hòa Bình', email: 'vanthu@hoabinh.gov.vn', organization: 'UBND phường Hòa Bình' },
  { id: 'p-so-hn', name: 'Sở Tài chính Hà Nội', email: 'stc@hanoi.gov.vn', organization: 'Sở Tài chính Hà Nội' },
  { id: 'p-xnk', name: 'Công ty CP Xuất nhập khẩu Việt Nam', email: 'xnk@vietxnk.vn', organization: 'Công ty CP Xuất nhập khẩu Việt Nam' },
  { id: 'p-startup', name: 'Công ty TNHH Khởi nghiệp Xanh', email: 'startup@xanh.vn', organization: 'Công ty TNHH Khởi nghiệp Xanh' },
  { id: 'p-q1', name: 'UBND quận 1', email: 'vanthu@q1.hochiminh.gov.vn', organization: 'UBND quận 1' },
  { id: 'p-binh', name: 'Trần Văn Bình', email: 'binh.tv@example.vn', organization: 'Cá nhân' },
  { id: 'p-htx', name: 'HTX Nông nghiệp Hòa Bình', email: 'htx@hoabinh.vn', organization: 'HTX Nông nghiệp Hòa Bình' },
];

/** Cán bộ xử lý — id khớp `USERS` / `ADMIN_ACCOUNTS`. Đơn vị của hồ sơ = đơn vị của cán bộ được giao. */
export const SEED_OFFICERS: SeedOfficer[] = [
  { id: 'u-specialist', name: 'Lê Quốc Hưng', unitId: 'org-tax' },
  { id: 'u-spec-khoa', name: 'Trần Minh Khoa', unitId: 'org-tax' },
  { id: 'u-spec-mai', name: 'Nguyễn Thị Mai', unitId: 'org-budget' },
  { id: 'u-spec-trang', name: 'Phạm Thu Trang', unitId: 'org-customs' },
  { id: 'u-spec-anh', name: 'Vũ Đức Anh', unitId: 'org-finance' },
  { id: 'u-spec-hong', name: 'Lê Thị Hồng', unitId: 'org-assets' },
];

const OFFICER_BY_ID = new Map(SEED_OFFICERS.map((o) => [o.id, o]));
const PARTY_BY_ID = new Map(SEED_PARTIES.map((p) => [p.id, p]));

const ANSWER =
  'Căn cứ quy định hiện hành, Bộ Tài chính đã có văn bản hướng dẫn chi tiết. Đề nghị đối chiếu hồ sơ với các điều kiện trong văn bản và liên hệ cơ quan quản lý trực tiếp nếu cần hỗ trợ thêm.';
const REJECT =
  'Nội dung không thuộc phạm vi trả lời chính sách của Bộ Tài chính hoặc trùng với hồ sơ đã có. Đề nghị tham khảo hướng dẫn gửi câu hỏi.';
const LAW = ['Luật Quản lý thuế số 38/2019/QH14'];

interface SeedRow {
  id: string;
  code: string;
  question: string;
  topicId: string;
  senderId: string;
  status: DossierStatus;
  receivedAt: string;
  dueAt: string;
  assigneeId?: string;
  /** Bắt buộc khi chưa giao cán bộ nhưng đã về đơn vị. */
  unitId?: string;
  priority?: Dossier['priority'];
  channel?: IntakeChannel;
  attachments?: string[];
  listed?: boolean;
  portalType?: PortalQaType;
  views?: number;
  replies?: number;
  clarify?: string;
  collab?: { unitId: string; unitName: string; note: string; dueAt: string; status: 'open' | 'done' };
  rating?: { stars: number; comment: string };
}

const ROWS: SeedRow[] = [
  { id: 'd-ma-new', code: 'CSTC-2026-001301', question: 'Thời hạn nộp báo cáo tình hình sử dụng hóa đơn điện tử là khi nào?', topicId: 'tax', senderId: 'p-minh-anh', status: 'new', receivedAt: '2026-10-19T16:20:00', dueAt: '2026-10-26T17:00:00' },
  { id: 'd-ma-recv', code: 'CSTC-2026-001302', question: 'Chi phí khấu hao tài sản cố định thuê tài chính có được tính vào chi phí được trừ không?', topicId: 'tax', senderId: 'p-minh-anh', status: 'received', unitId: 'org-tax', receivedAt: '2026-10-17T08:40:00', dueAt: '2026-10-24T17:00:00' },
  { id: 'd-ma-proc', code: 'CSTC-2026-001303', question: 'Hồ sơ khai thuế giá trị gia tăng theo quý cần những chứng từ gì đối với doanh nghiệp nhỏ?', topicId: 'tax', senderId: 'p-minh-anh', status: 'processing', assigneeId: 'u-specialist', priority: 'high', receivedAt: '2026-10-10T10:15:00', dueAt: '2026-10-19T17:00:00', attachments: ['to-khai-gtgt-q3.pdf'] },
  { id: 'd-ma-near', code: 'CSTC-2026-001304', question: 'Thủ tục điều chỉnh thông tin đăng ký thuế khi doanh nghiệp đổi địa chỉ trụ sở?', topicId: 'tax', senderId: 'p-minh-anh', status: 'processing', assigneeId: 'u-spec-khoa', receivedAt: '2026-10-18T11:00:00', dueAt: '2026-10-22T17:00:00', listed: true, portalType: 'procedure', views: 905, replies: 2, attachments: ['quyet-dinh-doi-tru-so.pdf'] },
  { id: 'd-ma-clar', code: 'CSTC-2026-001305', question: 'Quy định về trích lập quỹ phát triển khoa học và công nghệ của doanh nghiệp?', topicId: 'tax', senderId: 'p-minh-anh', status: 'awaiting-clarification', assigneeId: 'u-specialist', receivedAt: '2026-10-14T09:30:00', dueAt: '2026-10-21T17:00:00', clarify: 'Cần bổ sung biên bản quyết định trích lập quỹ.' },
  { id: 'd-ma-ret', code: 'CSTC-2026-001306', question: 'Điều kiện được hoàn thuế thu nhập doanh nghiệp đã nộp thừa?', topicId: 'tax', senderId: 'p-minh-anh', status: 'returned', assigneeId: 'u-specialist', receivedAt: '2026-10-16T11:00:00', dueAt: '2026-10-23T17:00:00', attachments: ['giay-nop-tien.pdf'] },
  { id: 'd-ma-wait', code: 'CSTC-2026-001307', question: 'Doanh nghiệp mới thành lập cần thực hiện các thủ tục khai thuế ban đầu như thế nào?', topicId: 'tax', senderId: 'p-minh-anh', status: 'waiting-approval', assigneeId: 'u-specialist', priority: 'high', receivedAt: '2026-10-15T08:30:00', dueAt: '2026-10-25T17:00:00', listed: true, portalType: 'procedure', views: 1544, replies: 5 },
  { id: 'd-ma-appr', code: 'CSTC-2026-001308', question: 'Thủ tục đăng ký sử dụng hóa đơn điện tử có mã của cơ quan thuế?', topicId: 'tax', senderId: 'p-minh-anh', status: 'approved', assigneeId: 'u-spec-khoa', receivedAt: '2026-10-12T13:45:00', dueAt: '2026-10-21T17:00:00', listed: true, portalType: 'guidance', views: 640, replies: 1 },
  { id: 'd-ma-ans', code: 'CSTC-2026-001309', question: 'Hướng dẫn quyết toán thuế thu nhập cá nhân cho người lao động nghỉ việc giữa năm?', topicId: 'tax', senderId: 'p-minh-anh', status: 'answered', assigneeId: 'u-specialist', receivedAt: '2026-09-10T14:15:00', dueAt: '2026-09-17T17:00:00', listed: true, portalType: 'guidance', views: 3920, replies: 11, attachments: ['bang-luong-2026.xlsx'] },
  { id: 'd-ma-closed', code: 'CSTC-2026-001310', question: 'Hồ sơ đề nghị gia hạn nộp thuế do ảnh hưởng thiên tai gồm những gì?', topicId: 'tax', senderId: 'p-minh-anh', status: 'closed', assigneeId: 'u-specialist', receivedAt: '2026-08-20T08:15:00', dueAt: '2026-08-27T17:00:00' },
  { id: 'd-ma-rej', code: 'CSTC-2026-001311', question: 'Đề nghị cung cấp mức lương cụ thể của cán bộ phụ trách hồ sơ thuế?', topicId: 'other', senderId: 'p-minh-anh', status: 'rejected', receivedAt: '2026-10-06T15:30:00', dueAt: '2026-10-13T17:00:00' },
  { id: 'd-ma-rej-tax', code: 'CSTC-2026-001312', question: 'Đề nghị xóa nợ thuế cho doanh nghiệp đang hoạt động bình thường?', topicId: 'tax', senderId: 'p-minh-anh', status: 'rejected', receivedAt: '2026-09-08T13:00:00', dueAt: '2026-09-15T17:00:00' },
  {
    id: 'd-001',
    code: 'CSTC-2026-001284',
    question: 'Doanh nghiệp nhập khẩu máy móc để tạo tài sản cố định có được miễn thuế nhập khẩu không?',
    topicId: 'tax',
    senderId: 'p-hung-thinh',
    status: 'awaiting-collaboration',
    assigneeId: 'u-specialist',
    priority: 'high',
    receivedAt: '2026-10-15T08:30:00',
    dueAt: '2026-10-22T17:00:00',
    attachments: ['hop-dong-nhap-khau.pdf'],
    collab: {
      unitId: 'org-budget',
      unitName: 'Vụ Ngân sách nhà nước',
      note: 'Xin ý kiến về hỗ trợ đăng ký thuế ban đầu gắn với nghĩa vụ ngân sách địa phương.',
      dueAt: '2026-10-21T17:00:00',
      status: 'open',
    },
  },
  { id: 'd-002', code: 'CSTC-2026-001279', question: 'Hồ sơ quyết toán ngân sách cấp xã cần gửi trước thời hạn nào?', topicId: 'budget', senderId: 'p-hoa-binh', status: 'waiting-approval', assigneeId: 'u-spec-mai', receivedAt: '2026-10-14T14:20:00', dueAt: '2026-10-21T17:00:00', listed: true, portalType: 'procedure', views: 1876, replies: 5 },
  { id: 'd-140', code: 'CSTC-2026-000140', question: 'Thủ tục hoàn thuế giá trị gia tăng đối với hàng xuất khẩu?', topicId: 'tax', senderId: 'p-hung-thinh', status: 'published', assigneeId: 'u-specialist', receivedAt: '2026-10-19T09:00:00', dueAt: '2026-10-17T17:00:00', portalType: 'procedure', views: 6230, replies: 18, rating: { stars: 5, comment: 'Rõ và đủ căn cứ.' } },
  { id: 'd-tax-pub2', code: 'CSTC-2026-001313', question: 'Quy định về hóa đơn điện tử khi bán hàng qua sàn thương mại điện tử?', topicId: 'tax', senderId: 'p-minh-anh', status: 'published', assigneeId: 'u-spec-khoa', receivedAt: '2026-09-22T10:00:00', dueAt: '2026-09-29T17:00:00', portalType: 'guidance', views: 7312, replies: 21 },
  { id: 'd-cus-proc', code: 'CSTC-2026-001314', question: 'Thủ tục khai báo hải quan đối với hàng mẫu nhập khẩu?', topicId: 'customs', senderId: 'p-xnk', status: 'processing', assigneeId: 'u-spec-trang', receivedAt: '2026-10-18T14:00:00', dueAt: '2026-10-27T17:00:00', listed: true, portalType: 'procedure', views: 812, replies: 3, attachments: ['danh-muc-hang-mau.xlsx'] },
  { id: 'd-cus-wait', code: 'CSTC-2026-001315', question: 'Doanh nghiệp chế xuất bán hàng vào nội địa có phải khai hải quan không?', topicId: 'customs', senderId: 'p-xnk', status: 'waiting-approval', assigneeId: 'u-spec-trang', receivedAt: '2026-10-15T10:10:00', dueAt: '2026-10-22T17:00:00', listed: true, portalType: 'policy', views: 2210, replies: 7 },
  { id: 'd-cus-pub', code: 'CSTC-2026-001316', question: 'Thuế suất ưu đãi đặc biệt theo Hiệp định CPTPP năm 2026 áp dụng thế nào?', topicId: 'customs', senderId: 'p-xnk', status: 'published', assigneeId: 'u-spec-trang', receivedAt: '2026-09-29T09:00:00', dueAt: '2026-10-06T17:00:00', portalType: 'policy', views: 5104, replies: 14 },
  { id: 'd-cus-od', code: 'CSTC-2026-001317', question: 'Thời hạn giải quyết hồ sơ hoàn thuế xuất khẩu là bao lâu?', topicId: 'customs', senderId: 'p-xnk', status: 'processing', assigneeId: 'u-spec-trang', priority: 'urgent', receivedAt: '2026-10-08T09:00:00', dueAt: '2026-10-16T17:00:00' },
  { id: 'd-fin-wait', code: 'CSTC-2026-001318', question: 'Điều kiện để doanh nghiệp khởi nghiệp sáng tạo được hưởng ưu đãi thuế?', topicId: 'finance', senderId: 'p-startup', status: 'waiting-approval', assigneeId: 'u-spec-anh', receivedAt: '2026-10-17T09:00:00', dueAt: '2026-10-24T17:00:00', listed: true, portalType: 'policy', views: 1540, replies: 4 },
  { id: 'd-fin-pub', code: 'CSTC-2026-001319', question: 'Hướng dẫn trích lập quỹ phát triển khoa học công nghệ của doanh nghiệp?', topicId: 'finance', senderId: 'p-startup', status: 'published', assigneeId: 'u-spec-anh', receivedAt: '2026-08-26T11:30:00', dueAt: '2026-09-02T17:00:00', portalType: 'guidance', views: 1610, replies: 4 },
  { id: 'd-fin-clar', code: 'CSTC-2026-001320', question: 'Chính sách hỗ trợ tài chính cho hợp tác xã nông nghiệp gồm những khoản nào?', topicId: 'finance', senderId: 'p-htx', status: 'awaiting-clarification', assigneeId: 'u-spec-anh', channel: 'email', receivedAt: '2026-10-14T09:30:00', dueAt: '2026-10-21T17:00:00', clarify: 'Cần bổ sung giấy chứng nhận đăng ký hợp tác xã.' },
  { id: 'd-fin-ret', code: 'CSTC-2026-001321', question: 'Điều kiện được khấu trừ chi phí lãi vay khi tính thuế thu nhập doanh nghiệp?', topicId: 'finance', senderId: 'p-startup', status: 'returned', assigneeId: 'u-spec-anh', receivedAt: '2026-10-09T10:00:00', dueAt: '2026-10-18T17:00:00' },
  { id: 'd-bud-proc', code: 'CSTC-2026-001322', question: 'Quy trình phân bổ dự toán chi thường xuyên cho đơn vị trực thuộc?', topicId: 'budget', senderId: 'p-so-hn', status: 'processing', assigneeId: 'u-spec-mai', receivedAt: '2026-10-16T09:00:00', dueAt: '2026-10-23T17:00:00', listed: true, portalType: 'procedure', views: 1488, replies: 3 },
  { id: 'd-bud-recv', code: 'CSTC-2026-001323', question: 'Thủ tục điều chỉnh dự toán ngân sách cấp xã giữa năm thực hiện ra sao?', topicId: 'budget', senderId: 'p-hoa-binh', status: 'received', unitId: 'org-budget', receivedAt: '2026-10-19T08:40:00', dueAt: '2026-10-26T17:00:00' },
  { id: 'd-bud-ans', code: 'CSTC-2026-001324', question: 'Hướng dẫn hạch toán khoản hỗ trợ lãi suất từ ngân sách nhà nước?', topicId: 'budget', senderId: 'p-hoa-binh', status: 'answered', assigneeId: 'u-spec-mai', receivedAt: '2026-09-03T09:00:00', dueAt: '2026-09-10T17:00:00' },
  { id: 'd-bud-pub', code: 'CSTC-2026-001325', question: 'Định mức chi hội nghị, công tác phí năm 2026 áp dụng theo văn bản nào?', topicId: 'budget', senderId: 'p-so-hn', status: 'published', assigneeId: 'u-spec-mai', receivedAt: '2025-09-16T08:00:00', dueAt: '2025-09-23T17:00:00', portalType: 'policy', views: 9020, replies: 31, rating: { stars: 4, comment: 'Đủ dẫn chiếu văn bản.' } },
  { id: 'd-bud-appr', code: 'CSTC-2026-001326', question: 'Quy định về công khai ngân sách đối với đơn vị dự toán?', topicId: 'budget', senderId: 'p-so-hn', status: 'approved', assigneeId: 'u-spec-mai', receivedAt: '2026-10-12T13:45:00', dueAt: '2026-10-21T17:00:00' },
  { id: 'd-ast-proc', code: 'CSTC-2026-001327', question: 'Đơn vị sự nghiệp công lập cho thuê tài sản công cần lập đề án như thế nào?', topicId: 'public-assets', senderId: 'p-q1', status: 'processing', assigneeId: 'u-spec-hong', receivedAt: '2026-10-18T08:00:00', dueAt: '2026-10-28T17:00:00', listed: true, portalType: 'guidance', views: 702, replies: 1, attachments: ['de-an-cho-thue.docx'] },
  { id: 'd-ast-pub', code: 'CSTC-2026-001328', question: 'Thủ tục thanh lý tài sản công là xe ô tô chuyên dùng?', topicId: 'public-assets', senderId: 'p-q1', status: 'published', assigneeId: 'u-spec-hong', receivedAt: '2026-09-20T10:00:00', dueAt: '2026-09-27T17:00:00', portalType: 'procedure', views: 980, replies: 2 },
  { id: 'd-ast-new', code: 'CSTC-2026-001329', question: 'Hướng dẫn xử lý tài sản công khi sắp xếp lại trụ sở làm việc?', topicId: 'public-assets', senderId: 'p-binh', status: 'new', channel: 'paper', receivedAt: '2026-10-20T08:10:00', dueAt: '2026-10-27T17:00:00' },
  {
    id: 'd-bud-collab-done',
    code: 'CSTC-2026-001330',
    question: 'Thủ tục đăng ký mã số đơn vị có quan hệ với ngân sách?',
    topicId: 'budget',
    senderId: 'p-so-hn',
    status: 'processing',
    assigneeId: 'u-spec-mai',
    receivedAt: '2026-10-05T09:00:00',
    dueAt: '2026-10-19T17:00:00',
    collab: {
      unitId: 'org-tax',
      unitName: 'Vụ Chính sách thuế',
      note: 'Đã có ý kiến về mã số thuế gắn với mã số đơn vị quan hệ ngân sách.',
      dueAt: '2026-10-12T17:00:00',
      status: 'done',
    },
  },
  { id: 'd-fin-feed', code: 'CSTC-2026-001331', question: 'Góp ý về giao diện tra cứu hóa đơn điện tử trên cổng Bộ Tài chính?', topicId: 'finance', senderId: 'p-htx', status: 'published', assigneeId: 'u-spec-anh', receivedAt: '2026-10-02T11:00:00', dueAt: '2026-10-09T17:00:00', portalType: 'feedback', views: 430, replies: 2 },
  { id: 'd-binh-rej', code: 'CSTC-2026-001332', question: 'Xin tư vấn tranh chấp hợp đồng mua bán giữa hai doanh nghiệp tư nhân?', topicId: 'other', senderId: 'p-binh', status: 'rejected', channel: 'email', receivedAt: '2026-09-24T09:40:00', dueAt: '2026-10-01T17:00:00', attachments: ['hop-dong-mua-ban.pdf'] },
];

const fmt = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const plusDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();

function timeline(status: DossierStatus, received: string, officerName: string): Dossier['timeline'] {
  const ev = (at: string, title: string, description: string, actor: string, state: 'done' | 'current' | 'pending') => ({
    at: fmt(at),
    title,
    description,
    actor,
    state,
  });
  const t = [ev(received, 'Tiếp nhận câu hỏi', 'Hệ thống đã ghi nhận hồ sơ.', 'Hệ thống', status === 'new' ? 'current' : 'done')];
  if (status === 'new') return t;
  if (status === 'rejected') return [...t, ev(plusDays(received, 2), 'Từ chối tiếp nhận', REJECT, 'Bộ phận tiếp nhận', 'done')];
  t.push(ev(plusDays(received, 1), 'Phân công xử lý', 'Hồ sơ được chuyển đơn vị phụ trách.', 'Bộ phận tiếp nhận', status === 'received' ? 'current' : 'done'));
  if (status === 'received') return t;
  const actor = officerName || 'Chuyên viên';
  t.push(ev(plusDays(received, 2), 'Đang soạn dự thảo', 'Chuyên viên đang nghiên cứu hồ sơ.', actor, status === 'processing' ? 'current' : 'done'));
  if (status === 'processing') return t;
  if (status === 'awaiting-clarification') {
    return [...t, ev(plusDays(received, 3), 'Yêu cầu bổ sung thông tin', 'Cần bổ sung chứng từ liên quan.', actor, 'current')];
  }
  if (status === 'awaiting-collaboration') {
    return [...t, ev(plusDays(received, 3), 'Yêu cầu phối hợp', 'Đang chờ đơn vị phối hợp phản hồi.', actor, 'current')];
  }
  if (status === 'returned') {
    t.push(ev(plusDays(received, 4), 'Trình lãnh đạo duyệt', 'Dự thảo đã trình.', actor, 'done'));
    return [...t, ev(plusDays(received, 5), 'Trả sửa dự thảo', 'Lãnh đạo yêu cầu chỉnh sửa.', 'Lãnh đạo đơn vị', 'current')];
  }
  t.push(ev(plusDays(received, 4), 'Trình lãnh đạo duyệt', 'Dự thảo đang chờ phê duyệt.', actor, status === 'waiting-approval' ? 'current' : 'done'));
  if (status === 'waiting-approval') return t;
  if (status === 'approved') return [...t, ev(plusDays(received, 5), 'Đã phê duyệt', 'Chờ xuất bản công khai.', 'Lãnh đạo đơn vị', 'current')];
  t.push(ev(plusDays(received, 5), 'Đã trả lời', 'Câu trả lời đã được gửi tới người hỏi.', 'Lãnh đạo đơn vị', 'done'));
  if (status === 'published') t.push(ev(plusDays(received, 6), 'Công khai câu trả lời', 'Câu trả lời đã được công bố.', 'Lãnh đạo đơn vị', 'done'));
  if (status === 'closed') t.push(ev(plusDays(received, 7), 'Đóng hồ sơ', 'Hồ sơ đã đóng trên hệ thống.', 'Lãnh đạo đơn vị', 'done'));
  return t;
}

const HAS_ANSWER = new Set<DossierStatus>(['waiting-approval', 'approved', 'answered', 'published', 'closed']);

function build(row: SeedRow): Dossier {
  const party = PARTY_BY_ID.get(row.senderId);
  if (!party) throw new Error(`Người gửi không có trong SEED_PARTIES: ${row.senderId}`);
  const officer = row.assigneeId ? OFFICER_BY_ID.get(row.assigneeId) : undefined;
  if (row.assigneeId && !officer) throw new Error(`Cán bộ không có trong SEED_OFFICERS: ${row.assigneeId}`);
  if (officer && row.unitId && row.unitId !== officer.unitId) {
    throw new Error(`Hồ sơ ${row.id}: đơn vị ${row.unitId} khác đơn vị của ${officer.name}`);
  }
  const unitId = officer?.unitId ?? row.unitId;
  const done = row.status === 'answered' || row.status === 'published';
  const answer = row.status === 'rejected' ? REJECT : HAS_ANSWER.has(row.status) ? ANSWER : '';
  return {
    id: row.id,
    code: row.code,
    question: row.question,
    topicId: row.topicId,
    sender: party.name,
    senderEmail: party.email,
    senderId: party.id,
    organization: party.organization,
    receivedAt: row.receivedAt,
    dueAt: row.dueAt,
    status: row.status,
    priority: row.priority ?? 'normal',
    assignedTo: officer?.name ?? '',
    assigneeId: officer?.id,
    handlingUnitId: unitId,
    intakeChannel: row.channel ?? 'portal',
    listedOnPortal: row.status === 'published' || row.listed === true,
    portalType: row.portalType,
    portalViews: row.views,
    portalReplies: row.replies,
    answer,
    legalBasis: done || HAS_ANSWER.has(row.status) ? LAW : [],
    attachments: row.attachments ?? [],
    isPublic: row.status === 'published',
    ratings: row.rating
      ? [{ id: `rate-${row.id}`, stars: row.rating.stars, comment: row.rating.comment, at: row.receivedAt }]
      : [],
    clarifications: row.clarify
      ? [{ id: `clar-${row.id}`, text: row.clarify, at: row.receivedAt, status: 'open' as const }]
      : [],
    collaborations: row.collab
      ? [
          {
            id: `collab-${row.id}`,
            unitId: row.collab.unitId,
            unitName: row.collab.unitName,
            note: row.collab.note,
            dueAt: row.collab.dueAt,
            status: row.collab.status,
            requestedBy: officer?.name ?? 'Chuyên viên',
            at: row.receivedAt,
          },
        ]
      : [],
    timeline: timeline(row.status, row.receivedAt, officer?.name ?? ''),
  };
}

export const SEED_DOSSIERS: Dossier[] = ROWS.map(build);

/** Sổ văn bản đến — chỉ giữ mã và trạng thái sổ; tiêu đề lấy từ hồ sơ. */
export const INCOMING_LINKS: IncomingLink[] = [
  { id: 'in-001', code: 'VBĐ-2026-0142', dossierId: 'd-001', status: 'distributed' },
  { id: 'in-002', code: 'VBĐ-2026-0158', dossierId: 'd-002', status: 'processing' },
  { id: 'in-003', code: 'VBĐ-2026-0166', dossierId: 'd-ast-new', status: 'new' },
  { id: 'in-004', code: 'VBĐ-2026-0171', dossierId: 'd-140', status: 'done' },
  { id: 'in-005', code: 'VBĐ-2026-0177', dossierId: 'd-cus-proc', status: 'processing' },
];
