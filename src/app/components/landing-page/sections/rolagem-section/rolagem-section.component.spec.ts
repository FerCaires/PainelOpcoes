import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolagemSectionComponent } from './rolagem-section.component';

describe('RolagemSectionComponent', () => {
  let component: RolagemSectionComponent;
  let fixture: ComponentFixture<RolagemSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolagemSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RolagemSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter 6 cards de rolagem', () => {
    expect(component.cards.length).toBe(6);
  });

  it('deve renderizar título da seção', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2?.textContent).toContain('Rolagem de Posições');
  });

  it('deve renderizar todos os cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card');
    expect(cards.length).toBe(6);
  });

  it('deve exibir card de Conceito de Rolagem', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const conceptCard = Array.from(cards).find((el: any) => el.textContent.includes('Conceito'));
    expect(conceptCard).toBeTruthy();
  });

  it('deve exibir card de Rolagem Vertical', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const verticalCard = Array.from(cards).find((el: any) => el.textContent.includes('Vertical'));
    expect(verticalCard).toBeTruthy();
  });

  it('deve exibir card de Rolagem Horizontal', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const horizontalCard = Array.from(cards).find((el: any) => el.textContent.includes('Horizontal'));
    expect(horizontalCard).toBeTruthy();
  });

  it('deve exibir card de Rolagem Diagonal', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const diagonalCard = Array.from(cards).find((el: any) => el.textContent.includes('Diagonal'));
    expect(diagonalCard).toBeTruthy();
  });

  it('deve exibir card de Benefícios', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const benefitsCard = Array.from(cards).find((el: any) => el.textContent.includes('Benefícios'));
    expect(benefitsCard).toBeTruthy();
  });

  it('deve exibir card de Riscos', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const risksCard = Array.from(cards).find((el: any) => el.textContent.includes('Riscos'));
    expect(risksCard).toBeTruthy();
  });

  it('deve renderizar ícones em cada card', () => {
    const icons = fixture.nativeElement.querySelectorAll('.card-icon');
    expect(icons.length).toBe(6);
  });
});
