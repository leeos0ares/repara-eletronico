// fetch para as nossas rotas /api. Se der erro, lança Error com a mensagem que veio do servidor.
export async function api<T = unknown>(url: string, opcoes?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opcoes });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.erro ?? "Não foi possível completar a ação");
  }
  return data as T;
}
