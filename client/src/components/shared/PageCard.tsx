import { ReactNode } from "react";

interface PageCardProps {
  children: ReactNode;
  className?: string;
  padding?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * PageCard — reusable white card with brand shadow and rounded-2xl.
 * Use everywhere instead of raw divs for consistent surface treatment.
 *
 * Props:
 *   className  — additional tailwind classes (e.g. "col-span-2")
 *   padding    — override default "p-6" (e.g. "p-4" or "p-0")
 *   hoverable  — adds hover lift effect (good for clickable cards)
 *   onClick    — makes the card clickable
 */
const PageCard = ({
  children,
  className = "",
  padding = "p-6",
  onClick,
  hoverable = false,
}: PageCardProps) => {
  const base = `
    bg-white rounded-2xl
    shadow-[0_4px_20px_rgba(233,30,140,0.08)]
    border border-brand-pink-muted/40
    font-poppins
    ${padding}
    ${hoverable ? "transition-all duration-200 hover:shadow-[0_8px_32px_rgba(233,30,140,0.16)] hover:-translate-y-0.5 cursor-pointer" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  if (onClick) {
    return (
      <div role="button" tabIndex={0} className={base} onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}>
        {children}
      </div>
    );
  }

  return <div className={base}>{children}</div>;
};

export default PageCard;
