import { Badge } from "@/components/ui/badge";
import type { TaskTag } from "@/features/tasks/types/task.types";

export function TagBadge({ tag }: { tag: TaskTag }) {
  return (
    <Badge variant="outline" className="gap-1.5 normal-case">
      <span
        className="size-2.5 rounded-full border border-foreground/10"
        style={{ backgroundColor: tag.color }}
        aria-hidden
      />
      {tag.name}
    </Badge>
  );
}
