import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

type BrandMarkProps = {
  href?: string;
  showName?: boolean;
  className?: string;
  imageClassName?: string;
  nameClassName?: string;
  size?: number;
};

export function BrandMark({
  href = "/dashboard",
  showName = true,
  className,
  imageClassName,
  nameClassName,
  size = 28,
}: BrandMarkProps) {
  const content = (
    <>
      <Image
        src="/logo.png"
        alt={siteConfig.name}
        width={size}
        height={size}
        className={cn(
          "shrink-0 object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.55)]",
          imageClassName
        )}
        priority
      />
      {showName ? (
        <span
          className={cn(
            "text-base font-semibold tracking-tight text-primary",
            nameClassName
          )}
        >
          {siteConfig.name}
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {content}
    </Link>
  );
}
