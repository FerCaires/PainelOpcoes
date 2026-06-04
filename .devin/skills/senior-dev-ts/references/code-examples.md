# Exemplos de Código — TypeScript + Angular

## Padrão de Services

```typescript
// ✅ BOM — Service com RxJS
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly http = inject(HttpClient);
  private readonly notificacoes$ = new BehaviorSubject<Notificacao[]>([]);

  criar(dto: NotificacaoDto): Observable<Notificacao> {
    return this.http.post<Notificacao>('/api/notificacoes', dto).pipe(
      tap(notificacao => this.notificacoes$.next([...this.notificacoes$.value, notificacao])),
      catchError(error => {
        console.error('Erro ao criar notificação', error);
        return throwError(() => error);
      })
    );
  }

  get notificacoes(): Observable<Notificacao[]> {
    return this.notificacoes$.asObservable();
  }
}

// No componente — usa o service
@Component({
  selector: 'app-notificacao-form',
  template: `...`
})
export class NotificacaoFormComponent {
  private readonly notificacaoService = inject(NotificacaoService);

  onSubmit(dto: NotificacaoDto) {
    this.notificacaoService.criar(dto).subscribe({
      next: () => this.toast.success('Notificação criada!'),
      error: (error) => this.toast.error(error.message)
    });
  }
}

// ❌ RUIM — lógica no componente
@Component({ ... })
export class NotificacaoFormComponent {
  private readonly http = inject(HttpClient);
  private readonly notificacoes = [];

  onSubmit(dto: NotificacaoDto) {
    this.http.post('/api/notificacoes', dto).subscribe({
      next: (result) => this.notificacoes.push(result),
      error: (error) => console.error(error)
    });
  }
}
```

## HttpClient — API Services

```typescript
// ✅ BOM — HttpClient com Interceptors
@Injectable({ providedIn: 'root' })
export class NotificacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(Environment).apiUrl;

  criar(dto: NotificacaoDto): Observable<Notificacao> {
    return this.http.post<Notificacao>(`${this.apiUrl}/notificacoes`, dto);
  }

  listar(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/notificacoes`);
  }
}

// No service — usa o HttpClient
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly apiService = inject(NotificacaoApiService);

  criar(dto: NotificacaoDto): Observable<Notificacao> {
    return this.apiService.criar(dto);
  }
}

// ❌ RUIM — fetch direto no componente
@Component({ ... })
export class NotificacaoFormComponent {
  handleSubmit(dto: NotificacaoDto) {
    fetch('/api/notificacoes', { ... });  // NUNCA faça isso
  }
}
```

## Componente idiomático

```typescript
// ✅ BOM
@Component({
  selector: 'app-notificacao-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- ... -->
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificacaoFormComponent {
  private readonly notificacaoService = inject(NotificacaoService);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.form.invalid) {
      this.toast.error('Email é obrigatório');
      return;
    }

    this.notificacaoService.criar(this.form.value).subscribe();
  }
}

// ❌ RUIM
@Component({ ... })
export class NotificacaoFormComponent {
  form: FormGroup;
  notificacoes: any[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ''
    });
  }

  onSubmit() {
    if (this.form.value.email == null || this.form.value.email == '') {
      alert('Email é obrigatório');
      return;
    }

    // fetch direto, sem type safety
  }
}
```