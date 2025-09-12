// Em lib/data.ts
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { NextResponse } from "next/server";
import { Cart, CartItem, Collection, Page, Product } from "./types";

const API_URL = "http://localhost:4000";

// Busca o carrinho e "hidrata" com os detalhes dos produtos
export async function getCart(): Promise<Cart | undefined> {
  const [cartRes, productsRes] = await Promise.all([
    fetch(`${API_URL}/cart`, { cache: "no-store" }), // O carrinho não deve ser cacheado
    fetch(`${API_URL}/products`, { next: { tags: ["products"] } }), // Produtos podem ser cacheados
  ]);

  const rawCart = await cartRes.json();
  const products: Product[] = await productsRes.json();

  if (!rawCart || !rawCart.lines) return undefined;

  // O carrinho do db.json só tem IDs, precisamos adicionar os detalhes completos do produto
  const hydratedLines = rawCart.lines
    .map((line: { merchandiseId: string; quantity: number }) => {
      const variant = products
        .flatMap((p) => p.variants)
        .find((v) => v.id === line.merchandiseId);

      const product = products.find((p) =>
        p.variants.some((v) => v.id === line.merchandiseId)
      );

      if (!variant || !product) return null;

      return {
        quantity: line.quantity,
        cost: {
          totalAmount: {
            amount: (Number(variant.price.amount) * line.quantity).toString(),
            currencyCode: variant.price.currencyCode,
          },
        },
        merchandise: {
          id: variant.id,
          title: variant.title,
          selectedOptions: variant.selectedOptions,
          product: {
            id: product.id,
            handle: product.handle,
            title: product.title,
            featuredImage: product.featuredImage,
          },
        },
      };
    })
    .filter(Boolean) as CartItem[];

  // Recalcula totais com base nos dados hidratados
  const totalQuantity = hydratedLines.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalAmount = hydratedLines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode = hydratedLines[0]?.cost.totalAmount.currencyCode ?? "BRL";

  return {
    id: rawCart.id,
    checkoutUrl: rawCart.checkoutUrl ?? "", // Provide checkoutUrl, fallback to empty string if missing
    totalQuantity,
    lines: hydratedLines,
    cost: {
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

// Função genérica para atualizar o carrinho no backend
async function updateCartOnServer(
  lines: { merchandiseId: string; quantity: number }[]
) {
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  await fetch(`${API_URL}/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines, totalQuantity }),
  });
  revalidateTag("cart"); // Invalida o cache do carrinho
}

export async function getMenu(
  handle: string
): Promise<{ title: string; path: string }[]> {
  // O argumento 'handle' é ignorado, mas mantemos para a assinatura da função ser a mesma.
  const res = await fetch("http://localhost:4000/menu", {
    next: {
      tags: ["menu"],
    },
  });

  return res.json();
}

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  const res = await fetch(`${API_URL}/collections`, {
    next: {
      tags: ["collections"],
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch collections.");
  }

  const collections: Collection[] = await res.json();

  // Encontra a coleção específica pelo seu "handle" (identificador)
  return collections.find((collection) => collection.handle === handle);
}

// =======================================================================
// FUNÇÃO ATUALIZADA
// =======================================================================
export async function getCollectionProducts({
  collection,
  sortKey,
  reverse,
}: {
  collection: string;
  sortKey?: string;
  reverse?: boolean;
}): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, {
    next: {
      tags: ["products", collection],
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products.");
  }

  const products: Product[] = await res.json();

  // 1. Filtra os produtos para a coleção correta
  const filteredProducts = products.filter((product) =>
    product.collections?.includes(collection)
  );

  // 2. Aplica a ordenação se `sortKey` for fornecido
  if (sortKey) {
    filteredProducts.sort((a, b) => {
      const aValue =
        sortKey === "PRICE"
          ? Number(a.priceRange.minVariantPrice.amount)
          : new Date(a.updatedAt).getTime();
      const bValue =
        sortKey === "PRICE"
          ? Number(b.priceRange.minVariantPrice.amount)
          : new Date(b.updatedAt).getTime();

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    if (reverse) {
      filteredProducts.reverse();
    }
  }

  return filteredProducts;
}

// =======================================================================
// NOVAS FUNÇÕES PARA O SITEMAP
// =======================================================================

export async function getCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_URL}/collections`, {
    next: { tags: ["collections"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch collections.");
  }

  const collections: Collection[] = await res.json();

  // O sitemap espera uma propriedade `path`, que não existe no nosso db.json.
  // Vamos adicioná-la aqui, assim como a função antiga do Shopify fazia.
  return collections.map((collection) => ({
    ...collection,
    path: `/search/${collection.handle}`,
  }));
}

export async function getProducts(options: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  // Por enquanto, esta função simplesmente busca todos os produtos.
  // A lógica de query/sort pode ser adicionada depois se necessário.
  const res = await fetch(`${API_URL}/products`, {
    next: { tags: ["products"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products.");
  }

  return res.json();
}

export async function getPages(): Promise<Page[]> {
  const res = await fetch(`${API_URL}/pages`, {
    next: { tags: ["pages"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch pages.");
  }

  return res.json();
}

export async function getPage(handle: string): Promise<Page | undefined> {
  const res = await fetch(`${API_URL}/pages`, {
    next: { tags: ["pages"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch pages.");
  }

  const pages: Page[] = await res.json();

  // Encontra a página específica pelo seu "handle"
  return pages.find((page) => page.handle === handle);
}

// Esta função é chamada pela Rota da API em 'app/api/revalidate/route.ts'
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // 1. Extrai os parâmetros da URL da requisição
  const tag = req.nextUrl.searchParams.get("tag");
  const secret = req.nextUrl.searchParams.get("secret");

  // 2. Verifica se o segredo enviado corresponde ao que está no .env.local
  // Isso protege o endpoint de ser acionado por qualquer pessoa.
  if (secret !== process.env.REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // 3. Verifica se a tag que deve ser revalidada foi informada
  if (!tag) {
    return NextResponse.json(
      { error: "Tag parameter is missing" },
      { status: 400 }
    );
  }

  // 4. Invalida o cache para a tag especificada (ex: 'products', 'collections')
  revalidateTag(tag);

  // 5. Retorna uma resposta de sucesso
  return NextResponse.json({ revalidated: true, tag: tag, now: Date.now() });
}
