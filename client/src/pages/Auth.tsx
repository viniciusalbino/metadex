import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword,
      });

      toast.success("Login realizado com sucesso!");
      setLocation("/");
      window.location.reload(); // Reload to update auth state
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      toast.success(result.message);
      setActiveTab("login");
      setLoginEmail(registerEmail);
      
      // Clear register form
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Login com Google em breve! Configure as credenciais primeiro.");
    // TODO: Implement Google OAuth
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">{APP_TITLE}</h1>
          <p className="text-muted-foreground mt-2">
            Plataforma competitiva de Pokémon TCG
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Entre com seu email e senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Ou continue com
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Cadastre-se para começar a usar o MetaDex
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Nome</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* TODO: Add Cloudflare Turnstile widget here */}
                  {/* <div className="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div> */}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Ao criar uma conta, você concorda com nossos Termos de Uso e Política de
                    Privacidade
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Button variant="link" onClick={() => setLocation("/")}>
            ← Voltar para home
          </Button>
        </div>
      </div>
    </div>
  );
}

