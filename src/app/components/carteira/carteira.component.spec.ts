import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CarteiraComponent } from './carteira.component';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';

describe('CarteiraComponent', () => {
  let component: CarteiraComponent;
  let fixture: ComponentFixture<CarteiraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteiraComponent, HeaderMenuComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CarteiraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar o header menu', () => {
    const headerMenu = fixture.nativeElement.querySelector('app-header-menu');
    expect(headerMenu).toBeTruthy();
  });

  it('deve exibir título "Carteira"', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Carteira');
  });

  it('deve exibir mensagem de desenvolvimento', () => {
    const paragraphs = fixture.nativeElement.querySelectorAll('p');
    const devMessage = Array.from(paragraphs).find((el: any) => el.textContent.includes('desenvolvimento'));
    expect(devMessage).toBeTruthy();
  });

  it('deve exibir ícone de carteira', () => {
    const icon = fixture.nativeElement.querySelector('.placeholder-icon');
    expect(icon?.textContent).toContain('💼');
  });

  it('deve renderizar placeholder-content', () => {
    const placeholder = fixture.nativeElement.querySelector('.placeholder-content');
    expect(placeholder).toBeTruthy();
  });
});
