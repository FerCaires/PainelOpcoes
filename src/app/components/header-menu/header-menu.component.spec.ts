import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderMenuComponent } from './header-menu.component';

describe('HeaderMenuComponent', () => {
  let component: HeaderMenuComponent;
  let fixture: ComponentFixture<HeaderMenuComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMenuComponent],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate'), url: '/' }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderMenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter 3 itens de menu', () => {
    expect(component.menuItems.length).toBe(3);
  });

  it('deve renderizar logo', () => {
    const logo = fixture.nativeElement.querySelector('.logo');
    expect(logo).toBeTruthy();
  });

  it('deve renderizar todos os links de menu', () => {
    const links = fixture.nativeElement.querySelectorAll('.nav-link');
    expect(links.length).toBe(3);
  });

  it('deve ter link Home', () => {
    const links = fixture.nativeElement.querySelectorAll('.nav-link');
    const homeLink = Array.from(links).find((el: any) => el.textContent.includes('Home'));
    expect(homeLink).toBeTruthy();
  });

  it('deve ter link Busca de Rolagens', () => {
    const links = fixture.nativeElement.querySelectorAll('.nav-link');
    const searchLink = Array.from(links).find((el: any) => el.textContent.includes('Busca'));
    expect(searchLink).toBeTruthy();
  });

  it('deve ter link Carteira', () => {
    const links = fixture.nativeElement.querySelectorAll('.nav-link');
    const walletLink = Array.from(links).find((el: any) => el.textContent.includes('Carteira'));
    expect(walletLink).toBeTruthy();
  });

  it('deve renderizar botão hamburger em mobile', () => {
    const hamburger = fixture.nativeElement.querySelector('.hamburger');
    expect(hamburger).toBeTruthy();
  });

  it('deve abrir/fechar menu ao clicar no hamburger', () => {
    const hamburger = fixture.nativeElement.querySelector('.hamburger');
    expect(component.isMenuOpen()).toBe(false);

    hamburger.click();
    fixture.detectChanges();
    expect(component.isMenuOpen()).toBe(true);

    hamburger.click();
    fixture.detectChanges();
    expect(component.isMenuOpen()).toBe(false);
  });

  it('deve fechar menu ao navegar', () => {
    component.isMenuOpen.set(true);
    fixture.detectChanges();

    component.navigate('/painel-rolagem');
    expect(component.isMenuOpen()).toBe(false);
  });

  it('deve chamar router.navigate ao clicar em link', () => {
    component.navigate('/painel-rolagem');
    expect(router.navigate).toHaveBeenCalledWith(['/painel-rolagem']);
  });

  it('deve ter aria-label no hamburger', () => {
    const hamburger = fixture.nativeElement.querySelector('.hamburger');
    expect(hamburger.getAttribute('aria-label')).toBe('Toggle menu');
  });

  it('deve ter role navigation na nav', () => {
    const nav = fixture.nativeElement.querySelector('.nav');
    expect(nav.getAttribute('role')).toBe('navigation');
  });

  it('deve ter aria-label na nav', () => {
    const nav = fixture.nativeElement.querySelector('.nav');
    expect(nav.getAttribute('aria-label')).toBe('Menu principal');
  });
});
