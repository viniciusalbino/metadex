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
- [x] Interface de listagem de torneios
- [x] Filtros (formato, status)
- [ ] Página de detalhes do torneio
- [ ] Exportação para calendário (Google Calendar, iCal)

## Fase 4: Diário de Batalha
- [x] Criar tabelas para registro de partidas
- [x] Endpoints tRPC para battle logs
- [x] Cálculo de win-rate por arquétipo
- [x] Formulário de registro de partidas
- [x] Seleção de arquétipos (dropdown integrado com meta)
- [x] Dashboard pessoal com estatísticas
- [ ] Gráficos de performance

## Fase 5: Construtor de Decks
- [x] Criar tabelas para decks e cartas
- [x] Sistema de save/edit/delete decks
- [x] Import de decks (formato PTCGL)
- [x] Export de decks (formato PTCGL)
- [x] Compartilhamento de decks (link único)
- [x] Endpoints tRPC completos
- [ ] Integração com API de cartas Pokémon TCG
- [x] Interface de construção de decks
- [x] Validação de decks (60 cartas)
- [ ] Busca em tempo real de cartas (API externa)
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
- [x] Ranking dinâmico de arquétipos
- [x] Filtros por período e formato
- [x] Interface de visualização de metagame
- [ ] Gráficos de tendências ao longo do tempo
- [ ] Matriz de matchups (win-rate deck vs deck)

## Fase 7: Design e Interface
- [x] Criar logo do MetaDex
- [x] Definir paleta de cores (branco, preto, cinza, azul, vermelho)
- [x] Configurar constantes do projeto
- [x] Implementar tema dark
- [x] Criar layout de navegação (Navbar)
- [x] Página inicial (landing page)
- [x] Design responsivo
- [x] Ícones e assets visuais

## Fase 8: Testes e Refinamentos
- [ ] Testar todos os fluxos de usuário
- [ ] Testar sistema de roles
- [ ] Testar scrapers
- [ ] Validar cálculos de métricas
- [ ] Testes de performance
- [ ] Correção de bugs

## Fase 9: Repositório GitHub
- [x] Criar repositório no GitHub
- [x] Escrever README completo
- [x] Adicionar documentação
- [x] Push do código

## Fase 10: Entrega
- [x] Checkpoint final
- [x] Documentação de deployment
- [x] Entrega ao usuário



## Fase 11: Sistema de Autenticação Próprio
- [x] Remover dependência do Manus OAuth
- [x] Implementar cadastro com email/senha
- [x] Implementar login com email/senha
- [x] Hash de senhas com bcrypt
- [x] Adicionar campo de verificação de email no schema
- [x] Sistema de envio de email de confirmação
- [x] Endpoint de verificação de email
- [x] Atualizar frontend com novos formulários
- [x] Página de login/cadastro
- [x] Página de verificação de email
- [ ] Login com Google OAuth (preparado, precisa configurar credenciais)
- [ ] Integração com Cloudflare Turnstile (preparado, precisa configurar chaves)
- [ ] Testar fluxo completo de cadastro
- [ ] Configurar serviço de email (SendGrid, AWS SES, etc)



## Fase 12: Configuração para Desenvolvimento Local
- [x] Criar guia de setup local (LOCAL_SETUP.md)
- [x] Configurar variáveis de ambiente para desenvolvimento (ENV_VARIABLES.md)
- [x] Documentar instalação de dependências
- [x] Instruções para banco de dados local (MySQL, TiDB, Docker)
- [x] Scripts de desenvolvimento
- [x] Atualizar README.md com links para documentação

