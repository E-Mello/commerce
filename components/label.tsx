// Path: components/label.tsx

import clsx from "clsx";
import Price from "./price";

const Label = ({
  title,
  amount,
  currencyCode,
  position = "bottom",
}: {
  title: string;
  amount: string;
  currencyCode: string;
  position?: "bottom" | "center";
}) => {
  return (
    <div
      className={clsx(
        // não intercepta clique no card
        "pointer-events-none absolute left-0 flex w-full px-4 pb-4 @container/label",
        {
          "bottom-0": position === "bottom",
          "inset-0 items-center justify-center lg:px-20 lg:pb-[35%]":
            position === "center",
        }
      )}
    >
      <div
        className={[
          // pill translúcido com contorno e blur (estilo demo)
          "pointer-events-none flex max-w-full items-center gap-2",
          "rounded-full border border-neutral-200/70 bg-white/70",
          "px-2 py-1 text-xs font-semibold text-black",
          "backdrop-blur-md",
          "ring-1 ring-black/10",
          "shadow-[0_1px_1px_rgba(255,255,255,0.35)_inset,0_8px_20px_rgba(0,0,0,0.35)]",
          "dark:border-neutral-700/80 dark:bg-black/60 dark:text-white dark:ring-white/10",
        ].join(" ")}
      >
        <h3
          className={[
            // título com boa leitura e sem quebrar feio
            "truncate pl-2 text-sm leading-tight",
            // leve “contorno” no texto pra destacar sobre a imagem
            "[text-shadow:0_1px_1px_rgba(0,0,0,0.35)]",
          ].join(" ")}
          title={title}
        >
          {title}
        </h3>

        <Price
          className={[
            // pill azul do preço com contorno e brilho interno
            "flex-none rounded-full bg-blue-600 px-3 py-1 text-sm text-white",
            "ring-1 ring-blue-300/50",
            "shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.35)]",
          ].join(" ")}
          amount={amount}
          currencyCode={currencyCode}
          currencyCodeClassName="hidden @[275px]/label:inline"
        />
      </div>
    </div>
  );
};

export default Label;
