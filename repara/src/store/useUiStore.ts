import { create } from "zustand";
import type { ClienteItem, EquipamentoItem, UsuarioItem } from "@/types";

// Aqui ficam só estados da INTERFACE (filtros e modais).
// Os dados do banco continuam vindo pelo React Query.
type Modal<T> = { aberto: boolean; item: T | null };

type UiStore = {
  // filtros das listas
  buscaCliente: string;
  buscaEquipamento: string;
  tipoEquipamento: string;
  buscaUsuario: string;
  buscaOrdem: string;
  statusOrdem: string;
  prioridadeOrdem: string;
  tecnicoOrdem: string;
  setBuscaCliente: (valor: string) => void;
  setBuscaEquipamento: (valor: string) => void;
  setTipoEquipamento: (valor: string) => void;
  setBuscaUsuario: (valor: string) => void;
  setBuscaOrdem: (valor: string) => void;
  setStatusOrdem: (valor: string) => void;
  setPrioridadeOrdem: (valor: string) => void;
  setTecnicoOrdem: (valor: string) => void;

  // modais de formulário (item = null significa "criar novo")
  modalCliente: Modal<ClienteItem>;
  modalEquipamento: Modal<EquipamentoItem>;
  modalUsuario: Modal<UsuarioItem>;
  abrirModalCliente: (item?: ClienteItem) => void;
  abrirModalEquipamento: (item?: EquipamentoItem) => void;
  abrirModalUsuario: (item?: UsuarioItem) => void;
  fecharModalCliente: () => void;
  fecharModalEquipamento: () => void;
  fecharModalUsuario: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  buscaCliente: "",
  buscaEquipamento: "",
  tipoEquipamento: "",
  buscaUsuario: "",
  buscaOrdem: "",
  statusOrdem: "",
  prioridadeOrdem: "",
  tecnicoOrdem: "",
  setBuscaCliente: (valor) => set({ buscaCliente: valor }),
  setBuscaEquipamento: (valor) => set({ buscaEquipamento: valor }),
  setTipoEquipamento: (valor) => set({ tipoEquipamento: valor }),
  setBuscaUsuario: (valor) => set({ buscaUsuario: valor }),
  setBuscaOrdem: (valor) => set({ buscaOrdem: valor }),
  setStatusOrdem: (valor) => set({ statusOrdem: valor }),
  setPrioridadeOrdem: (valor) => set({ prioridadeOrdem: valor }),
  setTecnicoOrdem: (valor) => set({ tecnicoOrdem: valor }),

  modalCliente: { aberto: false, item: null },
  modalEquipamento: { aberto: false, item: null },
  modalUsuario: { aberto: false, item: null },

  abrirModalCliente: (item) => set({ modalCliente: { aberto: true, item: item ?? null } }),
  abrirModalEquipamento: (item) => set({ modalEquipamento: { aberto: true, item: item ?? null } }),
  abrirModalUsuario: (item) => set({ modalUsuario: { aberto: true, item: item ?? null } }),

  // fecha sem apagar o item, para o formulário não "piscar" durante a animação
  fecharModalCliente: () => set((s) => ({ modalCliente: { ...s.modalCliente, aberto: false } })),
  fecharModalEquipamento: () => set((s) => ({ modalEquipamento: { ...s.modalEquipamento, aberto: false } })),
  fecharModalUsuario: () => set((s) => ({ modalUsuario: { ...s.modalUsuario, aberto: false } })),
}));
