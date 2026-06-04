import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { CarteiraComponent } from './carteira.component';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';

describe('CarteiraComponent', () => {
  let component: CarteiraComponent;
  let fixture: ComponentFixture<CarteiraComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteiraComponent, HeaderMenuComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CarteiraComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar o header menu', () => {
    const headerMenu = fixture.nativeElement.querySelector('app-header-menu');
    expect(headerMenu).toBeTruthy();
  });

  it('deve exibir título "Gerenciar Carteiras"', () => {
    const title = fixture.nativeElement.querySelector('mat-card-title');
    expect(title?.textContent).toContain('Gerenciar Carteiras');
  });

  it('deve exibir botão Criar Nova Carteira', () => {
    const button = fixture.nativeElement.querySelector('.create-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Criar Nova Carteira');
  });

  it('deve navegar para /carteira/criar ao clicar no botão', () => {
    spyOn(router, 'navigate');
    component.criarNovaCarteira();
    expect(router.navigate).toHaveBeenCalledWith(['/carteira/criar']);
  });

  it('deve exibir descrição', () => {
    const description = fixture.nativeElement.querySelector('.description');
    expect(description).toBeTruthy();
    expect(description?.textContent).toContain('Crie e gerencie suas carteiras');
  });
});
