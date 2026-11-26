"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex max-w-md flex-col gap-3">
      <h2 className="text-xl font-semibold">Não foi possível carregar esta página</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <div>
        <Button onClick={reset}>Tentar de novo</Button>
      </div>
    </div>
  );
}
