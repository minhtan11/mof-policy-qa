import { Notice, PortalUser, Topic } from '../models/domain.models';
import { SEED_DOSSIERS } from './dossier-seed';

const TOPIC_BASE: Omit<Topic, 'count'>[] = [
  { id: 'tax', name: 'Thuế', description: 'Thuế nội địa, thuế xuất nhập khẩu và hóa đơn.', icon: 'pi-receipt' },
  { id: 'budget', name: 'Ngân sách nhà nước', description: 'Quản lý, phân bổ và quyết toán ngân sách.', icon: 'pi-wallet' },
  { id: 'customs', name: 'Hải quan', description: 'Thủ tục hải quan, xuất nhập khẩu.', icon: 'pi-box' },
  { id: 'finance', name: 'Tài chính doanh nghiệp', description: 'Chính sách tài chính đối với doanh nghiệp.', icon: 'pi-building' },
  { id: 'public-assets', name: 'Tài sản công', description: 'Quản lý, sử dụng tài sản công.', icon: 'pi-briefcase' },
  { id: 'other', name: 'Lĩnh vực khác', description: 'Các chính sách tài chính khác.', icon: 'pi-compass' },
];

/** Số hồ sơ theo lĩnh vực đếm từ bảng hồ sơ, không gắn sẵn. */
export const TOPICS: Topic[] = TOPIC_BASE.map((topic) => ({
  ...topic,
  count: SEED_DOSSIERS.filter((d) => d.topicId === topic.id).length,
}));

export const USERS: PortalUser[] = [
  { id: 'u-public', username: 'minhanh', name: 'Nguyễn Minh Anh', email: 'minhanh@example.vn', organization: 'Công ty CP An Phát', role: 'public', avatar: 'MA' },
  { id: 'u-reception', username: 'ha.tt', name: 'Trần Thu Hà', email: 'ha.tt@moj.gov.vn', organization: 'Văn phòng Bộ', organizationId: 'org-vp', role: 'reception', avatar: 'TH' },
  { id: 'u-specialist', username: 'hung.lq', name: 'Lê Quốc Hưng', email: 'hung.lq@moj.gov.vn', organization: 'Vụ Chính sách thuế', organizationId: 'org-tax', role: 'specialist', avatar: 'LH' },
  { id: 'u-leader', username: 'long.pd', name: 'Phạm Đức Long', email: 'long.pd@moj.gov.vn', organization: 'Vụ Chính sách thuế', organizationId: 'org-tax', role: 'leader', avatar: 'PL' },
  { id: 'u-coordinator', username: 'ngoc.db', name: 'Đỗ Bích Ngọc', email: 'ngoc.db@moj.gov.vn', organization: 'Tổ điều phối', organizationId: 'org-coord', role: 'coordinator', avatar: 'BN' },
  { id: 'u-admin', username: 'admin', name: 'Quản trị hệ thống', email: 'admin@moj.gov.vn', organization: 'Trung tâm CNTT', organizationId: 'org-ict', role: 'system-admin', avatar: 'QT' },
  { id: 'u-spec-khoa', username: 'khoa.tm', name: 'Trần Minh Khoa', email: 'khoa.tm@mof.gov.vn', organization: 'Vụ Chính sách thuế', organizationId: 'org-tax', role: 'specialist', avatar: 'TK' },
  { id: 'u-spec-mai', username: 'mai.nt', name: 'Nguyễn Thị Mai', email: 'mai.nt@mof.gov.vn', organization: 'Vụ Ngân sách nhà nước', organizationId: 'org-budget', role: 'specialist', avatar: 'NM' },
  { id: 'u-leader-budget', username: 'nam.hv', name: 'Hoàng Văn Nam', email: 'nam.hv@mof.gov.vn', organization: 'Vụ Ngân sách nhà nước', organizationId: 'org-budget', role: 'leader', avatar: 'HN' },
  { id: 'u-spec-trang', username: 'trang.pt', name: 'Phạm Thu Trang', email: 'trang.pt@mof.gov.vn', organization: 'Vụ Chính sách hải quan', organizationId: 'org-customs', role: 'specialist', avatar: 'PT' },
  { id: 'u-spec-anh', username: 'anh.vd', name: 'Vũ Đức Anh', email: 'anh.vd@mof.gov.vn', organization: 'Vụ Tài chính doanh nghiệp', organizationId: 'org-finance', role: 'specialist', avatar: 'VA' },
  { id: 'u-spec-hong', username: 'hong.lt', name: 'Lê Thị Hồng', email: 'hong.lt@mof.gov.vn', organization: 'Cục Quản lý công sản', organizationId: 'org-assets', role: 'specialist', avatar: 'HO' },
];

export const NOTICES: Notice[] = [
  { id: 'n1', title: 'Hướng dẫn gửi câu hỏi chính sách tài chính', body: 'Chuẩn bị đầy đủ thông tin, tài liệu liên quan để cơ quan chuyên môn hỗ trợ nhanh chóng.', date: '15/10/2026', category: 'guide' },
  { id: 'n2', title: 'Bộ Tài chính công bố danh mục thủ tục hành chính mới', body: 'Danh mục được cập nhật trên Cổng thông tin điện tử.', date: '11/10/2026', category: 'notice' },
  { id: 'n3', title: 'Các câu hỏi thường gặp về kê khai thuế', body: 'Tổng hợp hướng dẫn dành cho người nộp thuế.', date: '08/10/2026', category: 'news' },
];
