import { Dossier, DossierStatus } from '../models/domain.models';

/**
 * Fixture "Câu hỏi của tôi" — lịch sử hồ sơ của tài khoản demo minhanh@example.vn (UC-110, UC-122).
 * Cộng với d-001 trong DOSSIERS → 24 hồ sơ, phủ đủ 4 nhóm trạng thái người dân thấy
 * (Đang xử lý / Chờ phê duyệt / Đã trả lời / Từ chối) và hạn xử lý quá hạn / sắp đến hạn / còn hạn.
 * Mốc thời gian cố định quanh 20/10/2026 (MY_QUESTIONS_FIXTURE_NOW) để demo + spec ổn định.
 */
export const MY_QUESTIONS_FIXTURE_NOW = new Date('2026-10-20T09:00:00').getTime();
export const MY_QUESTIONS_DEMO_EMAIL = 'minhanh@example.vn';

type Row = [question: string, topicId: string, status: DossierStatus, received: string, due: string, attachments: string[]];

const ROWS: Row[] = [
  ['Hồ sơ khai thuế giá trị gia tăng theo quý cần những chứng từ gì đối với doanh nghiệp nhỏ?', 'tax', 'processing', '2026-10-13T10:15:00', '2026-10-20T17:00:00', ['to-khai-gtgt-q3.pdf']],
  ['Chi phí khấu hao tài sản cố định thuê tài chính có được tính vào chi phí được trừ không?', 'tax', 'received', '2026-10-17T08:40:00', '2026-10-24T17:00:00', []],
  ['Doanh nghiệp nhập khẩu máy móc để tạo tài sản cố định có được miễn thuế nhập khẩu không?', 'customs', 'processing', '2026-10-09T14:00:00', '2026-10-16T17:00:00', ['danh-muc-may-moc.xlsx', 'hop-dong-nhap-khau.pdf']],
  ['Thời hạn nộp báo cáo tình hình sử dụng hóa đơn điện tử là khi nào?', 'tax', 'new', '2026-10-19T16:20:00', '2026-10-26T17:00:00', []],
  ['Quy định về trích lập quỹ phát triển khoa học và công nghệ của doanh nghiệp?', 'finance', 'processing', '2026-10-14T09:30:00', '2026-10-21T17:00:00', []],
  ['Thủ tục điều chỉnh thông tin đăng ký thuế khi doanh nghiệp đổi địa chỉ trụ sở?', 'tax', 'processing', '2026-10-16T11:00:00', '2026-10-23T17:00:00', ['quyet-dinh-doi-tru-so.pdf']],
  ['Đơn vị sự nghiệp công lập cho thuê tài sản công cần lập đề án như thế nào?', 'public-assets', 'waiting-approval', '2026-10-08T08:00:00', '2026-10-15T17:00:00', ['de-an-cho-thue.docx']],
  ['Hướng dẫn hạch toán khoản hỗ trợ lãi suất từ ngân sách nhà nước?', 'budget', 'waiting-approval', '2026-10-12T13:45:00', '2026-10-21T17:00:00', []],
  ['Doanh nghiệp chế xuất bán hàng vào nội địa có phải khai hải quan không?', 'customs', 'waiting-approval', '2026-10-15T10:10:00', '2026-10-22T17:00:00', []],
  ['Điều kiện được hoàn thuế thu nhập doanh nghiệp đã nộp thừa?', 'tax', 'waiting-approval', '2026-10-11T15:00:00', '2026-10-25T17:00:00', ['giay-nop-tien.pdf']],
  ['Quy trình phân bổ dự toán chi thường xuyên cho đơn vị trực thuộc?', 'budget', 'waiting-approval', '2026-10-18T09:00:00', '2026-10-27T17:00:00', []],
  ['Chính sách miễn tiền thuê đất trong thời gian xây dựng cơ bản áp dụng ra sao?', 'public-assets', 'answered', '2026-09-28T09:20:00', '2026-10-05T17:00:00', []],
  ['Cách xác định thuế suất thuế tiêu thụ đặc biệt cho mặt hàng nước giải khát có đường?', 'tax', 'published', '2026-09-22T10:00:00', '2026-09-29T17:00:00', []],
  ['Thủ tục đăng ký sử dụng hóa đơn điện tử có mã của cơ quan thuế?', 'tax', 'published', '2026-09-15T08:30:00', '2026-09-22T17:00:00', ['mau-01-dk-tdtt.pdf']],
  ['Doanh nghiệp được trích lập dự phòng nợ phải thu khó đòi theo tỷ lệ nào?', 'finance', 'answered', '2026-09-10T14:15:00', '2026-09-17T17:00:00', []],
  ['Thời hạn giải quyết hồ sơ hoàn thuế xuất khẩu là bao lâu?', 'customs', 'answered', '2026-09-03T09:00:00', '2026-09-10T17:00:00', []],
  ['Điều kiện để doanh nghiệp khởi nghiệp sáng tạo được hưởng ưu đãi thuế?', 'finance', 'published', '2026-08-26T11:30:00', '2026-09-02T17:00:00', []],
  ['Hướng dẫn quyết toán thuế thu nhập cá nhân cho người lao động nghỉ việc giữa năm?', 'tax', 'answered', '2026-08-18T10:45:00', '2026-08-25T17:00:00', ['bang-luong-2026.xlsx']],
  ['Hồ sơ đề nghị gia hạn nộp thuế do ảnh hưởng thiên tai gồm những gì?', 'tax', 'published', '2026-08-11T08:15:00', '2026-08-18T17:00:00', []],
  ['Đề nghị cung cấp mức lương cụ thể của cán bộ phụ trách hồ sơ thuế?', 'other', 'rejected', '2026-10-06T15:30:00', '2026-10-13T17:00:00', []],
  ['Xin tư vấn tranh chấp hợp đồng mua bán giữa hai doanh nghiệp tư nhân?', 'other', 'rejected', '2026-09-24T09:40:00', '2026-10-01T17:00:00', ['hop-dong-mua-ban.pdf']],
  ['Đề nghị xóa nợ thuế cho doanh nghiệp đang hoạt động bình thường?', 'tax', 'rejected', '2026-09-08T13:00:00', '2026-09-15T17:00:00', []],
  ['Câu hỏi trùng nội dung hồ sơ CSTC-2026-001150 về hoàn thuế GTGT?', 'tax', 'rejected', '2026-08-29T10:20:00', '2026-09-05T17:00:00', []],
];

const ANSWER =
  'Căn cứ quy định hiện hành, Bộ Tài chính đã có văn bản hướng dẫn chi tiết. Đề nghị Quý doanh nghiệp đối chiếu hồ sơ với các điều kiện nêu trong văn bản và liên hệ cơ quan thuế quản lý trực tiếp nếu cần hỗ trợ thêm.';
const REJECT = 'Nội dung không thuộc phạm vi trả lời chính sách của Bộ Tài chính hoặc trùng với hồ sơ đã có. Đề nghị Quý bạn tham khảo hướng dẫn gửi câu hỏi.';

const fmt = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const plusDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();

function timeline(status: DossierStatus, received: string): Dossier['timeline'] {
  const ev = (at: string, title: string, description: string, actor: string, state: 'done' | 'current' | 'pending') => ({ at: fmt(at), title, description, actor, state });
  const t = [ev(received, 'Tiếp nhận câu hỏi', 'Hệ thống đã ghi nhận hồ sơ của bạn.', 'Hệ thống', status === 'new' ? 'current' : 'done')];
  if (status === 'new') return t;
  if (status === 'rejected') return [...t, ev(plusDays(received, 2), 'Từ chối tiếp nhận', REJECT, 'Bộ phận tiếp nhận', 'done')];
  t.push(ev(plusDays(received, 1), 'Phân công xử lý', 'Hồ sơ được chuyển chuyên viên phụ trách.', 'Bộ phận tiếp nhận', status === 'received' ? 'current' : 'done'));
  if (status === 'received') return t;
  t.push(ev(plusDays(received, 2), 'Đang soạn dự thảo', 'Chuyên viên đang nghiên cứu hồ sơ.', 'Lê Quốc Hưng', status === 'processing' ? 'current' : 'done'));
  if (status === 'processing') return t;
  t.push(ev(plusDays(received, 4), 'Trình lãnh đạo duyệt', 'Dự thảo đang chờ phê duyệt.', 'Lê Quốc Hưng', status === 'waiting-approval' ? 'current' : 'done'));
  if (status === 'waiting-approval') return t;
  t.push(ev(plusDays(received, 5), 'Đã trả lời', 'Câu trả lời đã được gửi tới email của bạn.', 'Phạm Đức Long', 'done'));
  if (status === 'published') t.push(ev(plusDays(received, 6), 'Công khai câu trả lời', 'Câu trả lời đã được công bố.', 'Phạm Đức Long', 'done'));
  return t;
}

export const MY_QUESTIONS_FIXTURES: Dossier[] = ROWS.map(([question, topicId, status, receivedAt, dueAt, attachments], i) => {
  const done = status === 'answered' || status === 'published';
  return {
    id: `mq-${String(i + 1).padStart(3, '0')}`,
    code: `CSTC-2026-${String(1250 - i * 7).padStart(6, '0')}`,
    question,
    topicId,
    sender: 'Nguyễn Minh Anh',
    senderEmail: MY_QUESTIONS_DEMO_EMAIL,
    organization: 'Công ty CP An Phát',
    receivedAt,
    dueAt,
    status,
    priority: i % 5 === 0 ? ('high' as const) : ('normal' as const),
    assignedTo: status === 'new' || status === 'rejected' ? '' : 'Lê Quốc Hưng',
    answer: done ? ANSWER : status === 'rejected' ? REJECT : '',
    legalBasis: done ? ['Luật Quản lý thuế số 38/2019/QH14'] : [],
    attachments,
    isPublic: status === 'published',
    ratings: [],
    clarifications: [],
    timeline: timeline(status, receivedAt),
  };
});
