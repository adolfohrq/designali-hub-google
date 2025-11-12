# Designali Hub

<div align="center">
  <h3>Hub de Gerenciamento de Aprendizado e Produtividade</h3>
  <p>Uma aplicação web moderna para designers gerenciarem ferramentas, vídeos, notas, cursos e recursos de aprendizado em um só lugar.</p>
</div>

## 🚀 Características

- **Dashboard Interativo** - Visualize estatísticas e métricas do seu aprendizado
- **Gestão de Ferramentas** - Organize suas ferramentas de design favoritas
- **Biblioteca de Vídeos** - Salve e organize vídeos educacionais
- **Notas com Markdown** - Crie notas com suporte completo a Markdown
- **Acompanhamento de Cursos** - Monitore seu progresso em cursos
- **Recursos de Aprendizado** - Gerencie artigos, livros e podcasts
- **IA Integrada** - Sugestões de ferramentas com Google Gemini AI
- **Modo Offline** - Funciona sem internet (PWA)
- **Instalável** - Pode ser instalado como app nativo

## 🛠️ Tecnologias

- **React 19.2.0** - Framework UI
- **TypeScript** - Type safety
- **Vite 6.2.0** - Build tool e dev server
- **Supabase** - Backend (PostgreSQL + Auth + Storage)
- **Tailwind CSS** - Estilização
- **Recharts** - Visualização de dados
- **Google Gemini AI** - Sugestões inteligentes
- **Vitest** - Testes unitários
- **PWA** - Progressive Web App

## ⚡ Performance

O projeto implementa otimizações modernas:

- ✅ **Code Splitting** - Bundle dividido em chunks menores
- ✅ **Lazy Loading** - Páginas carregam sob demanda
- ✅ **Service Worker** - Cache inteligente para modo offline
- ✅ **PWA** - Instalável como app nativo
- ✅ **Testes** - Cobertura com Vitest

**Resultado**: 77% de redução no bundle inicial (1.09MB → ~250KB)

Veja detalhes completos em [OPTIMIZATIONS.md](OPTIMIZATIONS.md)

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/adolfohrq/designali-hub-google.git

# Entre na pasta
cd designali-hub-google

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Google Gemini AI
GEMINI_API_KEY=sua_chave_api_aqui

# Supabase (configure via MCP ou manualmente)
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🚀 Comandos

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Testes
npm test           # Watch mode
npm run test:run   # Single run
npm run test:ui    # UI interativa
```

## 🗄️ Estrutura do Projeto

```
designali-hub-google/
├── components/          # Componentes React reutilizáveis
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Modal.tsx
│   ├── PWAInstallPrompt.tsx
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx
│   ├── Ferramentas.tsx
│   ├── Videos.tsx
│   ├── Notas.tsx
│   ├── Estudo.tsx
│   ├── Recursos.tsx
│   └── Configuracoes.tsx
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/           # Serviços externos
│   └── supabase.ts
├── tests/              # Testes unitários
│   ├── Modal.test.tsx
│   ├── types.test.ts
│   └── utils.test.ts
├── public/             # Assets estáticos
├── types.ts            # Definições TypeScript
└── App.tsx             # Componente raiz
```

## 🎨 Ícones PWA

Para personalizar os ícones do PWA, adicione os seguintes arquivos em `public/`:

- `logo-192.png` (192x192px)
- `logo-512.png` (512x512px)
- `favicon.ico`

Veja instruções completas em [public/PWA-ICONS-README.md](public/PWA-ICONS-README.md)

## 📊 Database Schema

O projeto usa Supabase com as seguintes tabelas:

- `tools` - Ferramentas de design
- `videos` - Vídeos educacionais
- `notes` - Notas do usuário
- `courses` - Cursos em progresso
- `tutorials` - Tutoriais salvos
- `resources` - Recursos de aprendizado
- `user_profiles` - Perfis de usuário
- `notifications` - Notificações do sistema

Todas as tabelas possuem RLS (Row Level Security) habilitado.

## 🔒 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Autenticação via Supabase Auth
- ✅ Filtros `user_id` em todas as queries
- ✅ Validação de tipos TypeScript
- ✅ Sanitização de inputs

## 🌐 Deploy

### Vercel (Recomendado)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Instale Netlify CLI
npm i -g netlify-cli

# Build e deploy
npm run build
netlify deploy --prod --dir=dist
```

### Configuração

Não esqueça de adicionar as variáveis de ambiente no painel do provedor:
- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📱 PWA

Após o deploy, usuários podem:

1. Acessar o site
2. Aguardar o prompt de instalação (10s)
3. Clicar em "Instalar"
4. App aparece na home screen

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# UI interativa
npm run test:ui
```

## 📚 Documentação

- [OPTIMIZATIONS.md](OPTIMIZATIONS.md) - Guia completo de otimizações
- [CLAUDE.md](CLAUDE.md) - Instruções para Claude Code
- [public/PWA-ICONS-README.md](public/PWA-ICONS-README.md) - Como criar ícones PWA

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👤 Autor

**Adolfo Ribeiro**
- GitHub: [@adolfohrq](https://github.com/adolfohrq)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com/) - Backend as a Service
- [Google Gemini](https://ai.google.dev/) - IA Generativa
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI Framework

---

<div align="center">
  Feito com ❤️ por <a href="https://github.com/adolfohrq">Adolfo Ribeiro</a>
</div>
