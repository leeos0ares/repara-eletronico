"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Alerta from "@/components/Alerta";
import FormUsuario from "@/components/FormUsuario";
import { api } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/constantes";
import { useUiStore } from "@/store/useUiStore";
import type { Aviso, UsuarioItem } from "@/types";

export default function ListaUsuarios({ meuId }: { meuId: string }) {
  const queryClient = useQueryClient();
  const { buscaUsuario, setBuscaUsuario, modalUsuario, abrirModalUsuario, fecharModalUsuario } = useUiStore();
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api<UsuarioItem[]>("/api/usuarios"),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => api(`/api/usuarios/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setAviso({ tipo: "sucesso", texto: "Usuário excluído" });
    },
    onError: (e: Error) => setAviso({ tipo: "erro", texto: e.message }),
  });

  const busca = buscaUsuario.toLowerCase();
  const filtrados = (usuarios ?? []).filter((u) =>
    [u.nome, u.email].some((campo) => campo.toLowerCase().includes(busca))
  );

  function handleExcluir(usuario: UsuarioItem) {
    if (confirm(`Excluir o usuário ${usuario.nome}?`)) {
      excluir.mutate(usuario._id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="sm:max-w-xs"
          placeholder="Buscar por nome ou e-mail"
          value={buscaUsuario}
          onChange={(e) => setBuscaUsuario(e.target.value)}
        />
        <Button onClick={() => abrirModalUsuario()}>Novo usuário</Button>
      </div>

      {aviso && <Alerta tipo={aviso.tipo}>{aviso.texto}</Alerta>}
      {error && <Alerta>{error.message}</Alerta>}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((usuario) => (
              <TableRow key={usuario._id}>
                <TableCell className="font-medium">{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant={usuario.role === "admin" ? "default" : "secondary"}>{ROLE_LABEL[usuario.role]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.ativo ? "outline" : "destructive"}>{usuario.ativo ? "Ativo" : "Inativo"}</Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right whitespace-nowrap">
                  <Button variant="outline" size="sm" onClick={() => abrirModalUsuario(usuario)}>
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={excluir.isPending || usuario._id === meuId}
                    onClick={() => handleExcluir(usuario)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalUsuario.aberto} onOpenChange={(aberto) => !aberto && fecharModalUsuario()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalUsuario.item ? "Editar usuário" : "Novo usuário"}</DialogTitle>
            <DialogDescription>Administradores e técnicos acessam as áreas internas do sistema.</DialogDescription>
          </DialogHeader>
          <FormUsuario
            item={modalUsuario.item}
            meuId={meuId}
            onSalvo={(texto) => {
              fecharModalUsuario();
              setAviso({ tipo: "sucesso", texto });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
