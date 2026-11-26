"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Alerta from "@/components/Alerta";
import SelectNativo from "@/components/SelectNativo";
import { api } from "@/lib/api";
import { PRIORIDADES, PRIORIDADE_LABEL } from "@/lib/constantes";
import type { EquipamentoItem, UsuarioItem } from "@/types";

export default function FormNovaOrdem({ equipamentoInicial }: { equipamentoInicial: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    equipamentoId: equipamentoInicial,
    problemaRelatado: "",
    condicoesFisicas: "",
    acessorios: "",
    prioridade: "normal",
    prazoEstimado: "",
    tecnicoId: "",
    observacoesInternas: "",
  });

  const { data: equipamentos, isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => api<EquipamentoItem[]>("/api/equipamentos"),
  });
  const { data: usuarios } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api<UsuarioItem[]>("/api/usuarios"),
  });
  const tecnicos = (usuarios ?? []).filter((u) => u.role === "tecnico" && u.ativo);

  const criar = useMutation({
    mutationFn: () => api<{ _id: string }>("/api/ordens", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
      router.push(`/ordens/${data._id}`);
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    criar.mutate();
  }

  if (!isLoading && equipamentos?.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há equipamentos cadastrados.{" "}
        <Link href="/equipamentos" className="text-primary hover:underline">
          Cadastre o equipamento primeiro
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {criar.error && <Alerta>{criar.error.message}</Alerta>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="equipamentoId">Equipamento recebido</Label>
        <SelectNativo id="equipamentoId" name="equipamentoId" required value={form.equipamentoId} onChange={handleChange}>
          <option value="">{isLoading ? "Carregando..." : "Selecione o equipamento"}</option>
          {equipamentos?.map((e) => (
            <option key={e._id} value={e._id}>
              {e.marca} {e.modelo} (cliente: {e.clienteId?.nome})
            </option>
          ))}
        </SelectNativo>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="problemaRelatado">Problema relatado pelo cliente</Label>
        <Textarea
          id="problemaRelatado"
          name="problemaRelatado"
          required
          placeholder="Ex.: não liga, esquenta muito, tela com listras"
          value={form.problemaRelatado}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="condicoesFisicas">Condições físicas do equipamento</Label>
        <Textarea
          id="condicoesFisicas"
          name="condicoesFisicas"
          placeholder="Ex.: arranhões na tampa, falta um parafuso"
          value={form.condicoesFisicas}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="acessorios">Acessórios entregues</Label>
        <Input
          id="acessorios"
          name="acessorios"
          placeholder="Ex.: carregador, cabo HDMI"
          value={form.acessorios}
          onChange={handleChange}
        />
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
            <option value="">Definir depois</option>
            {tecnicos.map((t) => (
              <option key={t._id} value={t._id}>
                {t.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observacoesInternas">Observações internas (o cliente não vê)</Label>
        <Textarea
          id="observacoesInternas"
          name="observacoesInternas"
          value={form.observacoesInternas}
          onChange={handleChange}
        />
      </div>

      <div>
        <Button type="submit" disabled={criar.isPending}>
          {criar.isPending ? "Abrindo ordem..." : "Abrir ordem de serviço"}
        </Button>
      </div>
    </form>
  );
}
