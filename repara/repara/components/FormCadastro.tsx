"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Alerta from "@/components/Alerta";

export default function FormCadastro() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", codigoVinculo: "", senha: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // um onChange só para todos os campos (usa o atributo name do input)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível criar a conta");
        return;
      }

      // conta criada: já entra direto
      await signIn("credentials", { email: form.email, senha: form.senha, redirect: false });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErro("Não foi possível criar a conta agora. Verifique a conexão e tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>Para acompanhar seus equipamentos na assistência.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {erro && <Alerta>{erro}</Alerta>}

          <div className="flex flex-col gap-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" name="nome" required value={form.nome} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="telefone">Telefone (opcional)</Label>
            <Input id="telefone" name="telefone" type="tel" value={form.telefone} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="codigoVinculo">Código de vínculo (só se a assistência já te cadastrou)</Label>
            <Input
              id="codigoVinculo"
              name="codigoVinculo"
              autoComplete="off"
              placeholder="Ex.: A1B2C-3D4E5"
              value={form.codigoVinculo}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              required
              minLength={6}
              value={form.senha}
              onChange={handleChange}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
