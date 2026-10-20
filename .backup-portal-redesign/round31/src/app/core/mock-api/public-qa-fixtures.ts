/**
 * Fixture "Kho hỏi đáp" công khai cho /portal/tra-cuu (mock). Ngày mốc cố định để lọc thời gian ổn định trong test.
 * Backend thật thay `PublicQaRepository`.
 */
export type QaStatus = 'processing' | 'pending-approval' | 'answered';
export type QaType = 'policy' | 'procedure' | 'guidance' | 'feedback';

export interface PublicQa {
  id: string;
  code: string;
  title: string;
  topicId: string;
  type: QaType;
  status: QaStatus;
  postedAt: string;
  views: number;
  replies: number;
  /** Trích đoạn trả lời (khi đã trả lời). */
  answer?: string;
  /** Ghi chú trạng thái (đang xử lý / chờ phê duyệt). */
  note?: string;
}

export const QA_FIXTURE_NOW = '2026-10-20T12:00:00+07:00';
export const QA_TYPES: QaType[] = ['policy', 'procedure', 'guidance', 'feedback'];
export const QA_STATUSES: QaStatus[] = ['processing', 'answered', 'pending-approval'];

type Row = [string, string, QaType, QaStatus, number, number, number, string?];
// [tiêu đề, lĩnh vực, loại, trạng thái, số ngày trước mốc, lượt xem, phản hồi, trả lời/ghi chú]
const ROWS: Row[] = [
  ['Hướng dẫn hoàn thuế giá trị gia tăng đối với dự án đầu tư mới', 'tax', 'procedure', 'answered', 1, 4821, 12, 'Doanh nghiệp có dự án đầu tư mới được hoàn thuế GTGT khi số thuế đầu vào chưa khấu trừ từ 300 triệu đồng trở lên, hồ sơ nộp qua cổng thuế điện tử theo mẫu 01/ĐNHT.'],
  ['Thời hạn nộp hồ sơ khai thuế thu nhập cá nhân năm 2026', 'tax', 'policy', 'answered', 2, 6230, 18, 'Hạn chót nộp hồ sơ quyết toán thuế TNCN đối với cá nhân trực tiếp quyết toán là ngày cuối cùng của tháng thứ 4 kể từ ngày kết thúc năm dương lịch.'],
  ['Thủ tục điều chỉnh dự toán ngân sách cấp xã giữa năm', 'budget', 'procedure', 'processing', 2, 812, 3, 'Hồ sơ đang được Vụ Ngân sách nhà nước xem xét, dự kiến trả lời trong 5 ngày làm việc.'],
  ['Chính sách miễn giảm tiền thuê đất cho doanh nghiệp nhỏ và vừa', 'finance', 'policy', 'pending-approval', 3, 1544, 5, 'Dự thảo trả lời đã hoàn thành, đang chờ lãnh đạo Vụ phê duyệt trước khi công khai.'],
  ['Quy định về hóa đơn điện tử khi bán hàng qua sàn thương mại điện tử', 'tax', 'guidance', 'answered', 4, 7312, 21, 'Người bán phải lập hóa đơn điện tử cho từng lần bán hàng; sàn TMĐT có trách nhiệm cung cấp thông tin người bán cho cơ quan thuế theo Nghị định 123/2020/NĐ-CP.'],
  ['Thủ tục khai báo hải quan đối với hàng mẫu nhập khẩu', 'customs', 'procedure', 'answered', 5, 2210, 7, 'Hàng mẫu không thanh toán được khai trên tờ khai hải quan điện tử, miễn kiểm tra chuyên ngành nếu trị giá dưới mức quy định.'],
  ['Mức thu lệ phí trước bạ đối với ô tô điện chạy pin', 'tax', 'policy', 'processing', 6, 3105, 9, 'Đang lấy ý kiến Tổng cục Thuế về thời điểm áp dụng mức ưu đãi mới.'],
  ['Phân cấp quản lý tài sản công tại đơn vị sự nghiệp công lập', 'public-assets', 'policy', 'answered', 8, 1290, 4, 'Thủ trưởng đơn vị sự nghiệp công lập quyết định mua sắm tài sản trong phạm vi dự toán được giao theo Nghị định 151/2017/NĐ-CP.'],
  ['Hướng dẫn quyết toán vốn đầu tư công dự án hoàn thành', 'budget', 'guidance', 'answered', 9, 2678, 6, 'Chủ đầu tư lập báo cáo quyết toán trong 6 tháng kể từ ngày ký biên bản bàn giao đối với dự án nhóm B.'],
  ['Kiến nghị đơn giản hóa thủ tục hoàn thuế xuất khẩu', 'customs', 'feedback', 'pending-approval', 10, 640, 2, 'Kiến nghị đã được tổng hợp, chờ phê duyệt phương án trả lời.'],
  ['Điều kiện được khấu trừ chi phí lãi vay khi tính thuế TNDN', 'finance', 'guidance', 'answered', 12, 3920, 11, 'Chi phí lãi vay được trừ không vượt quá 30% tổng lợi nhuận thuần cộng chi phí lãi vay và khấu hao trong kỳ.'],
  ['Thủ tục xin gia hạn nộp thuế do thiên tai', 'tax', 'procedure', 'processing', 13, 905, 2, 'Đang xác minh hồ sơ thiệt hại kèm theo.'],
  ['Quy định về công khai ngân sách đối với đơn vị dự toán', 'budget', 'policy', 'answered', 15, 1488, 3, 'Đơn vị dự toán công khai dự toán, quyết toán bằng hình thức niêm yết và đăng trên trang thông tin điện tử trong 15 ngày kể từ ngày được giao.'],
  ['Hướng dẫn xử lý tài sản công khi sắp xếp lại trụ sở', 'public-assets', 'guidance', 'pending-approval', 18, 702, 1, 'Phương án trả lời đang chờ phê duyệt.'],
  ['Thuế suất ưu đãi đặc biệt theo Hiệp định CPTPP năm 2026', 'customs', 'policy', 'answered', 21, 5104, 14, 'Biểu thuế ưu đãi đặc biệt CPTPP giai đoạn 2022–2027 áp dụng theo Nghị định 115/2022/NĐ-CP, cần chứng nhận xuất xứ hợp lệ.'],
  ['Góp ý về giao diện tra cứu hóa đơn điện tử', 'other', 'feedback', 'answered', 25, 430, 2, 'Cảm ơn góp ý; tính năng tìm theo mã số thuế người mua đã được bổ sung.'],
  ['Thủ tục đăng ký mã số đơn vị có quan hệ với ngân sách', 'budget', 'procedure', 'answered', 33, 1876, 5, 'Đơn vị nộp tờ khai mẫu 01-MSNS qua Dịch vụ công trực tuyến của Bộ Tài chính, thời hạn cấp mã 2 ngày làm việc.'],
  ['Chính sách hỗ trợ tài chính cho hợp tác xã nông nghiệp', 'finance', 'policy', 'processing', 40, 1120, 3, 'Đang phối hợp với Bộ Nông nghiệp và Môi trường để trả lời.'],
  ['Hướng dẫn kê khai thuế đối với hoạt động cho thuê nhà', 'tax', 'guidance', 'answered', 52, 8450, 26, 'Cá nhân cho thuê nhà có doanh thu trên 100 triệu đồng/năm khai thuế theo từng hợp đồng hoặc theo năm, thuế suất GTGT 5% và TNCN 5%.'],
  ['Thủ tục thanh lý tài sản công là xe ô tô chuyên dùng', 'public-assets', 'procedure', 'answered', 70, 980, 2, 'Cơ quan có thẩm quyền quyết định thanh lý theo hình thức đấu giá, số tiền thu được nộp vào tài khoản tạm giữ.'],
  ['Phản ánh chậm trả lời hồ sơ hoàn thuế', 'tax', 'feedback', 'processing', 95, 520, 1, 'Đã chuyển Cục Thuế địa phương kiểm tra và báo cáo.'],
  ['Quy định về kiểm tra sau thông quan', 'customs', 'policy', 'answered', 130, 2390, 6, 'Kiểm tra sau thông quan được thực hiện trong thời hạn 5 năm kể từ ngày đăng ký tờ khai hải quan.'],
  ['Hướng dẫn trích lập quỹ phát triển khoa học công nghệ', 'finance', 'guidance', 'answered', 200, 1610, 4, 'Doanh nghiệp được trích tối đa 10% thu nhập tính thuế trước khi tính thuế TNDN để lập quỹ.'],
  ['Định mức chi hội nghị, công tác phí năm 2026', 'budget', 'policy', 'answered', 400, 9020, 31, 'Mức chi áp dụng theo Thông tư 40/2017/TT-BTC và các văn bản sửa đổi, bổ sung.'],
];

const DAY = 86_400_000;
export const PUBLIC_QA: PublicQa[] = ROWS.map(([title, topicId, type, status, ago, views, replies, text], i) => ({
  id: `qa-${i + 1}`,
  code: `CSTC-2026-${String(140 - i).padStart(6, '0')}`,
  title,
  topicId,
  type,
  status,
  postedAt: new Date(new Date(QA_FIXTURE_NOW).getTime() - ago * DAY).toISOString(),
  views,
  replies,
  ...(status === 'answered' ? { answer: text } : { note: text }),
}));
