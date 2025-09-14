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
          "pointer-events-none flex max-w-full items-center gap-3",
          "rounded-2xl border border-white/50 bg-white/95",
          "px-4 py-3 text-xs font-semibold text-black",
          "backdrop-blur-xl backdrop-saturate-150",
          "ring-1 ring-black/10",
          "shadow-[0_12px_40px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.15)]",
          "dark:border-white/40 dark:bg-black/90 dark:text-white dark:ring-white/20",
          "transition-all duration-300 ease-out",
        ].join(" ")}
      >
        <h3
          className={[
            "truncate pl-1 text-sm leading-tight font-medium",
            "[text-shadow:0_2px_4px_rgba(0,0,0,0.2)]",
          ].join(" ")}
          title={title}
        >
          {title}
        </h3>

        <Price
          className={[
            "flex-none rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm text-white font-bold",
            "ring-2 ring-blue-400/50",
            "shadow-[0_6px_20px_rgba(59,130,246,0.4),0_2px_0_rgba(255,255,255,0.2)_inset]",
            "transition-all duration-200 hover:shadow-[0_8px_24px_rgba(59,130,246,0.5)]",
          ].join(" ")}
          amount={amount}
          currencyCode={currencyCode}
          currencyCodeClassName="hidden @[275px]/label:inline text-blue-100"
        />
      </div>
    </div>
  );
};

export default Label;
