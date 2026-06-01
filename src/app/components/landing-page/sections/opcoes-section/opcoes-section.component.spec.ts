import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpcoesSectionComponent } from './opcoes-section.component';

describe('OpcoesSectionComponent', () => {
  let component: OpcoesSectionComponent;
  let fixture: ComponentFixture<OpcoesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpcoesSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OpcoesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter 4 cards de opções', () => {
    expect(component.cards.length).toBe(4);
  });

  it('deve renderizar título da seção', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2?.textContent).toContain('Opções Financeiras');
  });

  it('deve renderizar todos os cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card');
    expect(cards.length).toBe(4);
  });

  it('deve exibir card de CALL', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const callCard = Array.from(cards).find((el: any) => el.textContent.includes('CALL'));
    expect(callCard).toBeTruthy();
  });

  it('deve exibir card de PUT', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const putCard = Array.from(cards).find((el: any) => el.textContent.includes('PUT'));
    expect(putCard).toBeTruthy();
  });

  it('deve exibir card de Racionais', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const racionaisCard = Array.from(cards).find((el: any) => el.textContent.includes('Racionais'));
    expect(racionaisCard).toBeTruthy();
  });

  it('deve exibir card de Cenários de Uso', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card h3');
    const cenarioCard = Array.from(cards).find((el: any) => el.textContent.includes('Cenários'));
    expect(cenarioCard).toBeTruthy();
  });

  it('deve renderizar ícones em cada card', () => {
    const icons = fixture.nativeElement.querySelectorAll('.card-icon');
    expect(icons.length).toBe(4);
  });
});
