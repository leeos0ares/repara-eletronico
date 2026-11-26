import type { Role, StatusOS } from "@/lib/constantes";

type Regra = { para: StatusOS; roles: Role[] };

const EQUIPE: Role[] = ["admin", "tecnico"];
const ADMIN: Role[] = ["admin"];

// Para cada status: para onde a ordem pode ir e quem pode fazer isso.
// Dois caminhos NÃO estão aqui de propósito: aprovar ou recusar o orçamento
// (aguardando_aprovacao -> em_reparo / recusado). Eles só acontecem pela rota do orçamento,
// então nenhum reparo começa sem autorização.
export const TRANSICOES: Record<StatusOS, Regra[]> = {
  recebido: [
    { para: "em_diagnostico", roles: EQUIPE },
    { para: "cancelado", roles: ADMIN },
  ],
  em_diagnostico: [
    { para: "aguardando_aprovacao", roles: EQUIPE },
    { para: "cancelado", roles: ADMIN },
  ],
  aguardando_aprovacao: [{ para: "cancelado", roles: ADMIN }],
  aguardando_pecas: [
    { para: "em_reparo", roles: EQUIPE },
    { para: "cancelado", roles: ADMIN },
  ],
  em_reparo: [
    { para: "aguardando_pecas", roles: EQUIPE },
    { para: "aguardando_aprovacao", roles: EQUIPE }, // serviço adicional: novo orçamento
    { para: "em_testes", roles: EQUIPE },
    { para: "cancelado", roles: ADMIN },
  ],
  em_testes: [
    { para: "em_reparo", roles: EQUIPE },
    { para: "pronto_retirada", roles: EQUIPE },
    { para: "cancelado", roles: ADMIN },
  ],
  pronto_retirada: [{ para: "entregue", roles: ADMIN }],
  recusado: [
    { para: "entregue", roles: ADMIN }, // devolução sem reparo
    { para: "cancelado", roles: ADMIN },
  ],
  entregue: [],
  cancelado: [],
};

// Texto dos botões (descreve a ação, não o status de destino)
export const ACAO_LABEL: Record<StatusOS, string> = {
  recebido: "Recebido",
  em_diagnostico: "Iniciar diagnóstico",
  aguardando_aprovacao: "Enviar orçamento ao cliente",
  aguardando_pecas: "Aguardar peças",
  em_reparo: "Voltar para o reparo",
  em_testes: "Enviar para testes",
  pronto_retirada: "Marcar como pronto para retirada",
  entregue: "Registrar entrega",
  recusado: "Recusado",
  cancelado: "Cancelar ordem",
};

export const STATUS_ENCERRADOS: StatusOS[] = ["entregue", "cancelado"];

// Em quais status o orçamento pode ser criado ou alterado
export const STATUS_ORCAMENTO_EDITAVEL: StatusOS[] = ["em_diagnostico", "aguardando_aprovacao", "em_reparo"];

export function proximosStatus(atual: StatusOS, role: Role): StatusOS[] {
  return TRANSICOES[atual].filter((regra) => regra.roles.includes(role)).map((regra) => regra.para);
}

type DadosOrdem = { temTecnico: boolean; orcamentoPendente: boolean; temResultadoTestes: boolean };

// Regras que dependem dos dados da ordem. Devolve a mensagem de erro, ou "" se pode seguir.
export function motivoBloqueio(novo: StatusOS, ordem: DadosOrdem): string {
  if (novo === "em_diagnostico" && !ordem.temTecnico) {
    return "Atribua um técnico antes de iniciar o diagnóstico";
  }
  if (novo === "aguardando_aprovacao" && !ordem.orcamentoPendente) {
    return "Registre o orçamento antes de enviá-lo ao cliente";
  }
  if (novo === "pronto_retirada" && !ordem.temResultadoTestes) {
    return "Registre o resultado dos testes antes de marcar como pronto";
  }
  return "";
}
