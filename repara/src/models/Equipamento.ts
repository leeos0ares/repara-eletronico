import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";
import { TIPOS_EQUIPAMENTO } from "@/lib/constantes";

const equipamentoSchema = new Schema(
  {
    clienteId: { type: Schema.Types.ObjectId, ref: "Cliente", required: true },
    tipo: { type: String, enum: [...TIPOS_EQUIPAMENTO], required: true },
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    numeroSerie: { type: String, trim: true },
    descricao: { type: String, trim: true },
    // só faz sentido para computador e notebook, por isso tudo opcional
    especificacoes: {
      processador: { type: String, trim: true },
      memoriaRam: { type: String, trim: true },
      placaVideo: { type: String, trim: true },
      armazenamento: { type: String, trim: true },
    },
    observacoes: { type: String, trim: true },
  },
  { timestamps: true, collection: "equipamentos" }
);

export type EquipamentoDoc = InferSchemaType<typeof equipamentoSchema>;

export const Equipamento: Model<EquipamentoDoc> =
  mongoose.models.Equipamento || mongoose.model<EquipamentoDoc>("Equipamento", equipamentoSchema);
