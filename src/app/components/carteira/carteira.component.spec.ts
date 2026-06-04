import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CarteiraComponent } from './carteira.component';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { CarteiraApiService } from '../../services/carteira-api.service';
import { Carteira } from '../../models/carteira.model';
import { StatusCarteira } from '../../models/status-carteira.enum';

describe('CarteiraComponent', () => {
  let component: CarteiraComponent;
  let fixture: ComponentFixture<CarteiraComponent>;
  let router: Router;
  let apiService: jasmine.SpyObj<CarteiraApiService>;

  const mockCarteiras: Carteira[] = [
    {
      id: '1',
      nome: 'Carteira1',
      status: StatusCarteira.ATIVA,
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    },
    {
      id: '2',
      nome: 'Carteira2',
      status: StatusCarteira.ATIVA,
      createdAt: '2024-01-02T00:00:00',
      updatedAt: '2024-01-02T00:00:00'
    }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('CarteiraApiService', ['listarCarteirasAtivas']);
    apiSpy.listarCarteirasAtivas.and.returnValue(of(mockCarteiras));

    await TestBed.configureTestingModule({
      imports: [
        CarteiraComponent,
        HeaderMenuComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CarteiraApiService, useValue: apiSpy },
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarteiraComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    apiService = TestBed.inject(CarteiraApiService) as jasmine.SpyObj<CarteiraApiService>;
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

  it('deve carregar carteiras ativas ao inicializar', () => {
    expect(apiService.listarCarteirasAtivas).toHaveBeenCalled();
    expect(component.carteiras).toEqual(mockCarteiras);
  });

  it('deve exibir tabela de carteiras quando há carteiras carregadas', () => {
    fixture.detectChanges();
    const tabela = fixture.nativeElement.querySelector('.tabela-container');
    expect(tabela).toBeTruthy();
  });

  it('deve exibir mensagem de erro quando ocorre erro ao carregar', () => {
    apiService.listarCarteirasAtivas.and.returnValue(throwError(() => new Error('Erro')));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.erro).toBeTruthy();
  });

  it('deve navegar para /carteira/:id/adicionar-opcao ao clicar em Adicionar Opções', () => {
    spyOn(router, 'navigate');
    component.adicionarOpcoes('1');
    expect(router.navigate).toHaveBeenCalledWith(['/carteira', '1', 'adicionar-opcao']);
  });

  it('deve ter colunas da tabela configuradas corretamente', () => {
    expect(component.colunasTabela).toEqual(['nome', 'status', 'acoes']);
  });
});
