import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

export default function Card({
  children,
  className,
  glass = false,
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-white p-6",
        "shadow-sm shadow-neutral-900/[0.03]",
        glass && "bg-white/70 backdrop-blur-xl",
        hover && "transition-all duration-300 hover:shadow-md hover:shadow-neutral-900/[0.06] hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
