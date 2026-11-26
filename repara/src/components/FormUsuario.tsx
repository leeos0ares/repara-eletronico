"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Alerta from "@/components/Alerta";
import SelectNativo from "@/components/SelectNativo";
import { api } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/constantes";
import type { UsuarioItem } from "@/types";

type Props = {
  item: UsuarioItem | null; // null = novo usuário
  meuId: string;
  onSalvo: (mensagem: string) => void;
};

export default function FormUsuario({ item, meuId, onSalvo }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nome: item?.nome ?? "",
    email: item?.email ?? "",
    role: item?.role ?? "tecnico",
    senha: "",
    ativo: item?.ativo ?? true,
  });

  const ehCliente = item?.role === "cliente";
  const ehEuMesmo = item?._id === meuId;

  const salvar = useMutation({
    mutationFn: () =>
      item
        ? api(`/api/usuarios/${item._id}`, { method: "PUT", body: JSON.stringify(form) })
        : api("/api/usuarios", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      // o nome do técnico aparece nas ordens
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
      queryClient.invalidateQueries({ queryKey: ["ordem"] });
      onSalvo(item ? "Usuário atualizado" : "Usuário criado");
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    salvar.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {salvar.error && <Alerta>{salvar.error.message}</Alerta>}

      {ehCliente && (
        <p className="text-sm text-muted-foreground">
          Conta de cliente: nome e e-mail são alterados no cadastro de clientes. Aqui dá para ativar, desativar e
          redefinir a senha.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" required disabled={ehCliente} value={form.nome} onChange={handleChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={ehCliente}
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Perfil</Label>
        <SelectNativo id="role" name="role" disabled={ehCliente || ehEuMesmo} value={form.role} onChange={handleChange}>
          <option value="tecnico">{ROLE_LABEL.tecnico}</option>
          <option value="admin">{ROLE_LABEL.admin}</option>
          {ehCliente && <option value="cliente">{ROLE_LABEL.cliente}</option>}
        </SelectNativo>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">{item ? "Nova senha (deixe em branco para manter)" : "Senha"}</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          required={!item}
          minLength={6}
          value={form.senha}
          onChange={handleChange}
        />
      </div>

      {item && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.ativo}
            disabled={ehEuMesmo}
            onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
          />
          Usuário ativo (desativado não consegue entrar)
        </label>
      )}

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
