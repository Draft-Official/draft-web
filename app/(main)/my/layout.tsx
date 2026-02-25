import { MySubPageShell } from '@/features/my';

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return <MySubPageShell>{children}</MySubPageShell>;
}
