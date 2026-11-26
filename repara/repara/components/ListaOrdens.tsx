"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Alerta from "@/components/Alerta";
import { PrioridadeBadge, StatusBadge } from "@/components/Etiquetas";
import SelectNativo from "@/components/SelectNativo";
import { api } from "@/lib/api";
import { PRIORIDADES, PRIORIDADE_LABEL, STATUS_LABEL, STATUS_OS, type Role } from "@/lib/constantes";
import { formatarData, numeroOS } from "@/lib/formatar";
import { useUiStore } from "@/store/useUiStore";
import type { OrdemItem } from "@/types";

export default function ListaOrdens({ role, statusInicial }: { role: Role; statusInicial: string }) {
  const {
    buscaOrdem,
    setBuscaOrdem,
    statusOrdem,
    setStatusOrdem,
    prioridadeOrdem,
    setPrioridadeOrdem,
    tecnicoOrdem,
    setTecnicoOrdem,
  } = useUiStore();

  // veio de um cartão do dashboard (/ordens?status=em_reparo): aplica o filtro ao abrir a página
  useEffect(() => {
    setStatusOrdem(statusInicial);
  }, [statusInicial, setStatusOrdem]);

  const ehEquipe = role !== "cliente"; // cliente não vê prioridade nem cliente (é ele mesmo)
  const ehAdmin = role === "admin"; // técnico só vê as dele, então a coluna de técnico não faz sentido

  const { data: ordens, isLoading, error } = useQuery({
    queryKey: ["ordens"],
    queryFn: () => api<OrdemItem[]>("/api/ordens"),
  });

  // técnicos que aparecem nas ordens carregadas (para o filtro)
  const tecnicos = new Map<string, string>();
  (ordens ?? []).forEach((o) => {
    if (o.tecnicoId) tecnicos.set(o.tecnicoId._id, o.tecnicoId.nome);
  });

  const busca = buscaOrdem.toLowerCase();
  const filtradas = (ordens ?? []).filter((o) => {
    if (statusOrdem && o.status !== statusOrdem) return false;
    if (prioridadeOrdem && o.prioridade !== prioridadeOrdem) return false;
    if (tecnicoOrdem === "sem" && o.tecnicoId) return false;
    if (tecnicoOrdem && tecnicoOrdem !== "sem" && o.tecnicoId?._id !== tecnicoOrdem) return false;

    const textoOrdem = [
      numeroOS(o.numero),
      String(o.numero),
      o.clienteId?.nome ?? "",
      o.equipamentoId?.marca ?? "",
      o.equipamentoId?.modelo ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return textoOrdem.includes(busca);
  });

  const colunas = 4 + (ehEquipe ? 2 : 0) + (ehAdmin ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Input
            className="sm:w-64"
            placeholder="Buscar por nº, cliente ou equipamento"
            value={buscaOrdem}
            onChange={(e) => setBuscaOrdem(e.target.value)}
          />
          <SelectNativo className="sm:w-48" value={statusOrdem} onChange={(e) => setStatusOrdem(e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS_OS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </SelectNativo>
          {ehEquipe && (
            <SelectNativo
              className="sm:w-44"
              value={prioridadeOrdem}
              onChange={(e) => setPrioridadeOrdem(e.target.value)}
            >
              <option value="">Todas as prioridades</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {PRIORIDADE_LABEL[p]}
                </option>
              ))}
            </SelectNativo>
          )}
          {ehAdmin && (
            <SelectNativo className="sm:w-44" value={tecnicoOrdem} onChange={(e) => setTecnicoOrdem(e.target.value)}>
              <option value="">Todos os técnicos</option>
              <option value="sem">Sem técnico</option>
              {Array.from(tecnicos).map(([tecnicoId, nome]) => (
                <option key={tecnicoId} value={tecnicoId}>
                  {nome}
                </option>
              ))}
            </SelectNativo>
          )}
        </div>
        {ehAdmin && (
          <Link href="/ordens/nova" className={buttonVariants()}>
            Nova ordem
          </Link>
        )}
      </div>

      {error && <Alerta>{error.message}</Alerta>}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Equipamento</TableHead>
              {ehEquipe && <TableHead>Cliente</TableHead>}
              <TableHead>Status</TableHead>
              {ehEquipe && <TableHead>Prioridade</TableHead>}
              {ehAdmin && <TableHead>Técnico</TableHead>}
              <TableHead>Entrada</TableHead>
              <TableHead>Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={colunas} className="text-muted-foreground">
                  Carregando ordens...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={colunas} className="text-muted-foreground">
                  {ordens?.length ? "Nenhuma ordem encontrada com esses filtros." : "Nenhuma ordem de serviço ainda."}
                </TableCell>
              </TableRow>
            )}
            {filtradas.map((ordem) => (
              <TableRow key={ordem._id}>
                <TableCell>
                  <Link href={`/ordens/${ordem._id}`} className="font-mono font-medium hover:underline">
                    {numeroOS(ordem.numero)}
                  </Link>
                </TableCell>
                <TableCell>
                  {ordem.equipamentoId?.marca} {ordem.equipamentoId?.modelo}
                </TableCell>
                {ehEquipe && <TableCell>{ordem.clienteId?.nome}</TableCell>}
                <TableCell>
                  <StatusBadge status={ordem.status} />
                </TableCell>
                {ehEquipe && <TableCell>{ordem.prioridade && <PrioridadeBadge prioridade={ordem.prioridade} />}</TableCell>}
                {ehAdmin && <TableCell>{ordem.tecnicoId?.nome ?? "—"}</TableCell>}
                <TableCell>{formatarData(ordem.createdAt)}</TableCell>
                <TableCell>{formatarData(ordem.prazoEstimado)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
