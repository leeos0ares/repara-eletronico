"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Alerta from "@/components/Alerta";
import { api } from "@/lib/api";

type Props = {
  clienteId: string;
  codigoInicial: string | null;
};

export default function CodigoVinculo({ clienteId, codigoInicial }: Props) {
  const [codigo, setCodigo] = useState(codigoInicial);

  const gerar = useMutation({
    mutationFn: () => api<{ codigo: string }>(`/api/clientes/${clienteId}/codigo`, { method: "POST" }),
    onSuccess: (data) => setCodigo(data.codigo),
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Este cliente ainda não tem conta. Para criar a conta usando o e-mail dele, ele precisa informar este código no
        cadastro. Entregue o código só para ele. O código vale uma vez e é apagado quando a conta é criada.
      </p>

      {gerar.error && <Alerta>{gerar.error.message}</Alerta>}

      <div className="flex flex-wrap items-center gap-3">
        {codigo ? (
          <code className="rounded-md border border-border bg-muted px-3 py-1.5 font-mono text-lg tracking-wider">{codigo}</code>
        ) : (
          <span className="text-sm text-muted-foreground">Nenhum código gerado ainda.</span>
        )}
        <Button variant="outline" size="sm" disabled={gerar.isPending} onClick={() => gerar.mutate()}>
          {gerar.isPending ? "Gerando..." : codigo ? "Gerar novo código" : "Gerar código"}
        </Button>
      </div>
    </div>
  );
}
