"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Alerta from "@/components/Alerta";
import SelectNativo from "@/components/SelectNativo";
import { api } from "@/lib/api";
import { TIPOS_EQUIPAMENTO, TIPO_EQUIPAMENTO_LABEL } from "@/lib/constantes";
import type { ClienteItem, EquipamentoItem } from "@/types";

type Props = {
  item: EquipamentoItem | null; // null = novo equipamento
  onSalvo: (mensagem: string) => void;
};

export default function FormEquipamento({ item, onSalvo }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    clienteId: item?.clienteId?._id ?? "",
    tipo: item?.tipo ?? "notebook",
    marca: item?.marca ?? "",
    modelo: item?.modelo ?? "",
    numeroSerie: item?.numeroSerie ?? "",
    descricao: item?.descricao ?? "",
    processador: item?.especificacoes?.processador ?? "",
    memoriaRam: item?.especificacoes?.memoriaRam ?? "",
    placaVideo: item?.especificacoes?.placaVideo ?? "",
    armazenamento: item?.especificacoes?.armazenamento ?? "",
    observacoes: item?.observacoes ?? "",
  });

  // mesma chave ["clientes"] da lista de clientes: o React Query reaproveita o cache
  const { data: clientes, isLoading: carregandoClientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => api<ClienteItem[]>("/api/clientes"),
  });

  // especificações só aparecem para computador e notebook
  const mostraSpecs = form.tipo === "computador" || form.tipo === "notebook";

  const salvar = useMutation({
    mutationFn: () => {
      const body = JSON.stringify({
        clienteId: form.clienteId,
        tipo: form.tipo,
        marca: form.marca,
        modelo: form.modelo,
        numeroSerie: form.numeroSerie,
        descricao: form.descricao,
        observacoes: form.observacoes,
        especificacoes: mostraSpecs
          ? {
              processador: form.processador,
              memoriaRam: form.memoriaRam,
              placaVideo: form.placaVideo,
              armazenamento: form.armazenamento,
            }
          : {},
      });

      return item
        ? api(`/api/equipamentos/${item._id}`, { method: "PUT", body })
        : api("/api/equipamentos", { method: "POST", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
      // marca e modelo aparecem nas listas de ordens
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
      queryClient.invalidateQueries({ queryKey: ["ordem"] });
      onSalvo(item ? "Equipamento atualizado" : "Equipamento cadastrado");
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    salvar.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {salvar.error && <Alerta>{salvar.error.message}</Alerta>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="clienteId">Cliente</Label>
        <SelectNativo id="clienteId" name="clienteId" required value={form.clienteId} onChange={handleChange}>
          <option value="">{carregandoClientes ? "Carregando..." : "Selecione o cliente"}</option>
          {clientes?.map((cliente) => (
            <option key={cliente._id} value={cliente._id}>
              {cliente.nome}
            </option>
          ))}
        </SelectNativo>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo">Tipo</Label>
        <SelectNativo id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
          {TIPOS_EQUIPAMENTO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_EQUIPAMENTO_LABEL[tipo]}
            </option>
          ))}
        </SelectNativo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" name="marca" required value={form.marca} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" name="modelo" required value={form.modelo} onChange={handleChange} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="numeroSerie">Número de série (se tiver)</Label>
        <Input id="numeroSerie" name="numeroSerie" value={form.numeroSerie} onChange={handleChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição ou identificação</Label>
        <Input
          id="descricao"
          name="descricao"
          placeholder="Ex.: notebook preto com adesivo na tampa"
          value={form.descricao}
          onChange={handleChange}
        />
      </div>

      {mostraSpecs && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="processador">Processador</Label>
            <Input id="processador" name="processador" value={form.processador} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="memoriaRam">Memória RAM</Label>
            <Input id="memoriaRam" name="memoriaRam" value={form.memoriaRam} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="placaVideo">Placa de vídeo</Label>
            <Input id="placaVideo" name="placaVideo" value={form.placaVideo} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="armazenamento">Armazenamento</Label>
            <Input id="armazenamento" name="armazenamento" value={form.armazenamento} onChange={handleChange} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" value={form.observacoes} onChange={handleChange} />
      </div>

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
