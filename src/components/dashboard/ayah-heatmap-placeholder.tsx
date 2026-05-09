import { Grid2X2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cells = Array.from({ length: 140 }, (_, index) => index);

export function AyahHeatmapPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-accent p-2 text-primary">
            <Grid2X2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Ayah heatmap</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Placeholder for memorization strength by ayah.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="md:grid-cols-20 grid grid-cols-10 gap-1 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
          {cells.map((cell) => (
            <div
              key={cell}
              className="aspect-square rounded-sm border bg-secondary/60"
              aria-hidden="true"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
