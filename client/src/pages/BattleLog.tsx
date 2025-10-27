import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BattleLog() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [opponentArchetypeId, setOpponentArchetypeId] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "draw">("win");
  const [notes, setNotes] = useState("");

  const { data: archetypes } = trpc.archetypes.list.useQuery();
  const { data: logs, refetch: refetchLogs } = trpc.battleLog.myLogs.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );
  const { data: stats } = trpc.battleLog.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.battleLog.create.useMutation();

  const handleSubmit = async () => {
    if (!opponentArchetypeId) {
      toast.error("Selecione o arquétipo do oponente");
      return;
    }

    try {
      await createMutation.mutateAsync({
        opponentArchetypeId: parseInt(opponentArchetypeId),
        result,
        notes: notes || undefined,
      });

      toast.success("Batalha registrada!");
      setDialogOpen(false);
      setOpponentArchetypeId("");
      setResult("win");
      setNotes("");
      refetchLogs();
    } catch (error) {
      toast.error("Erro ao registrar batalha");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>
              Faça login para registrar suas batalhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Diário de Batalha</h1>
            <p className="text-muted-foreground">
              Registre suas partidas e acompanhe seu desempenho
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Batalha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Batalha</DialogTitle>
                <DialogDescription>
                  Adicione uma nova partida ao seu histórico
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="opponent">Arquétipo do Oponente</Label>
                  <Select value={opponentArchetypeId} onValueChange={setOpponentArchetypeId}>
                    <SelectTrigger id="opponent">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {archetypes?.map((archetype) => (
                        <SelectItem key={archetype.id} value={archetype.id.toString()}>
                          {archetype.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="result">Resultado</Label>
                  <Select value={result} onValueChange={(v: any) => setResult(v)}>
                    <SelectTrigger id="result">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="win">Vitória</SelectItem>
                      <SelectItem value="loss">Derrota</SelectItem>
                      <SelectItem value="draw">Empate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre a partida..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Partidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalGames}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vitórias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Derrotas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{stats.losses}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Battle History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Batalhas</CardTitle>
          </CardHeader>
          <CardContent>
            {!logs || logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma batalha registrada ainda. Clique em "Nova Batalha" para começar!
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => {
                  const opponent = archetypes?.find((a) => a.id === log.opponentArchetypeId);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {log.result === "win" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : log.result === "loss" ? (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2" />
                        )}
                        <div>
                          <p className="font-medium">
                            vs {opponent?.displayName || "Desconhecido"}
                          </p>
                          {log.notes && (
                            <p className="text-sm text-muted-foreground">{log.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{log.result === "win" ? "Vitória" : log.result === "loss" ? "Derrota" : "Empate"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.playedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

