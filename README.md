# MetaDex

![MetaDex Logo](client/public/logo.png)

A plataforma definitiva para o cenário competitivo de Pokémon TCG. Acompanhe torneios, construa decks, registre batalhas e analise o metagame.

## 🎮 Funcionalidades

### ✅ Implementadas (MVP)

- **Sistema de Autenticação**
  - Login via OAuth (Manus)
  - Sistema de roles: User, Organizer, Admin
  - Controle de acesso por funcionalidade

- **Agregador de Torneios**
  - Listagem de torneios com filtros (formato, status)
  - Cadastro manual por lojistas (organizers)
  - Sistema de aprovação por administradores
  - Suporte para torneios de múltiplas fontes (LimitlessTCG, RK9, cadastro manual)

- **Construtor de Decks**
  - Import/Export no formato PTCGL
  - Validação automática (60 cartas)
  - Sistema de compartilhamento com link único
  - Decks públicos e privados

- **Diário de Batalha**
  - Registro de partidas
  - Seleção de arquétipos
  - Estatísticas em tempo real (win rate, total de partidas)
  - Histórico completo de batalhas

- **Análise de Metagame**
  - Meta-Relevance Index (MRI)
  - Usage Rate (UR)
  - Conversion Rate (CR)
  - Ranking dinâmico de arquétipos
  - Filtros por formato e período

### 🚧 Planejadas (Futuras Implementações)

- Scraping automático de torneios (LimitlessTCG, RK9)
- Integração com Pokémon TCG API para busca de cartas
- Matriz de matchups (win rate deck vs deck)
- Gráficos de tendências ao longo do tempo
- Sistema de identificação automática de arquétipos
- Exportação para calendário (Google Calendar, iCal)
- Página de detalhes de torneios com decklists

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **Wouter** - Roteamento
- **tRPC** - Type-safe API client

### Backend
- **Node.js** - Runtime
- **Express 4** - Servidor HTTP
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Banco de dados

### Infraestrutura
- **Manus Platform** - Deployment e OAuth
- **S3** - Armazenamento de arquivos

## 📦 Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 22+
- pnpm
- MySQL/TiDB database

### Setup

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/metadex.git
cd metadex
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as variáveis necessárias:
# - DATABASE_URL
# - JWT_SECRET
# - OAUTH_SERVER_URL
# - VITE_APP_ID
# etc.
```

4. Execute as migrações do banco:
```bash
pnpm db:push
```

5. (Opcional) Popule o banco com dados de exemplo:
```bash
npx tsx scripts/seed.ts
```

6. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema (user, organizer, admin)
- **tournaments** - Torneios (scraped e cadastrados manualmente)
- **archetypes** - Arquétipos de decks
- **decks** - Decks dos usuários e de torneios
- **battleLogs** - Registro de partidas
- **metagameSnapshots** - Snapshots de metagame (UR, CR, MRI)
- **matchupMatrix** - Matriz de matchups entre arquétipos
- **cards** - Cache de cartas Pokémon TCG

## 🎨 Design

O MetaDex utiliza um tema **dark gamer** com paleta de cores serenas:

- **Primária**: Azul (#3B82F6)
- **Acento**: Vermelho (#EF4444)
- **Background**: Tons escuros de cinza
- **Foreground**: Branco/Cinza claro

Design responsivo e otimizado para desktop e mobile.

## 📊 Sistema de Métricas

### Meta-Relevance Index (MRI)

Índice que combina Usage Rate e Conversion Rate para determinar a relevância de um arquétipo no metagame.

**Fórmula**: `MRI = (UR × CR) / 100`

### Usage Rate (UR)

Percentual de uso do arquétipo no Day 1 dos torneios.

**Fórmula**: `UR = (Total de decks do arquétipo / Total de decks) × 100`

### Conversion Rate (CR)

Taxa de conversão para o Top Cut (Day 2).

**Fórmula**: `CR = (Decks no Top Cut / Total de decks do arquétipo) × 100`

## 🔐 Sistema de Roles

### User (Padrão)
- Criar e gerenciar decks
- Registrar batalhas
- Visualizar torneios e metagame

### Organizer (Lojista)
- Todas as permissões de User
- Cadastrar torneios (sujeito a aprovação)

### Admin
- Todas as permissões de Organizer
- Aprovar/rejeitar torneios
- Gerenciar arquétipos
- Acesso total ao sistema

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Formato PTCGL

O construtor de decks suporta import/export no formato PTCGL:

```
4 Charizard ex OBF 125
2 Charmander OBF 26
3 Charmeleon OBF 27
4 Rare Candy SVI 191
2 Professor's Research SVI 189
4 Ultra Ball SVI 196
10 Fire Energy
```

**Formato**: `[Quantidade] [Nome da Carta] [SET] [Número]`

## 📜 Licença

Este projeto é licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## ⚠️ Disclaimer

MetaDex é um projeto independente e não é afiliado, endossado ou patrocinado pela The Pokémon Company, Nintendo, Game Freak ou Creatures Inc.

Pokémon e Pokémon TCG são marcas registradas da The Pokémon Company.

## 🙏 Agradecimentos

- [LimitlessTCG](https://limitlesstcg.com) - Inspiração para análise de meta
- [RK9.gg](https://rk9.gg) - Plataforma de torneios
- [JulienGitHub/Standings](https://github.com/JulienGitHub/Standings) - Script de scraping RK9
- Comunidade competitiva de Pokémon TCG

## 📧 Contato

Para dúvidas, sugestões ou reportar bugs, abra uma issue no GitHub.

---

Desenvolvido com ❤️ para a comunidade competitiva de Pokémon TCG

