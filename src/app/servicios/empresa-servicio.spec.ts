import { TestBed } from '@angular/core/testing';

import { EmpresaServicio } from './empresa-servicio';

describe('EmpresaServicio', () => {
  let service: EmpresaServicio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpresaServicio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
