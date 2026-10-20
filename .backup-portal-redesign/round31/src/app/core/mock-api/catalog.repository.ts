import { Injectable, signal } from '@angular/core';
import { CATALOG_ENTRIES } from './domain-fixtures';
import { CatalogEntry } from '../models/domain.models';

/** UC-060..UC-074 — danh mục nghiệp vụ */
@Injectable({ providedIn: 'root' })
export class CatalogRepository {
  readonly entries = signal<CatalogEntry[]>(structuredClone(CATALOG_ENTRIES));

  byType(type: CatalogEntry['type']): CatalogEntry[] {
    return this.entries()
      .filter((entry) => entry.type === type)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  activeByType(type: CatalogEntry['type']): CatalogEntry[] {
    return this.byType(type).filter((entry) => entry.active);
  }

  toggle(id: string): void {
    this.entries.update((items) =>
      items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );
  }

  add(entry: Omit<CatalogEntry, 'id'>): CatalogEntry {
    const value: CatalogEntry = { ...entry, id: crypto.randomUUID() };
    this.entries.update((items) => [value, ...items]);
    return value;
  }
}
