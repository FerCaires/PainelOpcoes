import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraficoBarrasResumoComponent } from './grafico-barras-resumo.component';

describe('GraficoBarrasResumoComponent', () => {
  let fixture: ComponentFixture<GraficoBarrasResumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoBarrasResumoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GraficoBarrasResumoComponent);
    fixture.componentRef.setInput('titulo', 'Lucro por mês');
    fixture.componentRef.setInput('itens', [{ rotulo: '2025-08', valor: 45.93 }]);
    fixture.detectChanges();
  });

  it('renderiza SVG com aria-label do título e o rótulo da série', () => {
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

    expect(svg).toBeTruthy();
    expect(svg.getAttribute('aria-label')).toContain('Lucro por mês');
    expect(fixture.nativeElement.textContent).toContain('08/25');
    expect(fixture.nativeElement.textContent).toContain('Lucro por mês');
  });
});
