import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingPageComponent } from './landing-page.component';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { OpcoesSectionComponent } from './sections/opcoes-section/opcoes-section.component';
import { RolagemSectionComponent } from './sections/rolagem-section/rolagem-section.component';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        HeaderMenuComponent,
        OpcoesSectionComponent,
        RolagemSectionComponent,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
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

  it('deve renderizar a seção de opções', () => {
    const opcoesSection = fixture.nativeElement.querySelector('app-opcoes-section');
    expect(opcoesSection).toBeTruthy();
  });

  it('deve renderizar a seção de rolagem', () => {
    const rolagemSection = fixture.nativeElement.querySelector('app-rolagem-section');
    expect(rolagemSection).toBeTruthy();
  });

  it('deve exibir título principal', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Painel de Opções');
  });

  it('deve exibir subtítulo', () => {
    const p = fixture.nativeElement.querySelector('.hero-content p');
    expect(p?.textContent).toContain('Aprenda sobre opções financeiras');
  });
});
