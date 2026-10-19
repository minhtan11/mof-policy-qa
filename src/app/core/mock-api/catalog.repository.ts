import { Injectable, signal } from '@angular/core';
import { CATALOG_ENTRIES } from './domain-fixtures';
import { CatalogEntry } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class CatalogRepository {
  readonly entries = signal<CatalogEntry[]>(structuredClone(CATALOG_ENTRIES));
  byType(type: CatalogEntry['type']): CatalogEntry[] { return this.entries().filter((entry) => entry.type === type).sort((a, b) => a.sortOrder - b.sortOrder); }
  toggle(id: string): void { this.entries.update((items) => items.map((item) => item.id === id ? { ...item, active: !item.active } : item)); }
  add(entry: Omit<CatalogEntry, 'id'>): void { this.entries.update((items) => [{ ...entry, id: crypto.randomUUID() }, ...items]); }
}
