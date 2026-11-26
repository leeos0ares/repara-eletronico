import { isValidObjectId } from "mongoose";
import { TIPOS_EQUIPAMENTO, type TipoEquipamento } from "@/lib/constantes";

const texto = (valor: unknown) => String(valor ?? "").trim();

// Limpa e valida o que veio do formulário de equipamento (usado no POST e no PUT)
export function lerDadosEquipamento(body: Record<string, unknown>) {
  const specs = (body.especificacoes ?? {}) as Record<string, unknown>;

  const dados = {
    clienteId: texto(body.clienteId),
    tipo: texto(body.tipo) as TipoEquipamento, // conferido logo abaixo; se for inválido, devolve erro
    marca: texto(body.marca),
    modelo: texto(body.modelo),
    numeroSerie: texto(body.numeroSerie),
    descricao: texto(body.descricao),
    observacoes: texto(body.observacoes),
    especificacoes: {
      processador: texto(specs.processador),
      memoriaRam: texto(specs.memoriaRam),
      placaVideo: texto(specs.placaVideo),
      armazenamento: texto(specs.armazenamento),
    },
  };

  let erro = "";
  if (!isValidObjectId(dados.clienteId)) erro = "Escolha o cliente";
  else if (!(TIPOS_EQUIPAMENTO as readonly string[]).includes(dados.tipo)) erro = "Tipo de equipamento inválido";
  else if (!dados.marca || !dados.modelo) erro = "Informe a marca e o modelo";

  return { dados, erro };
}
