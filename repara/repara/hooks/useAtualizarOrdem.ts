import { useQueryClient } from "@tanstack/react-query";

// Depois de salvar algo na ordem, recarrega a própria ordem e a lista de ordens
export function useAtualizarOrdem(id: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["ordem", id] });
    queryClient.invalidateQueries({ queryKey: ["ordens"] });
  };
}
