// Lê o JSON do corpo da requisição. Se vier quebrado (ou não for um objeto), devolve {}
// e a validação da própria rota responde 400, em vez de estourar erro 500.
export async function lerJson(req: Request) {
  try {
    const corpo = await req.json();
    return corpo && typeof corpo === "object" ? corpo : {};
  } catch {
    return {};
  }
}
