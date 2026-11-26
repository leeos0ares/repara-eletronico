"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Alerta from "@/components/Alerta";
import FormEquipamento from "@/components/FormEquipamento";
import SelectNativo from "@/components/SelectNativo";
import { api } from "@/lib/api";
import { TIPOS_EQUIPAMENTO, TIPO_EQUIPAMENTO_LABEL } from "@/lib/constantes";
import { useUiStore } from "@/store/useUiStore";
import type { Aviso, EquipamentoItem } from "@/types";

type Props = {
  podeEditar: boolean; // admin
  mostrarCliente: boolean; // o cliente não precisa ver a coluna com o próprio nome
};

export default function ListaEquipamentos({ podeEditar, mostrarCliente }: Props) {
  const queryClient = useQueryClient();
  const {
    buscaEquipamento,
    setBuscaEquipamento,
    tipoEquipamento,
    setTipoEquipamento,
    modalEquipamento,
    abrirModalEquipamento,
    fecharModalEquipamento,
  } = useUiStore();
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const { data: equipamentos, isLoading, error } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => api<EquipamentoItem[]>("/api/equipamentos"),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => api(`/api/equipamentos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
      setAviso({ tipo: "sucesso", texto: "Equipamento excluído" });
    },
    onError: (e: Error) => setAviso({ tipo: "erro", texto: e.message }),
  });

  const busca = buscaEquipamento.toLowerCase();
  const filtrados = (equipamentos ?? []).filter((e) => {
    const bateTipo = !tipoEquipamento || e.tipo === tipoEquipamento;
    const bateBusca = [e.marca, e.modelo, e.numeroSerie ?? "", e.clienteId?.nome ?? ""].some((campo) =>
      campo.toLowerCase().includes(busca)
    );
    return bateTipo && bateBusca;
  });

  function handleExcluir(equipamento: EquipamentoItem) {
    if (confirm(`Excluir ${equipamento.marca} ${equipamento.modelo}?`)) {
      excluir.mutate(equipamento._id);
    }
  }

  const colunas = 3 + (mostrarCliente ? 1 : 0) + (podeEditar ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            className="sm:w-72"
            placeholder="Buscar por marca, modelo, série ou cliente"
            value={buscaEquipamento}
            onChange={(e) => setBuscaEquipamento(e.target.value)}
          />
          <SelectNativo className="sm:w-48" value={tipoEquipamento} onChange={(e) => setTipoEquipamento(e.target.value)}>
            <option value="">Todos os tipos</option>
            {TIPOS_EQUIPAMENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_EQUIPAMENTO_LABEL[tipo]}
              </option>
            ))}
          </SelectNativo>
        </div>
        {podeEditar && <Button onClick={() => abrirModalEquipamento()}>Novo equipamento</Button>}
      </div>

      {aviso && <Alerta tipo={aviso.tipo}>{aviso.texto}</Alerta>}
      {error && <Alerta>{error.message}</Alerta>}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Tipo</TableHead>
              {mostrarCliente && <TableHead>Cliente</TableHead>}
              <TableHead>Nº de série</TableHead>
              {podeEditar && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={colunas} className="text-muted-foreground">
                  Carregando equipamentos...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={colunas} className="text-muted-foreground">
                  {equipamentos?.length
                    ? "Nenhum equipamento encontrado com esses filtros."
                    : "Nenhum equipamento cadastrado ainda."}
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((equipamento) => (
              <TableRow key={equipamento._id}>
                <TableCell>
                  <Link href={`/equipamentos/${equipamento._id}`} className="font-medium hover:underline">
                    {equipamento.marca} {equipamento.modelo}
                  </Link>
                </TableCell>
                <TableCell>{TIPO_EQUIPAMENTO_LABEL[equipamento.tipo]}</TableCell>
                {mostrarCliente && <TableCell>{equipamento.clienteId?.nome ?? "—"}</TableCell>}
                <TableCell>{equipamento.numeroSerie || "—"}</TableCell>
                {podeEditar && (
                  <TableCell className="space-x-2 text-right whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => abrirModalEquipamento(equipamento)}>
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={excluir.isPending}
                      onClick={() => handleExcluir(equipamento)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalEquipamento.aberto} onOpenChange={(aberto) => !aberto && fecharModalEquipamento()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalEquipamento.item ? "Editar equipamento" : "Novo equipamento"}</DialogTitle>
            <DialogDescription>Os campos de especificação aparecem para computador e notebook.</DialogDescription>
          </DialogHeader>
          <FormEquipamento
            item={modalEquipamento.item}
            onSalvo={(texto) => {
              fecharModalEquipamento();
              setAviso({ tipo: "sucesso", texto });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
