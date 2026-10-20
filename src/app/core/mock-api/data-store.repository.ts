import { Injectable, inject } from '@angular/core';
import { LegalDocumentRepository } from './legal-document.repository';
import { MockDbService } from './mock-db.service';
import { OpsRepository } from './ops.repository';

export interface DataStoreHealth {
  dossierTotal: number;
  dossierOpen: number;
  dossierPublished: number;
  legalDocs: number;
  legalEffective: number;
  lastBackupLabel: string;
  lastBackupAt: string;
  lastBackupSize: string;
  jobOk: number;
  jobTotal: number;
}

/** Kho dữ liệu / sức khỏe chỉ mục — thống kê từ MockDb + Ops. */
@Injectable({ providedIn: 'root' })
export class DataStoreRepository {
  private readonly db = inject(MockDbService);
  private readonly legal = inject(LegalDocumentRepository);
  private readonly ops = inject(OpsRepository);

  health(): DataStoreHealth {
    const dossiers = this.db.dossiers();
    const laws = this.legal.documents();
    const backups = this.ops.backups();
    const last = backups[0];
    const jobs = this.ops.jobs();
    return {
      dossierTotal: dossiers.length,
      dossierOpen: dossiers.filter((d) => !['answered', 'published', 'closed', 'rejected'].includes(d.status)).length,
      dossierPublished: dossiers.filter((d) => d.status === 'published').length,
      legalDocs: laws.length,
      legalEffective: laws.filter((l) => l.status === 'effective').length,
      lastBackupLabel: last?.label ?? '—',
      lastBackupAt: last?.createdAt ?? '',
      lastBackupSize: last?.sizeLabel ?? '—',
      jobOk: jobs.filter((j) => j.status === 'success').length,
      jobTotal: jobs.length,
    };
  }
}
