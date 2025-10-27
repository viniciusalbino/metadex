# MetaDex - TODO

## Fase 1: Configuração Inicial e Schema do Banco de Dados
- [x] Definir schema completo para torneios
- [x] Definir schema para decks e cartas
- [x] Definir schema para diário de batalha
- [x] Definir schema para análise de metagame
- [x] Adicionar role "organizer" para lojistas
- [x] Push do schema para o banco de dados

## Fase 2: Sistema de Autenticação e Roles
- [x] Implementar role "organizer" (lojista)
- [x] Sistema de aprovação para lojistas
- [x] Middleware de verificação de roles

## Fase 3: Agregador de Torneios
- [x] Criar tabelas de torneios no banco
- [ ] Implementar scraper do LimitlessTCG
- [ ] Adaptar script Python do RK9 para TypeScript
- [ ] Criar endpoint para importar torneios do RK9
- [x] Sistema de cadastro manual de torneios (lojistas)
- [x] Sistema de aprovação de torneios
- [x] Endpoints tRPC para torneios
- [ ] Interface de listagem de torneios
- [ ] Filtros (formato, localização, data, status)
- [ ] Página de detalhes do torneio
- [ ] Exportação para calendário (Google Calendar, iCal)

## Fase 4: Diário de Batalha
- [x] Criar tabelas para registro de partidas
- [x] Endpoints tRPC para battle logs
- [x] Cálculo de win-rate por arquétipo
- [ ] Formulário de registro de partidas
- [ ] Seleção de arquétipos (dropdown integrado com meta)
- [ ] Dashboard pessoal com estatísticas
- [ ] Gráficos de performance

## Fase 5: Construtor de Decks
- [x] Criar tabelas para decks e cartas
- [x] Sistema de save/edit/delete decks
- [x] Import de decks (formato PTCGL)
- [x] Export de decks (formato PTCGL)
- [x] Compartilhamento de decks (link único)
- [x] Endpoints tRPC completos
- [ ] Integração com API de cartas Pokémon TCG
- [ ] Interface de construção de decks
- [ ] Busca em tempo real de cartas
- [ ] Validação de decks (60 cartas, máx 4 cópias)
- [ ] Mostrar stats de cartas (usage rate, win rate)

## Fase 6: Motor de Análise de Meta
- [x] Criar tabelas para metagame snapshots
- [x] Criar tabelas para matchup matrix
- [x] Endpoints tRPC para metagame
- [x] Sistema de arquétipos
- [ ] Parser de decklists do LimitlessTCG
- [ ] Sistema de identificação de arquétipos
- [ ] Cálculo de Usage Rate (UR)
- [ ] Cálculo de Conversion Rate (CR)
- [ ] Cálculo de Meta-Relevance Index (MRI)
- [ ] Ranking dinâmico de arquétipos
- [ ] Gráficos de tendências ao longo do tempo
- [ ] Matriz de matchups (win-rate deck vs deck)
- [ ] Filtros por período, tipo de evento, formato

## Fase 7: Design e Interface
- [x] Criar logo do MetaDex
- [x] Definir paleta de cores (branco, preto, cinza, azul, vermelho)
- [x] Configurar constantes do projeto
- [ ] Implementar tema dark/light
- [ ] Criar layout de navegação
- [ ] Página inicial (landing page)
- [ ] Design responsivo
- [ ] Ícones e assets visuais

## Fase 8: Testes e Refinamentos
- [ ] Testar todos os fluxos de usuário
- [ ] Testar sistema de roles
- [ ] Testar scrapers
- [ ] Validar cálculos de métricas
- [ ] Testes de performance
- [ ] Correção de bugs

## Fase 9: Repositório GitHub
- [ ] Criar repositório no GitHub
- [ ] Escrever README completo
- [ ] Adicionar documentação
- [ ] Push do código

## Fase 10: Entrega
- [ ] Checkpoint final
- [ ] Documentação de deployment
- [ ] Entrega ao usuário

