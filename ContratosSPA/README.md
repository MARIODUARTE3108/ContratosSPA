# ContratosSPA — Front‑end React para Gestão de Contratos (MODEC)

Frontend **SPA em React** que consome a API de **Contratos** (.NET 8, SQLite, JWT). Inclui autenticação com **token JWT**, páginas de **Pessoas**, **Empresas** e **Contratos**, tabela paginada/ordenável com **TanStack Table**, e integração via **Axios** com interceptors para anexar o token automaticamente.

---

## ✨ Principais recursos
- **Login** com JWT (salvo em `sessionStorage` por padrão).
- **Rotas protegidas** (redireciona para `/login` se não autenticado).
- **Módulos**: Pessoas, Empresas, Contratos (CRUD).
- **Tabela** com paginação/filtro/ordenação (TanStack Table).
- **Serviços Axios** por domínio (`account-services`, `people-services`, `companies-services`, `contracts-services`).
- **Formatações utilitárias** (CNPJ/CPF, moeda BRL, datas).
- **Build e Deploy** prontos para Cloudflare Pages, GitHub Pages e Azure Static Web Apps.
- **Tratamento de erros** e padrão de mensagens para o front.

---

## 🧱 Estrutura de pastas (sugerida)

```
ContratosSPA/
  public/
  src/
    assets/
    css/                       # ex.: forms.css
    components/                # Tabela, Modal, Toast, etc.
    contexts/                  # AuthContext
    hooks/
    layouts/
    pages/
      auth/                    # LoginPage.jsx
      dashboard/
      people/
      companies/
      contracts/
    routes/                    # ProtectedRoute.jsx
    services/
      account-services.js
      people-services.js
      companies-services.js
      contracts-services.js
      http.js                  # axios instance + interceptors
      config.js                # getApiUrl() centralizado
    utils/                     # masks, formatCurrencyBR, etc.
    App.jsx
    main.jsx
  .env.example
  package.json
```
---

## ⚙️ Configuração de ambiente

Crie um `.env` baseado no `.env.example`:

```bash
REACT_APP_API_URL=http://localhost:5080/api
REACT_APP_NAME=Contratos MODEC
REACT_APP_TOKEN_STORAGE=session
```

## 🚀 Como rodar localmente

### Instalar dependências
```bash
npm install
```
### Ambiente de desenvolvimento

npm start
```

### Build de produção
```bash
npm run build
npx serve -s build   # (ou hospede em qualquer servidor estático)
```
