import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificacaoFormComponent } from './notificacao-form.component';

describe('NotificacaoFormComponent', () => {
  let component: NotificacaoFormComponent;
  let fixture: ComponentFixture<NotificacaoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificacaoFormComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacaoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar onSubmit com dados válidos', () => {
    const onSubmitSpy = spyOn(component, 'onSubmit');
    component.form.setValue({ email: 'test@email.com' });
    component.form.markAsDirty();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    expect(onSubmitSpy).toHaveBeenCalledWith({ email: 'test@email.com' });
  });
});
