// Path: components/grid/three-items.tsx

import clsx from "clsx"; // declared the clsx variable
import { GridTileImage } from "components/grid/tile";
import { getCollectionProducts } from "lib/data";
import type { Product } from "lib/types";
import Link from "next/link";

function ThreeItemGridItem({
  item,
  size,
  priority,
}: {
  item: Product;
  size: "full" | "half";
  priority?: boolean;
}) {
  return (
    <div
      className={clsx(
        "group", // added group class for hover effects
        size === "full"
          ? "md:col-span-4 md:row-span-2"
          : "md:col-span-2 md:row-span-1"
      )}
    >
      <Link
        className={[
          "relative block aspect-square h-full w-full",
          "transition-transform duration-300 ease-out", // smooth transitions
          "hover:scale-[1.02] focus:scale-[1.02]", // subtle hover effect
        ].join(" ")}
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={item.featuredImage.url}
          fill
          sizes={
            size === "full"
              ? "(min-width: 768px) 66vw, 100vw"
              : "(min-width: 768px) 33vw, 100vw"
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === "full" ? "center" : "bottom",
            title: item.title as string,
            amount: item.priceRange.maxVariantPrice.amount,
            currencyCode: item.priceRange.maxVariantPrice.currencyCode,
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  // Collections that start with `hidden-*` are hidden from the search page.
  const homepageItems = await getCollectionProducts({
    collection: "hidden-homepage-featured-items",
  });

  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) return null;

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;

  return (
    <section
      className={[
        "mx-auto grid max-w-7xl gap-6 px-6 pb-8 pt-4", // increased gaps and padding, better max-width
        "md:grid-cols-6 md:grid-rows-2",
        "lg:max-h-[calc(100vh-200px)]",
        "animate-in fade-in duration-700", // added entrance animation
      ].join(" ")}
    >
      <div className="md:col-span-6 mb-4">
        {" "}
        {/* added section header */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Coleção Especial
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Produtos selecionados especialmente para você
        </p>
      </div>

      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
