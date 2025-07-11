import { TestBed } from '@angular/core/testing';

import { NoticiaServicio } from './noticia-servicio';

describe('NoticiaServicio', () => {
  let service: NoticiaServicio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoticiaServicio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
