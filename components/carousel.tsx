// Path: components/carousel.tsx

import { getCollectionProducts } from "lib/data";
import Link from "next/link";
import { GridTileImage } from "./grid/tile";

export async function Carousel() {
  const products = await getCollectionProducts({
    collection: "hidden-homepage-carousel",
  });

  if (!products?.length) return null;

  // duplicate items for seamless infinite loop
  const items = [...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-8 pt-4">
      {" "}
      {/* increased padding */}
      <div className="px-4 mb-6">
        {" "}
        {/* added section header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Produtos em Destaque
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Descubra nossa seleção especial de produtos
        </p>
      </div>
      <ul
        className={[
          "flex w-max gap-6", // increased gap
          "animate-marquee [will-change:transform]",
          "hover:[animation-play-state:paused]",
          "px-4", // added horizontal padding
        ].join(" ")}
        style={{
          ["--marquee-duration" as any]: `${Math.max(20, items.length * 4)}s`, // slightly slower animation
        }}
      >
        {items.map((product, i) => (
          <li
            key={`${product.id}-${i}`}
            className={[
              "relative aspect-square h-[32vh] max-h-[300px] w-2/3 max-w-[500px] flex-none", // slightly larger items
              "md:w-1/3 lg:w-1/4", // better responsive sizing
              "transition-transform duration-300 hover:scale-105", // added hover effect
            ].join(" ")}
          >
            <Link
              href={`/product/${product.handle}`}
              className="relative block h-full w-full group" // added group class
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                }}
                src={product.featuredImage?.url ?? "/placeholder.png"}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
