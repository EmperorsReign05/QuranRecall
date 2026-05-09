import { ListChecks } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevisionQueuePlaceholder() {
  return (
    <Card className="min-h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-accent p-2 text-primary">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Revision queue</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Empty state for future scheduled reviews.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-secondary/40 p-8 text-center">
          <p className="text-lg font-semibold">No revisions queued yet</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            This space is ready for spaced revision items once progress tracking
            is connected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
