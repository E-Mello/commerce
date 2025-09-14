// Path: components/price.tsx

import clsx from "clsx";
import type React from "react";

const Price = ({
  amount,
  className,
  currencyCode = "USD",
  currencyCodeClassName,
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => (
  <p
    suppressHydrationWarning={true}
    className={clsx(
      "font-semibold text-lg tracking-tight", // improved typography
      "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", // gradient text effect
      className
    )}
  >
    {`${new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(Number.parseFloat(amount))}`}
    <span
      className={clsx(
        "ml-1 inline text-sm opacity-80", // improved styling
        currencyCodeClassName
      )}
    >
      {`${currencyCode}`}
    </span>
  </p>
);

export default Price;
