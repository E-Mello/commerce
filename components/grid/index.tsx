// Path: components/grid/index.tsx

import clsx from "clsx";
import type React from "react";

function Grid(props: React.ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      className={clsx(
        "grid grid-flow-row gap-6 p-4", // increased gap and added padding
        props.className
      )}
    >
      {props.children}
    </ul>
  );
}

function GridItem(props: React.ComponentProps<"li">) {
  return (
    <li
      {...props}
      className={clsx(
        "aspect-square transition-all duration-300 ease-out", // improved transition
        "hover:scale-[1.02] hover:shadow-xl", // added subtle hover effects
        "rounded-xl overflow-hidden", // added rounded corners
        props.className
      )}
    >
      {props.children}
    </li>
  );
}

Grid.Item = GridItem;

export default Grid;
