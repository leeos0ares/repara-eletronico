"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Alerta from "@/components/Alerta";
import { api } from "@/lib/api";
import { useAtualizarOrdem } from "@/hooks/useAtualizarOrdem";

type Props = {
  id: string;
  ehAdmin: boolean; // admin registra a decisão em nome do cliente
};

export default function DecisaoOrcamento({ id, ehAdmin }: Props) {
  const atualizar = useAtualizarOrdem(id);
  const [erro, setErro] = useState("");

  const decidir = useMutation({
    mutationFn: (decisao: "aprovado" | "recusado") =>
      api(`/api/ordens/${id}/orcamento`, { method: "PATCH", body: JSON.stringify({ decisao }) }),
    onSuccess: () => atualizar(),
    onError: (e: Error) => setErro(e.message),
  });

  function handleRecusar() {
    if (confirm("Recusar o orçamento? O reparo não será feito.")) {
      setErro("");
      decidir.mutate("recusado");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-4">
      <p className="text-sm">
        {ehAdmin
          ? "O cliente ainda não decidiu. Se ele já respondeu pessoalmente ou por telefone, registre a decisão aqui."
          : "Confira o orçamento acima e escolha se o reparo pode ser feito."}
      </p>
      {erro && <Alerta>{erro}</Alerta>}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={decidir.isPending}
          onClick={() => {
            setErro("");
            decidir.mutate("aprovado");
          }}
        >
          {decidir.isPending ? "Enviando..." : "Aprovar orçamento"}
        </Button>
        <Button variant="outline" disabled={decidir.isPending} onClick={handleRecusar}>
          Recusar
        </Button>
      </div>
    </div>
  );
}
