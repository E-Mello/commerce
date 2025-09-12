// Em lib/data.ts
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Cart, CartItem, Collection, Page, Product } from "./types";

const API_URL = "http://localhost:4000";

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

export async function getProduct(handle: string): Promise<Product | undefined> {
  const res = await fetch(`${API_URL}/products`, {
    next: { tags: ["products"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products.");
  }

  const products: Product[] = await res.json();

  // Encontra o produto específico pelo seu "handle"
  return products.find((product) => product.handle === handle);
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, {
    next: { tags: ["products"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products.");
  }

  const products: Product[] = await res.json();

  // 1. Encontra o produto atual para saber suas coleções.
  const currentProduct = products.find((product) => product.id === productId);
  if (!currentProduct || !currentProduct.collections?.length) {
    return [];
  }

  // 2. Pega a primeira coleção do produto atual.
  const primaryCollection = currentProduct.collections[0];

  // 3. Adicione esta verificação para garantir que a coleção existe
  if (!primaryCollection) {
    return [];
  }

  // 4. Filtra para encontrar outros produtos na mesma coleção, excluindo o atual.
  const recommendedProducts = products.filter(
    (product) =>
      product.id !== productId &&
      product.collections?.includes(primaryCollection)
  );

  // 5. Retorna os 4 primeiros encontrados.
  return recommendedProducts.slice(0, 4);
}

type RawCartLine = { merchandiseId: string; quantity: number };

export async function getCart(): Promise<Cart | undefined> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  if (!cartId) return undefined;

  const [cartRes, productsRes] = await Promise.all([
    fetch(`${API_URL}/cart`, { cache: "no-store" }),
    fetch(`${API_URL}/products`, { next: { tags: ["products"] } }),
  ]);

  const rawCart = await cartRes.json();
  const products: Product[] = await productsRes.json();

  if (!rawCart || !rawCart.lines) return undefined;

  const hydratedLines = rawCart.lines
    .map((line: RawCartLine): CartItem | null => {
      const variant = products
        .flatMap((p) => p.variants)
        .find((v) => v.id === line.merchandiseId);

      const product = products.find((p) =>
        p.variants.some((v) => v.id === line.merchandiseId)
      );

      if (!variant || !product) return null;

      return {
        id: variant.id,
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
          // =======================================================================
          // CORREÇÃO 2: Passamos o objeto 'product' inteiro.
          // O tipo `Omit` em lib/types.ts garante que só as propriedades
          // corretas fiquem disponíveis, sem precisar criar um objeto manual.
          // =======================================================================
          product: product,
        },
      };
    })
    .filter((line: CartItem | null): line is CartItem => line !== null);

  // CORREÇÃO 3: Tipamos os parâmetros do `reduce` para resolver o erro 'any'.
  const totalQuantity = hydratedLines.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );
  const totalAmount = hydratedLines.reduce(
    (sum: number, item: CartItem) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode = hydratedLines[0]?.cost.totalAmount.currencyCode ?? "BRL";

  return {
    ...rawCart,
    lines: hydratedLines,
    totalQuantity,
    cost: {
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

export async function createCart(): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lines: [],
      totalQuantity: 0,
    }),
  });
  const newCart = await res.json();
  return {
    ...newCart,
    lines: [],
    totalQuantity: 0,
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "BRL" },
      totalAmount: { amount: "0", currencyCode: "BRL" },
      totalTaxAmount: { amount: "0", currencyCode: "BRL" },
    },
  };
}

export async function addToCart(lines: RawCartLine[]): Promise<Cart> {
  const cartRes = await fetch(`${API_URL}/cart`, { cache: "no-store" });
  const currentCart = await cartRes.json();
  const currentLines: RawCartLine[] = currentCart.lines || [];

  for (const lineToAdd of lines) {
    const existingLine = currentLines.find(
      (line) => line.merchandiseId === lineToAdd.merchandiseId
    );
    if (existingLine) {
      existingLine.quantity += lineToAdd.quantity;
    } else {
      currentLines.push(lineToAdd);
    }
  }

  await fetch(`${API_URL}/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: currentLines }),
  });

  return (await getCart()) as Cart;
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartRes = await fetch(`${API_URL}/cart`, { cache: "no-store" });
  const currentCart = await cartRes.json();

  const newLines = currentCart.lines.filter(
    (line: RawCartLine) => !lineIds.includes(line.merchandiseId)
  );

  await fetch(`${API_URL}/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: newLines }),
  });

  return (await getCart()) as Cart;
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartRes = await fetch(`${API_URL}/cart`, { cache: "no-store" });
  const currentCart = await cartRes.json();

  const newLines = currentCart.lines.map((line: RawCartLine) => {
    const lineToUpdate = lines.find(
      (l) => l.merchandiseId === line.merchandiseId
    );
    if (lineToUpdate) {
      return { ...line, quantity: lineToUpdate.quantity };
    }
    return line;
  });

  await fetch(`${API_URL}/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: newLines }),
  });

  return (await getCart()) as Cart;
}
