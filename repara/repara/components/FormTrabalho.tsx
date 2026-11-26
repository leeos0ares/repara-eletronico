"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Alerta from "@/components/Alerta";
import { api } from "@/lib/api";
import { useAtualizarOrdem } from "@/hooks/useAtualizarOrdem";
import type { OrdemDetalhe } from "@/types";

// Parte técnica da ordem: diagnóstico, reparo, peças e testes
const campos = [
  { name: "diagnostico", label: "Diagnóstico" },
  { name: "servicoExecutar", label: "Serviço a ser executado" },
  { name: "procedimentosRealizados", label: "Procedimentos realizados" },
  { name: "pecasUtilizadas", label: "Peças utilizadas" },
  { name: "resultadoTestes", label: "Resultado dos testes" },
  { name: "observacoesInternas", label: "Observações internas (o cliente não vê)" },
] as const;

export default function FormTrabalho({ id, ordem }: { id: string; ordem: OrdemDetalhe }) {
  const atualizar = useAtualizarOrdem(id);
  const [salvo, setSalvo] = useState(false);
  const [form, setForm] = useState({
    diagnostico: ordem.diagnostico ?? "",
    servicoExecutar: ordem.servicoExecutar ?? "",
    procedimentosRealizados: ordem.procedimentosRealizados ?? "",
    pecasUtilizadas: ordem.pecasUtilizadas ?? "",
    resultadoTestes: ordem.resultadoTestes ?? "",
    observacoesInternas: ordem.observacoesInternas ?? "",
  });

  const salvar = useMutation({
    mutationFn: () => api(`/api/ordens/${id}`, { method: "PUT", body: JSON.stringify(form) }),
    onSuccess: () => {
      setSalvo(true);
      atualizar();
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
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
      {salvo && <Alerta tipo="sucesso">Alterações salvas</Alerta>}

      {campos.map((campo) => (
        <div key={campo.name} className="flex flex-col gap-2">
          <Label htmlFor={campo.name}>{campo.label}</Label>
          <Textarea id={campo.name} name={campo.name} value={form[campo.name]} onChange={handleChange} />
        </div>
      ))}

      <div>
        <Button type="submit" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
