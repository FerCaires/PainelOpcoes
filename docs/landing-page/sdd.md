# Software Design Document (SDD): landing-page

## 1. Visão Geral

### Objetivo
Documentar a arquitetura técnica da feature landing-page, definindo componentes, roteamento, padrões de código e integrações necessárias para implementação.

### Escopo
- Arquitetura de componentes Angular (standalone)
- Estrutura de roteamento
- Padrões de código TypeScript
- Integrações com componentes existentes (painel-rolagem)
- Acessibilidade e responsividade

### Stack
- **Framework**: Angular 18+ (standalone components)
- **Linguagem**: TypeScript 5.x
- **Estilos**: SCSS
- **Testes**: Jasmine + TestBed (Karma)
- **Roteamento**: Angular Router

---

## 2. Decisões Arquiteturais

### 2.1 Componentes Standalone vs Módulos
**Decisão**: Usar **standalone components** (padrão Angular moderno)

**Justificativa**:
- Projeto já usa standalone components (painel-rolagem)
- Reduz boilerplate de módulos
- Melhor tree-shaking e performance
- Facilita lazy loading de rotas

**Implementação**:
```typescript
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderMenuComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent { }
```

### 2.2 Roteamento: Eager vs Lazy Loading
**Decisão**: **Eager loading** para landing-page e header-menu (críticos), **lazy loading** para carteira (em desenvolvimento)

**Justificativa**:
- Landing-page é rota raiz (/) → deve carregar imediatamente
- Header-menu é reutilizável → importado em múltiplos componentes
- Carteira é placeholder → pode ser lazy loaded

**Rotas**:
```typescript
export const routes: Routes = [
  { path: '', component: LandingPageComponent }, // /
  { path: 'painel-rolagem', component: PainelRolagemComponent }, // /painel-rolagem
  { path: 'carteira', loadComponent: () => import('./components/carteira/carteira.component').then(m => m.CarteiraComponent) }, // /carteira (lazy)
  { path: '**', redirectTo: '' } // fallback
];
```

### 2.3 State Management
**Decisão**: **Signals** (Angular 16+) para estado reativo

**Justificativa**:
- Landing-page é principalmente apresentacional
- Signals são mais eficientes que RxJS para estado simples
- Fácil integração com componentes

**Padrão**:
```typescript
export class HeaderMenuComponent {
  readonly isMenuOpen = signal(false);
  readonly currentUrl = signal('');

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }
}
```

### 2.4 Estrutura de Pastas
```
src/app/
├── components/
│   ├── landing-page/
│   │   ├── landing-page.component.ts
│   │   ├── landing-page.component.html
│   │   ├── landing-page.component.scss
│   │   ├── landing-page.component.spec.ts
│   │   └── sections/
│   │       ├── opcoes-section/
│   │       │   ├── opcoes-section.component.ts
│   │       │   ├── opcoes-section.component.html
│   │       │   └── opcoes-section.component.scss
│   │       └── rolagem-section/
│   │           ├── rolagem-section.component.ts
│   │           ├── rolagem-section.component.html
│   │           └── rolagem-section.component.scss
│   ├── header-menu/
│   │   ├── header-menu.component.ts
│   │   ├── header-menu.component.html
│   │   ├── header-menu.component.scss
│   │   └── header-menu.component.spec.ts
│   ├── carteira/
│   │   ├── carteira.component.ts
│   │   ├── carteira.component.html
│   │   ├── carteira.component.scss
│   │   └── carteira.component.spec.ts
│   └── painel-rolagem/
│       └── (existente)
├── services/
│   ├── rolagem-api.service.ts
│   └── (existentes)
├── models/
│   └── (existentes)
└── ...
```

---

## 3. Estrutura de Componentes

### 3.1 Componentes Principais

#### **LandingPageComponent** (Container)
- **Responsabilidade**: Renderizar seções informativas (Opções, Rolagem)
- **Imports**: HeaderMenuComponent, OpcoesSectionComponent, RolagemSectionComponent
- **Props**: Nenhuma (rota raiz)
- **Métodos**: Nenhum (apresentacional)
- **Template**: Layout com seções

#### **HeaderMenuComponent** (Reutilizável)
- **Responsabilidade**: Menu de navegação (Home, Busca de Rolagens, Carteira)
- **Imports**: RouterModule, CommonModule
- **Props**: Nenhuma (usa Router injetado)
- **Métodos**: navigate(route: string), toggleMenu(), closeMenu()
- **Template**: Nav com links

#### **CarteiraComponent** (Placeholder)
- **Responsabilidade**: Placeholder para tela de carteira em desenvolvimento
- **Imports**: HeaderMenuComponent
- **Props**: Nenhuma
- **Métodos**: Nenhum
- **Template**: Mensagem "Em desenvolvimento"

#### **OpcoesSectionComponent** (Sub-seção)
- **Responsabilidade**: Exibir informações sobre CALL, PUT, racionais, cenários
- **Props**: Nenhuma (conteúdo estático)
- **Template**: Cards informativos

#### **RolagemSectionComponent** (Sub-seção)
- **Responsabilidade**: Exibir informações sobre rolagem
- **Props**: Nenhuma (conteúdo estático)
- **Template**: Cards informativos

### 3.2 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    AppComponent                          │
│                  (RouterOutlet)                          │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Landing-Page │ │Painel-Rolagem│ │  Carteira    │
│  Component   │ │  Component   │ │  Component   │
└──────┬───────┘ └──────┬───────┘ └──────────────┘
       │                │
       ├────────────────┤
       │                │
       ▼                ▼
┌──────────────────────────────────┐
│      HeaderMenuComponent         │
│  (Reutilizável em todas rotas)   │
└──────────────────────────────────┘
       │
       ├─ Link: Home (/)
       ├─ Link: Busca de Rolagens (/painel-rolagem)
       └─ Link: Carteira (/carteira)

┌──────────────────────────────────┐
│    LandingPageComponent          │
│  (Container da landing-page)     │
└──────────┬───────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────────┐ ┌──────────────┐
│  Opcoes     │ │  Rolagem     │
│  Section    │ │  Section     │
└─────────────┘ └──────────────┘
```

---

## 4. Estrutura de Roteamento

### 4.1 Rotas Definidas

| Rota | Componente | Tipo | Descrição |
|------|-----------|------|-----------|
| `/` | LandingPageComponent | Eager | Página inicial com informações |
| `/painel-rolagem` | PainelRolagemComponent | Eager | Painel de busca de rolagens |
| `/carteira` | CarteiraComponent | Lazy | Placeholder de carteira |
| `**` | - | - | Fallback para `/` |

### 4.2 Configuração em `app.routes.ts`

```typescript
export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    data: { title: 'Home - Painel de Opções' }
  },
  {
    path: 'painel-rolagem',
    component: PainelRolagemComponent,
    data: { title: 'Busca de Rolagens' }
  },
  {
    path: 'carteira',
    loadComponent: () => import('./components/carteira/carteira.component')
      .then(m => m.CarteiraComponent),
    data: { title: 'Carteira' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

### 4.3 Integração com AppComponent

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent { }
```

---

## 5. Padrões de Código

### 5.1 Type-Safety (Sem `any`)

**Regra**: NUNCA usar `any` sem justificativa documentada

**Exemplo Correto**:
```typescript
interface MenuItem {
  readonly label: string;
  readonly route: string;
  readonly icon?: string;
}

export class HeaderMenuComponent {
  readonly menuItems: readonly MenuItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Busca de Rolagens', route: '/painel-rolagem' },
    { label: 'Carteira', route: '/carteira' }
  ];
}
```

### 5.2 Injeção de Dependência

**Padrão**: Constructor injection com `private readonly`

```typescript
export class HeaderMenuComponent {
  constructor(private readonly router: Router) {
    this.currentUrl.set(router.url);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.closeMenu();
  }
}
```

### 5.3 Componentes Puros

**Regra**: Componentes devem ser apresentacionais, sem side effects

```typescript
@Component({
  selector: 'app-opcoes-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './opcoes-section.component.html',
  styleUrls: ['./opcoes-section.component.scss']
})
export class OpcoesSectionComponent {
  readonly cards: readonly OpcaoCard[] = [
    // dados estáticos
  ];
}
```

### 5.4 Testes

**Framework**: Jasmine + TestBed (Karma)

**Padrão AAA** (Arrange, Act, Assert):

```typescript
describe('HeaderMenuComponent', () => {
  let component: HeaderMenuComponent;
  let fixture: ComponentFixture<HeaderMenuComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMenuComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderMenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve abrir/fechar menu ao clicar no hamburger', () => {
    // Arrange
    const hamburger = fixture.nativeElement.querySelector('.hamburger');
    expect(component.isMenuOpen()).toBe(false);

    // Act
    hamburger.click();
    fixture.detectChanges();

    // Assert
    expect(component.isMenuOpen()).toBe(true);
  });
});
```

### 5.5 Acessibilidade

**Padrão**: WCAG 2.1 AA

```html
<!-- Exemplo de HTML acessível -->
<button
  class="hamburger"
  [class.active]="isMenuOpen()"
  (click)="toggleMenu()"
  aria-label="Toggle menu"
  aria-expanded="isMenuOpen()">
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
</button>

<nav
  class="nav"
  [class.open]="isMenuOpen()"
  role="navigation"
  aria-label="Menu principal">
  <ul class="nav-list">
    <li *ngFor="let item of menuItems" class="nav-item">
      <a
        [routerLink]="item.route"
        class="nav-link"
        (click)="closeMenu()"
        [attr.aria-current]="currentUrl() === item.route ? 'page' : null">
        <span class="nav-icon" *ngIf="item.icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </li>
  </ul>
</nav>
```

### 5.6 Responsividade

**Padrão**: Mobile-first com media queries

```scss
// Mobile first
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  // Tablet
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 6. Integrações

### 6.1 Integração com PainelRolagemComponent

**O que fazer**: Adicionar HeaderMenuComponent ao PainelRolagemComponent

```typescript
@Component({
  selector: 'app-painel-rolagem',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    HeaderMenuComponent  // ← Adicionar aqui
  ],
  templateUrl: './painel-rolagem.component.html',
  styleUrls: ['./painel-rolagem.component.scss']
})
export class PainelRolagemComponent {
  // ...
}
```

**Template**:
```html
<app-header-menu></app-header-menu>

<main class="painel-rolagem">
  <!-- conteúdo do painel -->
</main>
```

### 6.2 Integração com AppComponent

**O que fazer**: Configurar RouterOutlet em AppComponent

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'painel-opcoes';
}
```

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Componente não renderiza | Baixa | Alto | Validar imports e standalone: true |
| Menu não aparece em painel-rolagem | Baixa | Médio | Testar integração com PainelRolagemComponent |
| Rotas não funcionam | Baixa | Alto | Verificar RouterOutlet em app.component.ts |
| Layout quebra em mobile | Média | Médio | Usar media queries e testes responsivos |
| Testes falham | Baixa | Médio | Usar TestBed e mocks de Router |
| Performance ruim | Baixa | Médio | Lazy loading para carteira, otimizar bundle |

---

## 8. Próximos Passos

### Fase 3: Implementação
- [ ] Implementar 12 tasks atômicas
- [ ] Criar componentes standalone
- [ ] Implementar roteamento
- [ ] Escrever testes unitários (> 80% cobertura)
- [ ] Validar responsividade e acessibilidade

### Fase 4: Code Review (QA Engineer TS)
- [ ] Revisar PR
- [ ] Validar CI/CD
- [ ] Testar Docker
- [ ] Executar `npm test`, `ng build`
- [ ] Validar com Lighthouse > 80

### Fase 5: Merge
- [ ] Mergear branch para main
- [ ] Deploy em produção

---

## 9. Referências

- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [Angular Router](https://angular.io/guide/router)
- [Angular Testing](https://angular.io/guide/testing)
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular Signals](https://angular.io/guide/signals)

---

**Responsável**: Tech Lead TS  
**Data**: 2024-06-02  
**Status**: ✅ APROVADO
