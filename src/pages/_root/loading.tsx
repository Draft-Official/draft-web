
import { Spinner } from '@/shared/ui/shadcn/spinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Spinner className="w-8 h-8 text-muted-foreground " />
    </div>
  );
}
