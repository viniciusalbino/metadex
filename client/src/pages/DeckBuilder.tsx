import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Download, Upload, Save, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function DeckBuilder() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [deckName, setDeckName] = useState("");
  const [format, setFormat] = useState("Standard");
  const [decklistText, setDecklistText] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const parseMutation = trpc.decks.parsePTCGL.useMutation();
  const createMutation = trpc.decks.create.useMutation();

  const handleParse = async () => {
    if (!decklistText.trim()) {
      toast.error("Cole uma decklist primeiro");
      return;
    }

    try {
      const result = await parseMutation.mutateAsync(decklistText);
      toast.success(`Decklist válida: ${result.totalCards} cartas`);
      
      if (result.totalCards !== 60) {
        toast.warning(`Atenção: deck deve ter 60 cartas (atual: ${result.totalCards})`);
      }
    } catch (error) {
      toast.error("Erro ao processar decklist");
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Faça login para salvar decks");
      return;
    }

    if (!deckName.trim()) {
      toast.error("Digite um nome para o deck");
      return;
    }

    if (!decklistText.trim()) {
      toast.error("Cole uma decklist primeiro");
      return;
    }

    try {
      const parseResult = await parseMutation.mutateAsync(decklistText);
      
      if (parseResult.totalCards !== 60) {
        toast.error("Deck deve ter exatamente 60 cartas");
        return;
      }

      const result = await createMutation.mutateAsync({
        name: deckName,
        format,
        decklist: JSON.stringify(parseResult.cards),
        decklistText,
        isPublic,
      });

      toast.success("Deck salvo com sucesso!");
      
      if (result.shareToken) {
        toast.info("Link de compartilhamento gerado");
      }

      setLocation("/my-decks");
    } catch (error) {
      toast.error("Erro ao salvar deck");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDecklistText(text);
      toast.success("Arquivo importado");
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (!decklistText.trim()) {
      toast.error("Nenhuma decklist para exportar");
      return;
    }

    const blob = new Blob([decklistText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deckName || "deck"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Deck exportado");
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
              Faça login para criar e salvar seus decks
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Construtor de Decks</h1>
          <p className="text-muted-foreground">
            Crie e gerencie seus decks no formato PTCGL
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Deck</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deckName">Nome do Deck</Label>
                  <Input
                    id="deckName"
                    placeholder="Ex: Charizard ex Control"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Expanded">Expanded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    Tornar deck público e gerar link de compartilhamento
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decklist (Formato PTCGL)</CardTitle>
                <CardDescription>
                  Cole sua decklist no formato: Quantidade Nome SET Número
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="4 Charizard ex OBF 125&#10;2 Charmander OBF 26&#10;3 Charmeleon OBF 27&#10;..."
                  value={decklistText}
                  onChange={(e) => setDecklistText(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />

                <div className="flex gap-2">
                  <Button onClick={handleParse} variant="outline" className="flex-1">
                    Validar Decklist
                  </Button>
                  <label htmlFor="import-file">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                      </span>
                    </Button>
                  </label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".txt"
                    onChange={handleImport}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleSave}
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? "Salvando..." : "Salvar Deck"}
                </Button>

                <Button onClick={handleExport} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar como .txt
                </Button>

                {isPublic && (
                  <Button variant="outline" className="w-full" disabled>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar (disponível após salvar)
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formato PTCGL</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Cada linha deve seguir o formato:</p>
                <code className="block bg-muted p-2 rounded">
                  [Quantidade] [Nome da Carta] [SET] [Número]
                </code>
                <p className="pt-2">Exemplo:</p>
                <code className="block bg-muted p-2 rounded font-mono text-xs">
                  4 Charizard ex OBF 125<br />
                  2 Charmander OBF 26<br />
                  3 Charmeleon OBF 27<br />
                  4 Rare Candy SVI 191
                </code>
                <p className="pt-2">
                  • Deck deve ter exatamente 60 cartas<br />
                  • Máximo de 4 cópias por carta (exceto Energias Básicas)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

