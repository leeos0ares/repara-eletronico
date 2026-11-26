export const ROLES = ["admin", "tecnico", "cliente"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  tecnico: "Técnico",
  cliente: "Cliente",
};

export const TIPOS_EQUIPAMENTO = [
  "computador",
  "notebook",
  "videogame",
  "controle",
  "monitor",
  "periferico",
  "componente",
  "outro",
] as const;
export type TipoEquipamento = (typeof TIPOS_EQUIPAMENTO)[number];

export const TIPO_EQUIPAMENTO_LABEL: Record<TipoEquipamento, string> = {
  computador: "Computador",
  notebook: "Notebook",
  videogame: "Videogame",
  controle: "Controle",
  monitor: "Monitor",
  periferico: "Periférico",
  componente: "Componente de hardware",
  outro: "Outro",
};

export const STATUS_OS = [
  "recebido",
  "em_diagnostico",
  "aguardando_aprovacao",
  "aguardando_pecas",
  "em_reparo",
  "em_testes",
  "pronto_retirada",
  "entregue",
  "recusado",
  "cancelado",
] as const;
export type StatusOS = (typeof STATUS_OS)[number];

export const STATUS_LABEL: Record<StatusOS, string> = {
  recebido: "Recebido",
  em_diagnostico: "Em diagnóstico",
  aguardando_aprovacao: "Aguardando aprovação",
  aguardando_pecas: "Aguardando peças",
  em_reparo: "Em reparo",
  em_testes: "Em testes",
  pronto_retirada: "Pronto para retirada",
  entregue: "Entregue",
  recusado: "Recusado",
  cancelado: "Cancelado",
};

export const PRIORIDADES = ["baixa", "normal", "alta", "urgente"] as const;
export type Prioridade = (typeof PRIORIDADES)[number];

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};
