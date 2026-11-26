"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Alerta from "@/components/Alerta";
import SelectNativo from "@/components/SelectNativo";
import { api } from "@/lib/api";
import { PRIORIDADES, PRIORIDADE_LABEL } from "@/lib/constantes";
import { useAtualizarOrdem } from "@/hooks/useAtualizarOrdem";
import type { OrdemDetalhe, UsuarioItem } from "@/types";

// Dados de recepção da ordem. Só o admin edita.
export default function FormDadosOrdem({ id, ordem }: { id: string; ordem: OrdemDetalhe }) {
  const atualizar = useAtualizarOrdem(id);
  const [salvo, setSalvo] = useState(false);
  const [form, setForm] = useState({
    problemaRelatado: ordem.problemaRelatado ?? "",
    condicoesFisicas: ordem.condicoesFisicas ?? "",
    acessorios: ordem.acessorios ?? "",
    prioridade: ordem.prioridade ?? "normal",
    prazoEstimado: ordem.prazoEstimado ? ordem.prazoEstimado.slice(0, 10) : "",
    tecnicoId: ordem.tecnicoId?._id ?? "",
  });

  const { data: usuarios } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api<UsuarioItem[]>("/api/usuarios"),
  });
  const tecnicos = (usuarios ?? []).filter((u) => u.role === "tecnico" && (u.ativo || u._id === form.tecnicoId));

  const salvar = useMutation({
    mutationFn: () => api(`/api/ordens/${id}`, { method: "PUT", body: JSON.stringify(form) }),
    onSuccess: () => {
      setSalvo(true);
      atualizar();
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setSalvo(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    salvar.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {salvar.error && <Alerta>{salvar.error.message}</Alerta>}
      {salvo && <Alerta tipo="sucesso">Dados salvos</Alerta>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="problemaRelatado">Problema relatado pelo cliente</Label>
        <Textarea
          id="problemaRelatado"
          name="problemaRelatado"
          required
          value={form.problemaRelatado}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="condicoesFisicas">Condições físicas do equipamento</Label>
        <Textarea id="condicoesFisicas" name="condicoesFisicas" value={form.condicoesFisicas} onChange={handleChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="acessorios">Acessórios entregues</Label>
        <Input id="acessorios" name="acessorios" value={form.acessorios} onChange={handleChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="prioridade">Prioridade</Label>
          <SelectNativo id="prioridade" name="prioridade" value={form.prioridade} onChange={handleChange}>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {PRIORIDADE_LABEL[p]}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="prazoEstimado">Prazo estimado</Label>
          <Input id="prazoEstimado" name="prazoEstimado" type="date" value={form.prazoEstimado} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tecnicoId">Técnico responsável</Label>
          <SelectNativo id="tecnicoId" name="tecnicoId" value={form.tecnicoId} onChange={handleChange}>
            <option value="">Sem técnico</option>
            {tecnicos.map((t) => (
              <option key={t._id} value={t._id}>
                {t.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando..." : "Salvar dados"}
        </Button>
      </div>
    </form>
  );
}
