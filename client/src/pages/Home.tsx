import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Trophy, Swords, BookOpen, BarChart3, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-24 w-24 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              {APP_TITLE}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A plataforma definitiva para o cenário competitivo de Pokémon TCG. Acompanhe
              torneios, construa decks, registre batalhas e analise o metagame.
            </p>
            {!loading && !isAuthenticated && (
              <Button asChild size="lg" className="text-lg px-8">
                <a href={getLoginUrl()}>Começar Agora</a>
              </Button>
            )}
            {isAuthenticated && (
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/tournaments">Ver Torneios</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/metagame">Análise de Meta</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Agregador de Torneios</CardTitle>
                <CardDescription>
                  Acompanhe todos os torneios de Pokémon TCG em um só lugar. Filtros por
                  formato, localização e data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Construtor de Decks</CardTitle>
                <CardDescription>
                  Crie, edite e compartilhe seus decks. Import/export no formato PTCGL.
                  Validação automática de regras.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Swords className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Diário de Batalha</CardTitle>
                <CardDescription>
                  Registre suas partidas e acompanhe seu desempenho. Estatísticas detalhadas
                  por arquétipo e matchup.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Análise de Meta</CardTitle>
                <CardDescription>
                  Motor de análise com MRI (Meta-Relevance Index), usage rate, conversion
                  rate e matriz de matchups.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Tendências</CardTitle>
                <CardDescription>
                  Acompanhe a evolução do metagame ao longo do tempo. Gráficos e rankings
                  dinâmicos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Comunidade</CardTitle>
                <CardDescription>
                  Compartilhe decks, participe de discussões e conecte-se com outros
                  jogadores competitivos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!loading && !isAuthenticated && (
        <section className="bg-primary/10 py-16 px-4">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Pronto para dominar o meta?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Junte-se aos melhores jogadores de Pokémon TCG e leve seu jogo para o próximo
                nível.
              </p>
              <Button asChild size="lg" className="text-lg px-8">
                <a href={getLoginUrl()}>Criar Conta Grátis</a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t mt-auto py-8 px-4">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 {APP_TITLE}. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Pokémon TCG é marca registrada da The Pokémon Company.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

