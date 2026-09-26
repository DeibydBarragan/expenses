import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pagerClass =
  "flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-default hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function MonthPager({
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  children,
}: {
  prevHref: string;
  nextHref: string;
  prevLabel: string;
  nextLabel: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Link href={prevHref} aria-label={prevLabel} className={pagerClass}>
        <ChevronLeft size={17} />
      </Link>
      {children}
      <Link href={nextHref} aria-label={nextLabel} className={pagerClass}>
        <ChevronRight size={17} />
      </Link>
    </>
  );
}
