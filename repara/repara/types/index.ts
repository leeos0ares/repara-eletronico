import type { Prioridade, Role, StatusOS, TipoEquipamento } from "@/lib/constantes";

// Formato dos dados como chegam das rotas /api (JSON)
export type ClienteItem = {
  _id: string;
  nome: string;
  email: string;
  telefone?: string;
  observacoes?: string;
  usuarioId?: string | null;
};

export type EquipamentoItem = {
  _id: string;
  clienteId: { _id: string; nome: string };
  tipo: TipoEquipamento;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  descricao?: string;
  especificacoes?: {
    processador?: string;
    memoriaRam?: string;
    placaVideo?: string;
    armazenamento?: string;
  };
  observacoes?: string;
};

export type UsuarioItem = {
  _id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
};

export type Aviso = { tipo: "erro" | "sucesso"; texto: string };

// ---- Ordens de serviço ----
export type OrcamentoItem = {
  servicos: string;
  pecas?: string;
  valorPecas: number;
  valorMaoDeObra: number;
  valorTotal: number;
  observacoes?: string;
  status: "pendente" | "aprovado" | "recusado";
  criadoEm: string;
  decididoEm?: string;
};

export type Movimentacao = { data: string; usuarioNome: string; texto: string };

// Item da lista (/api/ordens). Cliente não recebe tecnicoId nem prioridade.
export type OrdemItem = {
  _id: string;
  numero: number;
  clienteId: { _id: string; nome: string };
  equipamentoId: { _id: string; marca: string; modelo: string; tipo: TipoEquipamento };
  tecnicoId?: { _id: string; nome: string } | null;
  prioridade?: Prioridade;
  status: StatusOS;
  prazoEstimado?: string | null;
  problemaRelatado: string;
  createdAt: string;
};

// Detalhe (/api/ordens/[id]). Para o cliente, alguns campos internos não vêm.
export type OrdemDetalhe = OrdemItem & {
  condicoesFisicas?: string;
  acessorios?: string;
  diagnostico?: string;
  servicoExecutar?: string;
  procedimentosRealizados?: string;
  pecasUtilizadas?: string;
  resultadoTestes?: string;
  observacoesInternas?: string;
  dataConclusao?: string;
  dataEntrega?: string;
  orcamento?: OrcamentoItem | null;
  movimentacoes: Movimentacao[];
};
