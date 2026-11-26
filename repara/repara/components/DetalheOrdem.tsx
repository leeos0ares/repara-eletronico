"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Alerta from "@/components/Alerta";
import Campo from "@/components/Campo";
import DecisaoOrcamento from "@/components/DecisaoOrcamento";
import { PrioridadeBadge, StatusBadge } from "@/components/Etiquetas";
import FormDadosOrdem from "@/components/FormDadosOrdem";
import FormOrcamento from "@/components/FormOrcamento";
import FormTrabalho from "@/components/FormTrabalho";
import LinhaDoTempo from "@/components/LinhaDoTempo";
import OrcamentoResumo from "@/components/OrcamentoResumo";
import { useAtualizarOrdem } from "@/hooks/useAtualizarOrdem";
import { api } from "@/lib/api";
import type { Role, StatusOS } from "@/lib/constantes";
import { formatarData, numeroOS } from "@/lib/formatar";
import { ACAO_LABEL, STATUS_ENCERRADOS, STATUS_ORCAMENTO_EDITAVEL, proximosStatus } from "@/lib/status";
import type { Aviso, OrdemDetalhe } from "@/types";

export default function DetalheOrdem({ id, role }: { id: string; role: Role }) {
  const atualizar = useAtualizarOrdem(id);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const { data: ordem, isLoading, error } = useQuery({
    queryKey: ["ordem", id],
    queryFn: () => api<OrdemDetalhe>(`/api/ordens/${id}`),
  });

  const mudarStatus = useMutation({
    mutationFn: (novo: StatusOS) => api(`/api/ordens/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: novo }) }),
    onSuccess: () => {
      setAviso({ tipo: "sucesso", texto: "Status atualizado" });
      atualizar();
    },
    onError: (e: Error) => setAviso({ tipo: "erro", texto: e.message }),
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando ordem de serviço...</p>;
  }

  if (error || !ordem) {
    return (
      <div className="flex max-w-md flex-col gap-3">
        <Alerta>{error?.message ?? "Ordem não encontrada"}</Alerta>
        <Link href="/ordens" className="text-sm text-muted-foreground hover:underline">
          Voltar para ordens
        </Link>
      </div>
    );
  }

  const ehEquipe = role !== "cliente";
  const ehAdmin = role === "admin";
  const encerrada = STATUS_ENCERRADOS.includes(ordem.status);
  const acoes = proximosStatus(ordem.status, role); // cliente não tem nenhuma
  const orcamentoEditavel = ehEquipe && STATUS_ORCAMENTO_EDITAVEL.includes(ordem.status);
  const podeDecidir =
    (role === "cliente" || ehAdmin) && ordem.status === "aguardando_aprovacao" && ordem.orcamento?.status === "pendente";

  function handleStatus(novo: StatusOS) {
    if (novo === "cancelado" && !confirm("Cancelar esta ordem de serviço? Isso não pode ser desfeito.")) return;
    setAviso(null);
    mudarStatus.mutate(novo);
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Link href="/ordens" className="text-sm text-muted-foreground hover:underline">
          Voltar para ordens
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">Ordem {numeroOS(ordem.numero)}</h1>
          <StatusBadge status={ordem.status} />
          {ordem.prioridade && <PrioridadeBadge prioridade={ordem.prioridade} />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link href={`/equipamentos/${ordem.equipamentoId?._id}`} className="hover:underline">
            {ordem.equipamentoId?.marca} {ordem.equipamentoId?.modelo}
          </Link>
          {ehEquipe ? (
            <>
              {" "}
              de{" "}
              <Link href={`/clientes/${ordem.clienteId?._id}`} className="hover:underline">
                {ordem.clienteId?.nome}
              </Link>
            </>
          ) : null}
        </p>
      </div>

      {aviso && <Alerta tipo={aviso.tipo}>{aviso.texto}</Alerta>}

      {acoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximo passo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {acoes.map((novo) => (
              <Button
                key={novo}
                variant={novo === "cancelado" ? "outline" : "default"}
                disabled={mudarStatus.isPending}
                onClick={() => handleStatus(novo)}
              >
                {ACAO_LABEL[novo]}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados da ordem</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Campo label="Problema relatado" valor={ordem.problemaRelatado} />
            </div>
            <Campo label="Condições físicas" valor={ordem.condicoesFisicas} />
            <Campo label="Acessórios entregues" valor={ordem.acessorios} />
            <Campo label="Entrada" valor={formatarData(ordem.createdAt)} />
            <Campo label="Prazo estimado" valor={formatarData(ordem.prazoEstimado)} />
            {ehEquipe && <Campo label="Técnico responsável" valor={ordem.tecnicoId?.nome} />}
            {ordem.dataConclusao && <Campo label="Concluída em" valor={formatarData(ordem.dataConclusao)} />}
            {ordem.dataEntrega && <Campo label="Entregue em" valor={formatarData(ordem.dataEntrega)} />}
          </dl>

          {ehAdmin && !encerrada && (
            <details className="rounded-md border border-border p-3">
              <summary className="cursor-pointer text-sm font-medium">Editar dados, prioridade e técnico</summary>
              <div className="mt-4">
                <FormDadosOrdem id={id} ordem={ordem} />
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {ehEquipe ? (
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico e reparo</CardTitle>
          </CardHeader>
          <CardContent>
            {encerrada ? (
              <dl className="grid gap-4">
                <Campo label="Diagnóstico" valor={ordem.diagnostico} />
                <Campo label="Serviço a ser executado" valor={ordem.servicoExecutar} />
                <Campo label="Procedimentos realizados" valor={ordem.procedimentosRealizados} />
                <Campo label="Peças utilizadas" valor={ordem.pecasUtilizadas} />
                <Campo label="Resultado dos testes" valor={ordem.resultadoTestes} />
                <Campo label="Observações internas" valor={ordem.observacoesInternas} />
              </dl>
            ) : (
              <FormTrabalho id={id} ordem={ordem} />
            )}
          </CardContent>
        </Card>
      ) : (
        ordem.diagnostico && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ordem.diagnostico}</p>
            </CardContent>
          </Card>
        )
      )}

      <Card>
        <CardHeader>
          <CardTitle>Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {orcamentoEditavel ? (
            <FormOrcamento id={id} orcamento={ordem.orcamento} />
          ) : ordem.orcamento ? (
            <OrcamentoResumo orcamento={ordem.orcamento} />
          ) : (
            <p className="text-sm text-muted-foreground">Ainda não há orçamento para esta ordem.</p>
          )}

          {orcamentoEditavel && ordem.orcamento && ordem.orcamento.status !== "pendente" && (
            <p className="text-sm text-muted-foreground">
              Orçamento atual: {ordem.orcamento.status === "aprovado" ? "aprovado" : "recusado"} em{" "}
              {formatarData(ordem.orcamento.decididoEm)}.
            </p>
          )}

          {podeDecidir && <DecisaoOrcamento id={id} ehAdmin={ehAdmin} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Andamento</CardTitle>
        </CardHeader>
        <CardContent>
          <LinhaDoTempo movimentacoes={ordem.movimentacoes ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
