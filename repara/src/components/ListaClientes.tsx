"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Alerta from "@/components/Alerta";
import FormCliente from "@/components/FormCliente";
import { api } from "@/lib/api";
import { useUiStore } from "@/store/useUiStore";
import type { Aviso, ClienteItem } from "@/types";

export default function ListaClientes({ podeEditar }: { podeEditar: boolean }) {
  const queryClient = useQueryClient();
  const { buscaCliente, setBuscaCliente, modalCliente, abrirModalCliente, fecharModalCliente } = useUiStore();
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const { data: clientes, isLoading, error } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => api<ClienteItem[]>("/api/clientes"),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => api(`/api/clientes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setAviso({ tipo: "sucesso", texto: "Cliente excluído" });
    },
    onError: (e: Error) => setAviso({ tipo: "erro", texto: e.message }),
  });

  // o filtro roda aqui no front, em cima da lista que já foi carregada
  const busca = buscaCliente.toLowerCase();
  const filtrados = (clientes ?? []).filter((c) =>
    [c.nome, c.email, c.telefone ?? ""].some((campo) => campo.toLowerCase().includes(busca))
  );

  function handleExcluir(cliente: ClienteItem) {
    if (confirm(`Excluir o cliente ${cliente.nome}?`)) {
      excluir.mutate(cliente._id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="sm:max-w-xs"
          placeholder="Buscar por nome, e-mail ou telefone"
          value={buscaCliente}
          onChange={(e) => setBuscaCliente(e.target.value)}
        />
        {podeEditar && <Button onClick={() => abrirModalCliente()}>Novo cliente</Button>}
      </div>

      {aviso && <Alerta tipo={aviso.tipo}>{aviso.texto}</Alerta>}
      {error && <Alerta>{error.message}</Alerta>}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              {podeEditar && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Carregando clientes...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  {clientes?.length ? "Nenhum cliente encontrado com essa busca." : "Nenhum cliente cadastrado ainda."}
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((cliente) => (
              <TableRow key={cliente._id}>
                <TableCell>
                  <Link href={`/clientes/${cliente._id}`} className="font-medium hover:underline">
                    {cliente.nome}
                  </Link>
                </TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.telefone || "—"}</TableCell>
                {podeEditar && (
                  <TableCell className="space-x-2 text-right whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => abrirModalCliente(cliente)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" disabled={excluir.isPending} onClick={() => handleExcluir(cliente)}>
                      Excluir
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalCliente.aberto} onOpenChange={(aberto) => !aberto && fecharModalCliente()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalCliente.item ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>Dados para identificação e contato.</DialogDescription>
          </DialogHeader>
          <FormCliente
            item={modalCliente.item}
            onSalvo={(texto) => {
              fecharModalCliente();
              setAviso({ tipo: "sucesso", texto });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
