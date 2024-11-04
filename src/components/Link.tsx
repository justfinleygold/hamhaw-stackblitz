import { LucideIcon } from 'lucide-react';

interface LinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function Link({ href, icon: Icon, children }: LinkProps) {
  return (
    <a
      href={href}
      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </a>
  );
}