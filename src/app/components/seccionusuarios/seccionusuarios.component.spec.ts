import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionusuariosComponent } from './seccionusuarios.component';

describe('SeccionusuariosComponent', () => {
  let component: SeccionusuariosComponent;
  let fixture: ComponentFixture<SeccionusuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionusuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionusuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
