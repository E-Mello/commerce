// Path: lib/types.ts

// Tipos básicos reutilizáveis
export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type SEO = {
  title: string;
  description: string;
};

export type MenuItem = {
  title: string;
  path: string;
};

// Tipos principais do domínio da aplicação
export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  collections?: string[]; // Array de handles das coleções
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  path: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

// Tipos específicos do Carrinho (usados no Contexto e na UI)
// Representa um item de carrinho após ser "hidratado" com os detalhes do produto
export type CartItem = {
  id?: string; // ID da linha do carrinho, se existir
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string; // ID da variante
    title: string;

    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: Omit<
      Product,
      "variants" | "options" | "images" | "descriptionHtml" | "description"
    >;
  };
};

// Representa o carrinho completo, processado e pronto para a UI
export type Cart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
};
