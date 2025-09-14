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
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul
        className="
          flex w-max gap-4 
          animate-marquee [will-change:transform] 
          hover:[animation-play-state:paused]
        "
        style={{
          ["--marquee-duration" as any]: `${Math.max(18, items.length * 4)}s`,
        }}
      >
        {items.map((product, i) => (
          <li
            key={`${product.id}-${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link
              href={`/product/${product.handle}`}
              className="relative block h-full w-full"
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
