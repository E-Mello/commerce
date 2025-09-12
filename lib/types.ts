// Em lib/types.ts
export type ProductVariant = {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  featuredImage: {
    url: string;
  };
  price: {
    amount: string;
    currencyCode: string;
  };
  variants: ProductVariant[];
};

export type CartItem = {
  id?: string; // O ID da linha do carrinho
  quantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  merchandise: {
    id: string; // ID da variante do produto
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: {
        url: string;
      };
    };
  };
};

export type Cart = {
  id?: string;
  checkoutUrl?: string;
  totalQuantity: number;
  lines: CartItem[];
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
    totalTaxAmount: { amount: string; currencyCode: string };
  };
};
