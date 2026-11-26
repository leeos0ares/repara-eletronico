import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";
import { ROLES } from "@/lib/constantes";

const usuarioSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> o hash só vem do banco quando pedimos com .select("+senhaHash")
    senhaHash: { type: String, required: true, select: false },
    role: { type: String, enum: [...ROLES], default: "cliente" },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "usuarios" }
);

export type UsuarioDoc = InferSchemaType<typeof usuarioSchema>;

// "mongoose.models.Usuario ||" evita erro de model duplicado no hot reload
export const Usuario: Model<UsuarioDoc> =
  mongoose.models.Usuario || mongoose.model<UsuarioDoc>("Usuario", usuarioSchema);
