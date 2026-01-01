import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ModuleHeaderProps {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export function ModuleHeader({
  title,
  description,
  onAdd,
  addLabel = 'Add Record',
}: ModuleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {onAdd && (
        <Button onClick={onAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
