import { TestBed } from '@angular/core/testing';
import { Reposiciones } from './reposiciones';

describe('Reposiciones', () => {
  let service: Reposiciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reposiciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
