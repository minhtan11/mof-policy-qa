import { Injectable, signal } from '@angular/core';
import { ORGANIZATIONS } from './domain-fixtures';
import { OrganizationUnit } from '../models/domain.models';

/** UC-009..UC-017 — cây đơn vị mock */
@Injectable({ providedIn: 'root' })
export class OrganizationRepository {
  readonly units = signal<OrganizationUnit[]>(structuredClone(ORGANIZATIONS));

  roots(): OrganizationUnit[] {
    return this.units().filter((unit) => unit.parentId === null);
  }

  children(parentId: string): OrganizationUnit[] {
    return this.units().filter((unit) => unit.parentId === parentId);
  }

  find(id: string): OrganizationUnit | undefined {
    return this.units().find((unit) => unit.id === id);
  }

  nameOf(id: string): string {
    return this.find(id)?.name ?? '—';
  }

  toggle(id: string): void {
    this.units.update((items) =>
      items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );
  }

  add(input: Omit<OrganizationUnit, 'id'>): OrganizationUnit {
    const unit: OrganizationUnit = { ...input, id: crypto.randomUUID() };
    this.units.update((items) => [...items, unit]);
    return unit;
  }
}
