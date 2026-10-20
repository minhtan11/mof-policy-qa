import { Injectable, inject, signal } from '@angular/core';
import { AI_MODELS, BACKUP_SNAPSHOTS, OPS_JOBS } from './domain-fixtures';
import { AiModelInfo, BackupSnapshot, OpsJob } from '../models/domain.models';
import { MockDbService } from './mock-db.service';

/** UC-084..UC-099 — vận hành mock: job, backup, reset seed, AI ops */
@Injectable({ providedIn: 'root' })
export class OpsRepository {
  private readonly db = inject(MockDbService);
  readonly jobs = signal<OpsJob[]>(structuredClone(OPS_JOBS));
  readonly backups = signal<BackupSnapshot[]>(structuredClone(BACKUP_SNAPSHOTS));
  readonly models = signal<AiModelInfo[]>(structuredClone(AI_MODELS));

  runJob(id: string): boolean {
    const target = this.jobs().find((item) => item.id === id);
    if (!target) {
      return false;
    }
    this.jobs.update((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: 'running', lastRunAt: new Date().toISOString() }
          : item,
      ),
    );
    window.setTimeout(() => {
      this.jobs.update((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: 'success', lastRunAt: new Date().toISOString() } : item,
        ),
      );
    }, 600);
    return true;
  }

  createBackup(label: string): BackupSnapshot {
    const snapshot: BackupSnapshot = {
      id: crypto.randomUUID(),
      label: label.trim() || `Backup ${new Date().toLocaleString('vi-VN')}`,
      createdAt: new Date().toISOString(),
      sizeLabel: `${120 + this.backups().length * 4} KB`,
    };
    this.backups.update((items) => [snapshot, ...items]);
    return snapshot;
  }

  resetSeed(): void {
    this.db.resetSeed();
    this.jobs.set(structuredClone(OPS_JOBS));
    this.backups.set(structuredClone(BACKUP_SNAPSHOTS));
    this.models.set(structuredClone(AI_MODELS));
  }

  setModelStatus(id: string, status: AiModelInfo['status']): boolean {
    if (!this.models().some((item) => item.id === id)) {
      return false;
    }
    this.models.update((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    return true;
  }
}
