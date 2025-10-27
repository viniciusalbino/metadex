import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useSearch } from "wouter";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    if (!token) {
      setError("Token de verificação não fornecido");
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyMutation.mutateAsync({ token });
        setSuccess(true);
        toast.success(result.message);
      } catch (err: any) {
        setError(err.message || "Erro ao verificar email");
        toast.error(err.message || "Erro ao verificar email");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">{APP_TITLE}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verificação de Email</CardTitle>
            <CardDescription>
              {verifying && "Verificando seu email..."}
              {success && "Email verificado com sucesso!"}
              {error && "Erro na verificação"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              {verifying && (
                <>
                  <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Aguarde um momento...</p>
                </>
              )}

              {success && (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-center mb-6">
                    Seu email foi verificado com sucesso! Agora você pode fazer login e começar a
                    usar o MetaDex.
                  </p>
                  <Button onClick={() => setLocation("/auth")} className="w-full">
                    Ir para Login
                  </Button>
                </>
              )}

              {error && (
                <>
                  <XCircle className="h-16 w-16 text-destructive mb-4" />
                  <p className="text-center mb-6 text-destructive">{error}</p>
                  <div className="space-y-2 w-full">
                    <Button onClick={() => setLocation("/auth")} className="w-full">
                      Ir para Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/")}
                      className="w-full"
                    >
                      Voltar para Home
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

