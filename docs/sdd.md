# SDD: Painel de Rolagem de Opções

## 1. Visão Geral

### 1.1 Objetivo
Construir uma aplicação front-end em Angular 17 para consulta e exibição de **rolagens de opções financeiras**. O usuário informa uma opção (ticker), seleciona a quantidade de vencimentos futuros e o tipo de rolagem desejada. O sistema consulta uma API REST e apresenta os dados da opção informada e as alternatives de rolagem organizadas por vencimento.

### 1.2 Escopo
- **Inclui:**
  - Formulário de busca com validações
  - Integração com API REST de rolagens (`GET /api/rolagem/por-tipo`)
  - Exibição de resultados em cards e tabelas (Angular Material)
  - Testes unitários de componente e serviço
- **Não inclui:**
  - Autenticação/Autorização
  - Backend (mock ou real) — assume-se API disponível em `localhost:8080`
  - Internacionalização (i18n)
  - PWA / Service Workers
  - E2E tests

### 1.3 Stakeholders
- Usuários: Traders/analistas de mercado de opções
- Desenvolvedor: Time front-end Angular

---

## 2. Contexto de Negócio

### 2.1 Glossário
| Termo | Definição |
|-------|-----------|
| **Opção** | Derivativo financeiro representado por um ticker (ex: `BBSEF358`) |
| **Strike** | Preço de exercício da opção |
| **Prêmio** | Valor pago/recebido pela opção |
| **Delta** | Sensibilidade do prêmio em relação ao preço do ativo-objeto |
| **Rolagem** | Operação de trocar uma opção por outra de vencimento diferente |
| **Tipo de Rolagem** | Estratégia de rolagem: positiva redução/aumento de strike, negativa ou neutra |
| **Vencimento** | Data de expiração da opção (formato ISO: `YYYY-MM-DD`) |

### 2.2 Regras de Negócio
| ID | Regra |
|----|-------|
| RN-01 | O campo **Opção** é obrigatório e deve ter entre **5 e 8 caracteres** |
| RN-02 | A **Quantidade de Vencimentos** pode ser 1, 2 ou 3 (default: 2) |
| RN-03 | O **Tipo de Rolagem** é obrigatório e default: `POSITIVA_AUMENTO_STRIKE` |
| RN-04 | A busca só pode ser disparada se o formulário for válido |
| RN-05 | Durante a busca, exibir indicador de carregamento e desabilitar o botão |
| RN-06 | Em caso de erro na API, exibir mensagem amigável |
| RN-07 | Datas devem ser exibidas no formato brasileiro: `DD/MM/YYYY` |
| RN-08 | Valores numéricos (strike, prêmio, delta) devem ter 2 casas decimais |

---

## 3. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Angular | 17.3.x |
| Linguagem | TypeScript | ~5.4.2 |
| UI Components | Angular Material | 17.3.x |
| CDK | Angular CDK | 17.3.x |
| Forms | Angular Reactive Forms | built-in |
| HTTP | Angular HttpClient | built-in |
| Routing | Angular Router | built-in (configurado, não utilizado para rotas ativas) |
| Animations | Angular Animations (async provider) | built-in |
| Testes | Karma + Jasmine | Karma ~6.4, Jasmine ~5.1 |
| Bundler | Angular CLI / esbuild | 17.3.17 |
| Runtime | zone.js | ~0.14.3 |

---

## 4. Arquitetura

### 4.1 Padrão Arquitetural
**Monolithic Standalone Components** (padrão tradicional simplificado com componentes standalone do Angular 17).

> Decisão: A aplicação é pequena (1 feature, 1 tela). Não há necessidade de feature modules, lazy loading ou state management global. Componentes standalone eliminam a necessidade de `NgModule` para cada componente.

### 4.2 Estrutura de Pastas
```
src/
├── app/
│   ├── components/
│   │   └── painel-rolagem/
│   │       ├── painel-rolagem.component.ts
│   │       ├── painel-rolagem.component.html
│   │       ├── painel-rolagem.component.scss
│   │       └── painel-rolagem.component.spec.ts
│   ├── models/
│   │   ├── busca-rolagem-request.model.ts
│   │   ├── busca-rolagem-response.model.ts
│   │   ├── opcao.model.ts
│   │   ├── rolagem-vencimento.model.ts
│   │   └── tipo-rolagem.enum.ts
│   ├── services/
│   │   ├── rolagem-api.service.ts
│   │   └── rolagem-api.service.spec.ts
│   ├── app.component.ts
│   ├── app.component.scss
│   ├── app.component.spec.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── index.html
├── main.ts
└── styles.scss
```

---

## 5. Modelos de Domínio

### 5.1 Enum: TipoRolagem
```typescript
export enum TipoRolagem {
  POSITIVA_REDUCAO_STRIKE = 'POSITIVA_REDUCAO_STRIKE',
  POSITIVA_AUMENTO_STRIKE = 'POSITIVA_AUMENTO_STRIKE',
  NEGATIVA = 'NEGATIVA',
  NEUTRA = 'NEUTRA'
}
```

### 5.2 Interface: Opcao
```typescript
export interface Opcao {
  nome: string;
  premio: number;
  strike: number;
  delta: number;
}
```

### 5.3 Interface: RolagemVencimento
```typescript
import { Opcao } from './opcao.model';

export interface RolagemVencimento {
  data: string;       // ISO date: YYYY-MM-DD
  opcoes: Opcao[];
}
```

### 5.4 Interface: BuscaRolagemRequest
```typescript
import { TipoRolagem } from './tipo-rolagem.enum';

export interface BuscaRolagemRequest {
  opcao: string;
  quantidadeVencimentos: number;
  tipoRolagem: TipoRolagem;
}
```

### 5.5 Interface: BuscaRolagemResponse
```typescript
import { RolagemVencimento } from './rolagem-vencimento.model';

export interface BuscaRolagemResponse {
  opcao: string;
  vencimento: string;    // ISO date: YYYY-MM-DD
  strike: number;
  rolagens: RolagemVencimento[];
}
```

---

## 6. Componentes

### 6.1 AppComponent (Root)
- **Selector:** `app-root`
- **Tipo:** Standalone
- **Responsabilidade:** Bootstrap da aplicação. Apenas renderiza `<app-painel-rolagem>`.
- **Imports:** `PainelRolagemComponent`

```typescript
import { Component } from '@angular/core';
import { PainelRolagemComponent } from './components/painel-rolagem/painel-rolagem.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PainelRolagemComponent],
  template: `<app-painel-rolagem></app-painel-rolagem>`,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'painel-opcoes';
}
```

### 6.2 PainelRolagemComponent
- **Selector:** `app-painel-rolagem`
- **Tipo:** Standalone
- **Responsabilidade:**
  - Gerenciar formulário reativo de busca
  - Validar entradas (RN-01 a RN-04)
  - Orquestrar chamada ao `RolagemApiService`
  - Renderizar estados: idle, loading, error, success
  - Formatar dados para exibição (RN-07, RN-08)

**Imports de Material:**
- `MatFormFieldModule`, `MatInputModule`, `MatSelectModule`, `MatButtonModule`
- `MatCardModule`, `MatTableModule`, `MatProgressSpinnerModule`

**Outros imports:** `CommonModule`, `ReactiveFormsModule`

**Propriedades-chave:**
| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `form` | `FormGroup` | Controles: `opcao`, `quantidadeVencimentos`, `tipoRolagem` |
| `tiposRolagem` | `string[]` | `Object.values(TipoRolagem)` |
| `vencimentos` | `number[]` | `[1, 2, 3]` |
| `resultado` | `BuscaRolagemResponse \| undefined` | Resposta da API |
| `carregando` | `boolean` | Estado de loading |
| `erro` | `string \| undefined` | Mensagem de erro |
| `colunasTabela` | `string[]` | `['nome', 'vencimento', 'strike', 'premio', 'delta']` |

**Validações do Formulário:**
| Campo | Validadores |
|-------|-------------|
| `opcao` | `Validators.required`, `Validators.minLength(5)`, `Validators.maxLength(8)` |
| `quantidadeVencimentos` | `Validators.required` (default: 2) |
| `tipoRolagem` | `Validators.required` (default: `POSITIVA_AUMENTO_STRIKE`) |

**Métodos públicos:**
- `buscar(): void` — dispara requisição se formulário válido
- `formatarData(data: string): string` — `YYYY-MM-DD` → `DD/MM/YYYY`
- `formatarValor(valor: number): string` — `toFixed(2)`
- `opcoesParaVencimento(v): Opcao[]` — wrapper para datasource da tabela
- Getters computados: `opcaoControl`, `opcaoInvalida`, `podeBuscar`

**Fluxo de Estados (Diagrama):**
```
[IDLE] --(submit válido)--> [LOADING] --(success)--> [SUCCESS]
                                    --(error)----> [ERROR] --(nova busca)--> [LOADING]
```

---

## 7. Serviços

### 7.1 RolagemApiService
- **ProvidedIn:** `root`
- **Base URL:** `http://localhost:8080/api`
- **Responsabilidade:** Abstrair chamada HTTP para endpoint de rolagens

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BuscaRolagemRequest } from '../models/busca-rolagem-request.model';
import { BuscaRolagemResponse } from '../models/busca-rolagem-response.model';

@Injectable({ providedIn: 'root' })
export class RolagemApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  buscarRolagens(request: BuscaRolagemRequest): Observable<BuscaRolagemResponse> {
    const params = new HttpParams()
      .set('opcao', request.opcao)
      .set('quantidadeVencimentos', request.quantidadeVencimentos.toString())
      .set('tipoRolagem', request.tipoRolagem);

    return this.http.get<BuscaRolagemResponse>(
      `${this.baseUrl}/rolagem/por-tipo`,
      { params }
    );
  }
}
```

---

## 8. Configuração da Aplicação

### 8.1 Bootstrap (main.ts)
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### 8.2 AppConfig (app.config.ts)
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient()
  ]
};
```

### 8.3 Rotas (app.routes.ts)
```typescript
import { Routes } from '@angular/router';
export const routes: Routes = [];
```
> Nota: Rotas vazias intencionalmente — a aplicação possui apenas uma tela.

---

## 9. Layout e Estilos

### 9.1 Tema
- **Tema Material:** `indigo-pink` (prebuilt theme)
- **Fonte:** Roboto (Google Fonts) + Material Icons
- **Estilo global:** SCSS (`src/styles.scss`)

### 9.2 Estrutura Visual do PainelRolagem
1. **Header:** Título "Painel de Rolagem de Opções"
2. **Formulário (linha flex, wrap):**
   - Campo "Opção" (outline, min-width 240px, flex: 1)
   - Select "Quantidade de Vencimentos" (1, 2, 3)
   - Select "Tipo de Rolagem" (valores do enum)
   - Botão "Buscar Rolagens" (raised, primary, disabled quando inválido/loading)
3. **Loading:** Spinner 40px + texto "Buscando rolagens..."
4. **Erro:** Mensagem em vermelho
5. **Resultados:**
   - Card "Dados da Opção Informada" (grid 4 colunas responsivo)
   - Lista de cards por vencimento futuro, cada um com tabela de alternativas

### 9.3 Responsividade
- Container centralizado (`max-width: 1200px`)
- Formulário com `flex-wrap: wrap`
- Info grid com `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`

---

## 10. Contrato de API

### 10.1 Endpoint
```
GET http://localhost:8080/api/rolagem/por-tipo
```

### 10.2 Query Parameters
| Parâmetro | Tipo | Obrigatório | Exemplo |
|-----------|------|-------------|---------|
| `opcao` | string | Sim | `BBSEF358` |
| `quantidadeVencimentos` | integer | Sim | `2` |
| `tipoRolagem` | string(enum) | Sim | `POSITIVA_AUMENTO_STRIKE` |

### 10.3 Response Body (200 OK)
```json
{
  "opcao": "BBSEF358",
  "vencimento": "2026-06-19",
  "strike": 33.29,
  "rolagens": [
    {
      "data": "2026-07-17",
      "opcoes": [
        {
          "nome": "BBSEG334",
          "premio": 2.24,
          "strike": 33.43,
          "delta": 0.50
        }
      ]
    }
  ]
}
```

### 10.4 Códigos de Erro Esperados
| Código | Significado | Tratamento Front-end |
|--------|-------------|----------------------|
| 400 | Parâmetros inválidos | Exibir mensagem retornada pelo servidor |
| 404 | Opção não encontrada | Exibir "Opção não encontrada" |
| 500 | Erro interno | Exibir "Erro ao buscar rolagens." |
| Network Error | API indisponível | Exibir mensagem genérica de erro |

---

## 11. Testes

### 11.1 Estratégia
- **Unitários:** Karma + Jasmine (padrão Angular CLI)
- **Cobertura mínima:** Componente + Service
- **Mock:** `HttpTestingController` para serviço; mock manual para componente

### 11.2 Testes do Serviço (rolagem-api.service.spec.ts)
| # | Caso |
|---|------|
| 1 | Service deve ser criado |
| 2 | Deve chamar `GET /api/rolagem/por-tipo` com query params corretos |

### 11.3 Testes do Componente (painel-rolagem.component.spec.ts)
| # | Caso |
|---|------|
| 1 | Componente deve ser criado |
| 2 | Valores default do formulário (opcao='', vencimentos=2, tipo=POSITIVA_AUMENTO_STRIKE) |
| 3 | Botão desabilitado quando opcao vazia |
| 4 | Botão desabilitado quando opcao < 5 caracteres |
| 5 | Botão habilitado quando opcao tem 5 caracteres |
| 6 | Botão habilitado quando opcao tem 8 caracteres |
| 7 | Botão desabilitado quando opcao > 8 caracteres |
| 8 | Exibir erro quando opcao touched + dirty + inválida |
| 9 | Chamada API bem-sucedida: preenche resultado, remove loading |
| 10 | Chamada API com erro: preenche mensagem de erro, remove loading |
| 11 | Formatar data corretamente |
| 12 | Formatar valor com 2 decimais |

---

## 12. Decisões Técnicas (ADRs)

### ADR-001: Standalone Components vs NgModules
- **Contexto:** Angular 17 introduziu standalone como padrão.
- **Decisão:** Usar componentes standalone em todo o projeto.
- **Consequências:** Menos boilerplate, sem `app.module.ts`, imports declarados no próprio componente.
- **Alternativas:** NgModule tradicional — rejeitado por verbosidade desnecessária em app pequena.

### ADR-002: Angular Material vs CSS Custom
- **Contexto:** Necessidade de formulários, tabelas, cards, spinners e tema consistente.
- **Decisão:** Adotar Angular Material com tema pré-construído `indigo-pink`.
- **Consequências:** Velocidade de desenvolvimento, acessibilidade, consistência visual.
- **Alternativas:** Tailwind + componentes custom — rejeitado por overhead de customização para 1 tela.

### ADR-003: Reactive Forms vs Template-driven
- **Contexto:** Formulário com validações sincronas e estado de habilitação de botão.
- **Decisão:** Reactive Forms (`FormBuilder`, `Validators`).
- **Consequências:** Lógica de validação testável no TypeScript, fácil integração com Material.
- **Alternativas:** Template-driven — rejeitado por menor testabilidade e verbosidade de diretivas.

### ADR-004: HttpClient com Query Params vs POST Body
- **Contexto:** API espera parâmetros de busca.
- **Decisão:** Enviar via `HttpParams` em requisição `GET`.
- **Consequências:** Semântica REST correta para leitura, cacheável por proxies.
- **Alternativas:** POST com body — rejeitado por não ser operação de criação.

---

## 13. Guia de Recriação do Zero

### 13.1 Pré-requisitos
- Node.js 18+ (recomendado 20)
- npm 9+
- Angular CLI global ou `npx @angular/cli`

### 13.2 Passo a Passo

**1. Criar projeto**
```bash
ng new painel-opcoes --routing=true --style=scss --ssr=false --skip-git
```

**2. Instalar Angular Material**
```bash
cd painel-opcoes
ng add @angular/material@17.3.10
# Escolher tema: Indigo/Pink
# Tipografia: Yes
# Animations: Yes
```

**3. Ajustar `tsconfig.json`**
Garantir que contenha:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

**4. Criar estrutura de arquivos**
```bash
mkdir -p src/app/models src/app/services src/app/components/painel-rolagem
```

**5. Implementar modelos**
Criar os 5 arquivos da seção 5 na ordem:
- `tipo-rolagem.enum.ts`
- `opcao.model.ts`
- `rolagem-vencimento.model.ts`
- `busca-rolagem-request.model.ts`
- `busca-rolagem-response.model.ts`

**6. Implementar serviço**
Criar `src/app/services/rolagem-api.service.ts` (seção 7.1) e seu `.spec.ts` (seção 11.2).

**7. Implementar componente PainelRolagem**
Criar 4 arquivos:
- `painel-rolagem.component.ts` (seção 6.2)
- `painel-rolagem.component.html` (layout descrito na seção 9.2)
- `painel-rolagem.component.scss` (seção 9 e valores de referência no arquivo existente)
- `painel-rolagem.component.spec.ts` (seção 11.3)

**8. Configurar AppComponent, AppConfig, AppRoutes, main.ts**
Conforme seções 6.1 e 8.

**9. Ajustar `index.html`**
Garantir links para Google Fonts (Roboto) e Material Icons.

**10. Ajustar `styles.scss`**
```scss
html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }
```

**11. Ajustar `angular.json`**
- `styles`: `["@angular/material/prebuilt-themes/indigo-pink.css", "src/styles.scss"]`
- `inlineStyleLanguage`: `scss`
- Builder: `@angular-devkit/build-angular:application`

**12. Rodar testes**
```bash
ng test --watch=false --browsers=ChromeHeadless
```

**13. Subir aplicação**
```bash
ng serve
# Acessar http://localhost:4200
```

> **Nota:** O backend deve estar disponível em `http://localhost:8080` para a funcionalidade de busca funcionar.

---

## 14. Checklist de Entrega

- [x] Projeto Angular 17 standalone criado
- [x] Angular Material configurado com tema indigo-pink
- [x] Componente `PainelRolagem` com Reactive Forms e validações
- [x] Serviço `RolagemApiService` integrado via `HttpClient`
- [x] Modelos de domínio tipados
- [x] Layout responsivo com Material Card, Table, Spinner
- [x] Testes unitários para serviço e componente
- [x] Tratamento de estados: idle, loading, error, success
- [x] Formatação de data e valores numéricos
- [x] README com instruções básicas
