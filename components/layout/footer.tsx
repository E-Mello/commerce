// Path: components/layout/footer.tsx

import FooterMenu from "components/layout/footer-menu";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/data";
import Link from "next/link";
import { Suspense } from "react";

const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : "");
  const skeleton =
    "w-full h-6 animate-pulse rounded-lg bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600"; // improved skeleton with gradient
  const menu = await getMenu("next-js-frontend-footer-menu");
  const copyrightName = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer
      className={[
        "text-sm text-neutral-600 dark:text-neutral-300", // improved text colors
        "bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black", // gradient background
        "border-t border-neutral-200/50 dark:border-neutral-700/50", // subtle border
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex w-full max-w-7xl flex-col gap-8", // increased gap
          "px-6 py-16 text-sm", // increased padding
          "md:flex-row md:gap-16 md:px-8", // better responsive spacing
          "min-[1320px]:px-0",
        ].join(" ")}
      >
        <div className="space-y-4">
          {" "}
          {/* added spacing */}
          <Link
            className={[
              "flex items-center gap-3 text-black md:pt-1 dark:text-white", // increased gap
              "transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400", // hover effect
              "group", // added group for logo animation
            ].join(" ")}
            href="/"
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {" "}
              {/* logo hover effect */}
              <LogoSquare size="sm" />
            </div>
            <span className="uppercase font-bold text-lg tracking-wide">
              {" "}
              {/* improved typography */}
              {SITE_NAME}
            </span>
          </Link>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">
            Sua loja online de confiança com os melhores produtos e atendimento
            excepcional.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex h-[200px] w-[240px] flex-col gap-3">
              {" "}
              {/* improved skeleton dimensions */}
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
            </div>
          }
        >
          <FooterMenu menu={menu} />
        </Suspense>
      </div>

      <div className="border-t border-neutral-200/50 dark:border-neutral-700/50 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-8 min-[1320px]:px-0">
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            © {copyrightDate} {copyrightName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
