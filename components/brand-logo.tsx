import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
};

export function BrandLogo({ className, markClassName, showWordmark = false }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        aria-label="Tradelyst logo"
        className={cn("h-9 w-9 shrink-0", markClassName)}
        fill="none"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="8" fill="hsl(var(--primary))" />
        <path
          d="M12 12.5H28"
          stroke="hsl(var(--primary-foreground))"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <path
          d="M12 20H20"
          stroke="hsl(var(--primary-foreground))"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <path
          d="M12 27.5H16"
          stroke="hsl(var(--primary-foreground))"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <path
          d="M18 28L23 22.5L27 25L31 16"
          stroke="#f8c14a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        <circle cx="31" cy="16" r="2.2" fill="#f8c14a" />
      </svg>
      {showWordmark ? <span className="font-semibold">Tradelyst</span> : null}
    </div>
  );
}
