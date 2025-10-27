import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Users, Target } from "lucide-react";
import { useState } from "react";

export default function Metagame() {
  const [format, setFormat] = useState("Standard");
  const [period, setPeriod] = useState("month");

  const { data: snapshots, isLoading } = trpc.metagame.snapshots.useQuery({
    format,
    period,
    limit: 20,
  });

  const { data: archetypes } = trpc.archetypes.list.useQuery();

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Análise de Metagame</h1>
          <p className="text-muted-foreground">
            Acompanhe os arquétipos mais relevantes do formato competitivo
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Expanded">Expanded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="all">Todos os Tempos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usage Rate (UR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Percentual de uso do arquétipo no Day 1 dos torneios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Conversion Rate (CR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Taxa de conversão para o Top Cut (Day 2)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                MRI (Meta-Relevance Index)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Índice que combina UR e CR para medir relevância no meta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Arquétipos</CardTitle>
            <CardDescription>
              Ordenado por Meta-Relevance Index (MRI)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !snapshots || snapshots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum dado de metagame disponível para este período.
                </p>
                <p className="text-sm text-muted-foreground">
                  Os dados serão atualizados conforme torneios forem adicionados ao sistema.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {snapshots.map((snapshot, index) => {
                  const archetype = archetypes?.find((a) => a.id === snapshot.archetypeId);
                  const usageRate = snapshot.usageRate / 100;
                  const conversionRate = snapshot.conversionRate / 100;
                  const mri = snapshot.mri / 100;

                  return (
                    <div
                      key={snapshot.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                        #{index + 1}
                      </div>

                      {/* Archetype Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {archetype?.displayName || "Desconhecido"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {snapshot.totalDecks} decks no Day 1 • {snapshot.topCutDecks} no Top Cut
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">UR</p>
                          <p className="font-semibold">{usageRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">CR</p>
                          <p className="font-semibold">{conversionRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">MRI</p>
                          <p className="font-semibold text-primary">{mri.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como interpretar os dados?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Usage Rate (UR)</h4>
              <p>
                Indica a popularidade do deck. Um UR alto significa que muitos jogadores estão
                usando este arquétipo. Exemplo: 15% significa que 15 em cada 100 jogadores usam
                este deck.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Conversion Rate (CR)</h4>
              <p>
                Mede a eficiência do deck em converter participação em resultados. Um CR alto
                indica que o deck performa bem. Exemplo: 80% significa que 8 em cada 10 jogadores
                que usaram o deck chegaram ao Top Cut.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Meta-Relevance Index (MRI)
              </h4>
              <p>
                Combina UR e CR para determinar a relevância geral do deck no metagame. Decks com
                MRI alto são tanto populares quanto eficientes, sendo as melhores escolhas para
                torneios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

