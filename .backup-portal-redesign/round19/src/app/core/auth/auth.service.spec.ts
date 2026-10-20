import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => { let service: AuthService; beforeEach(() => { localStorage.clear(); TestBed.configureTestingModule({}); service = TestBed.inject(AuthService); }); it('creates a role-aware demo session', () => { service.loginAs('specialist'); expect(service.user()?.role).toBe('specialist'); expect(service.isInternal()).toBe(true); }); });
