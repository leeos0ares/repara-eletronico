"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Alerta from "@/components/Alerta";
import { api } from "@/lib/api";
import type { ClienteItem } from "@/types";

type Props = {
  item: ClienteItem | null; // null = novo cliente
  onSalvo: (mensagem: string) => void;
};

export default function FormCliente({ item, onSalvo }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nome: item?.nome ?? "",
    email: item?.email ?? "",
    telefone: item?.telefone ?? "",
    observacoes: item?.observacoes ?? "",
  });

  const salvar = useMutation({
    mutationFn: () =>
      item
        ? api(`/api/clientes/${item._id}`, { method: "PUT", body: JSON.stringify(form) })
        : api("/api/clientes", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] }); // recarrega a lista
      // o nome do cliente aparece nas listas de equipamentos e de ordens
      queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
      queryClient.invalidateQueries({ queryKey: ["ordem"] });
      onSalvo(item ? "Cliente atualizado" : "Cliente cadastrado");
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    salvar.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {salvar.error && <Alerta>{salvar.error.message}</Alerta>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input id="nome" name="nome" required value={form.nome} onChange={handleChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={!!item?.usuarioId}
          value={form.email}
          onChange={handleChange}
        />
        {item?.usuarioId && (
          <p className="text-xs text-muted-foreground">Este cliente tem conta no sistema, o e-mail não pode mudar.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input id="telefone" name="telefone" type="tel" value={form.telefone} onChange={handleChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" value={form.observacoes} onChange={handleChange} />
      </div>

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
