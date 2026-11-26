"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Alerta from "@/components/Alerta";
import { api } from "@/lib/api";
import { formatarMoeda } from "@/lib/formatar";
import { useAtualizarOrdem } from "@/hooks/useAtualizarOrdem";
import type { OrcamentoItem } from "@/types";

type Props = {
  id: string;
  orcamento?: OrcamentoItem | null;
};

export default function FormOrcamento({ id, orcamento }: Props) {
  const atualizar = useAtualizarOrdem(id);
  const [salvo, setSalvo] = useState(false);
  const [form, setForm] = useState({
    servicos: orcamento?.servicos ?? "",
    pecas: orcamento?.pecas ?? "",
    valorPecas: String(orcamento?.valorPecas ?? 0),
    valorMaoDeObra: String(orcamento?.valorMaoDeObra ?? 0),
    observacoes: orcamento?.observacoes ?? "",
  });

  const total = (Number(form.valorPecas) || 0) + (Number(form.valorMaoDeObra) || 0);

  const salvar = useMutation({
    mutationFn: () => api(`/api/ordens/${id}/orcamento`, { method: "PUT", body: JSON.stringify(form) }),
    onSuccess: () => {
      setSalvo(true);
      atualizar();
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setSalvo(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    salvar.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {orcamento && (
        <p className="text-sm text-muted-foreground">
          Salvar de novo volta o orçamento para pendente e o cliente precisa aprovar outra vez.
        </p>
      )}
      {salvar.error && <Alerta>{salvar.error.message}</Alerta>}
      {salvo && <Alerta tipo="sucesso">Orçamento salvo</Alerta>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="servicos">Serviços a realizar</Label>
        <Textarea id="servicos" name="servicos" required value={form.servicos} onChange={handleChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pecas">Peças necessárias</Label>
        <Input id="pecas" name="pecas" value={form.pecas} onChange={handleChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="valorPecas">Valor das peças (R$)</Label>
          <Input
            id="valorPecas"
            name="valorPecas"
            type="number"
            min="0"
            step="0.01"
            value={form.valorPecas}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="valorMaoDeObra">Mão de obra (R$)</Label>
          <Input
            id="valorMaoDeObra"
            name="valorMaoDeObra"
            type="number"
            min="0"
            step="0.01"
            value={form.valorMaoDeObra}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observacoesOrcamento">Observações</Label>
        <Textarea id="observacoesOrcamento" name="observacoes" value={form.observacoes} onChange={handleChange} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          Total: <span className="font-semibold">{formatarMoeda(total)}</span>
        </p>
        <Button type="submit" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando..." : "Salvar orçamento"}
        </Button>
      </div>
    </form>
  );
}
