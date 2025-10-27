import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Tournaments() {
  const [format, setFormat] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const { data: tournaments, isLoading } = trpc.tournaments.list.useQuery({
    format: format || undefined,
    status: status || undefined,
    limit: 50,
  });

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Torneios</h1>
          <p className="text-muted-foreground">
            Acompanhe os principais torneios de Pokémon TCG ao redor do mundo
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Expanded">Expanded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="upcoming">Próximos</SelectItem>
              <SelectItem value="ongoing">Em Andamento</SelectItem>
              <SelectItem value="completed">Finalizados</SelectItem>
            </SelectContent>
          </Select>

          {format || status ? (
            <Button
              variant="outline"
              onClick={() => {
                setFormat("");
                setStatus("");
              }}
            >
              Limpar Filtros
            </Button>
          ) : null}
        </div>

        {/* Tournament List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : tournaments && tournaments.length > 0 ? (
          <div className="grid gap-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{tournament.name}</CardTitle>
                      <CardDescription className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(tournament.date).toLocaleDateString("pt-BR")}
                        </span>
                        {tournament.city && tournament.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {tournament.city}, {tournament.country}
                          </span>
                        )}
                        {tournament.playerCount && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tournament.playerCount} jogadores
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {tournament.format}
                      </span>
                      {tournament.eventType && (
                        <span className="text-xs text-muted-foreground">
                          {tournament.eventType}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button asChild variant="default" size="sm">
                    <Link href={`/tournaments/${tournament.id}`}>Ver Detalhes</Link>
                  </Button>
                  {tournament.externalUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={tournament.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Link Externo
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum torneio encontrado com os filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

