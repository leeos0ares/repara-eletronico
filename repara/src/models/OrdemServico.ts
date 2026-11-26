import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";
import { PRIORIDADES, STATUS_OS } from "@/lib/constantes";

// Cada mudança importante da ordem vira uma linha do histórico (o cliente também enxerga)
const movimentacaoSchema = new Schema(
  {
    data: { type: Date, default: Date.now },
    usuarioNome: { type: String, required: true },
    texto: { type: String, required: true },
  },
  { _id: false }
);

const orcamentoSchema = new Schema(
  {
    servicos: { type: String, required: true, trim: true },
    pecas: { type: String, trim: true },
    valorPecas: { type: Number, default: 0, min: 0 },
    valorMaoDeObra: { type: Number, default: 0, min: 0 },
    valorTotal: { type: Number, default: 0, min: 0 },
    observacoes: { type: String, trim: true },
    status: { type: String, enum: ["pendente", "aprovado", "recusado"], default: "pendente" },
    criadoEm: { type: Date, default: Date.now },
    decididoEm: { type: Date },
  },
  { _id: false }
);

const ordemSchema = new Schema(
  {
    numero: { type: Number, required: true, unique: true },
    clienteId: { type: Schema.Types.ObjectId, ref: "Cliente", required: true },
    equipamentoId: { type: Schema.Types.ObjectId, ref: "Equipamento", required: true },
    tecnicoId: { type: Schema.Types.ObjectId, ref: "Usuario", default: null },

    problemaRelatado: { type: String, required: true, trim: true },
    condicoesFisicas: { type: String, trim: true },
    acessorios: { type: String, trim: true },

    diagnostico: { type: String, trim: true },
    servicoExecutar: { type: String, trim: true },
    procedimentosRealizados: { type: String, trim: true },
    pecasUtilizadas: { type: String, trim: true },
    resultadoTestes: { type: String, trim: true },
    observacoesInternas: { type: String, trim: true },

    prioridade: { type: String, enum: [...PRIORIDADES], default: "normal" },
    status: { type: String, enum: [...STATUS_OS], default: "recebido" },
    prazoEstimado: { type: Date, default: null },
    dataConclusao: { type: Date },
    dataEntrega: { type: Date },

    orcamento: { type: orcamentoSchema, default: null },
    movimentacoes: { type: [movimentacaoSchema], default: [] },
  },
  { timestamps: true, collection: "ordens_servico" }
);

export type OrdemServicoDoc = InferSchemaType<typeof ordemSchema>;

export const OrdemServico: Model<OrdemServicoDoc> =
  mongoose.models.OrdemServico || mongoose.model<OrdemServicoDoc>("OrdemServico", ordemSchema);

// ---- Número sequencial das ordens (1, 2, 3...) ----
// Uma coleção "contadores" guarda o último número usado; o $inc é atômico,
// então duas ordens criadas ao mesmo tempo nunca ficam com o mesmo número.
const contadorSchema = new Schema(
  {
    nome: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { collection: "contadores" }
);

const Contador: Model<InferSchemaType<typeof contadorSchema>> =
  mongoose.models.Contador || mongoose.model("Contador", contadorSchema);

export async function gerarNumeroOS() {
  const contador = await Contador.findOneAndUpdate(
    { nome: "ordemServico" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  if (!contador) throw new Error("Não foi possível gerar o número da ordem");
  return contador.seq;
}
