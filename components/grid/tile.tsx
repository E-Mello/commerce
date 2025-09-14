// Path: components/grid/tile.tsx

import clsx from "clsx";
import Image from "next/image";
import type React from "react";
import Label from "../label";

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>) {
  return (
    <div
      className={clsx(
        "group relative flex h-full w-full items-center justify-center overflow-hidden",
        "rounded-2xl border-2 bg-gradient-to-br from-gray-50 to-gray-100", // more rounded, gradient background
        "transition-all duration-300 ease-out", // smooth transitions
        "hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20", // improved hover effects
        "dark:from-gray-900 dark:to-gray-800 dark:bg-black",
        {
          "border-blue-600 shadow-lg shadow-blue-600/25 ring-2 ring-blue-600/20":
            active, // enhanced active state
          "border-gray-200 dark:border-gray-700": !active,
        }
      )}
    >
      {props.src ? (
        <Image
          className={clsx("relative h-full w-full object-cover", {
            // changed to object-cover for better image display
            // slower, more dramatic scale
            "transition-all duration-500 ease-out group-hover:scale-110":
              isInteractive,
          })}
          {...props}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}
