// Em actions/cart.ts
"use server";

import { getCart } from "lib/data";
import { Product, ProductVariant } from "lib/types";

// Função genérica para atualizar o carrinho no servidor
async function updateCartOnServer(
  lines: { merchandiseId: string; quantity: number }[]
) {
  const API_URL = "http://localhost:4000";
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  await fetch(`${API_URL}/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines, totalQuantity }),
  });
  // Não precisa revalidar aqui, a página será recarregada ou o cache atualizado pela mutação
}

export async function addItem(variant: ProductVariant, product: Product) {
  const cart = await getCart();
  const existingItem = cart?.lines.find(
    (item) => item.merchandise.id === variant.id
  );

  const newLines = existingItem
    ? cart!.lines.map((item) =>
        item.merchandise.id === variant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    : [...(cart?.lines || []), { merchandise: variant, product, quantity: 1 }];

  const serverLines = newLines.map((line) => ({
    merchandiseId: line.merchandise.id,
    quantity: line.quantity,
  }));
  await updateCartOnServer(serverLines);
}

export async function updateItemQuantity(
  merchandiseId: string,
  quantity: number
) {
  const cart = await getCart();
  if (!cart) return;

  const newLines = cart.lines
    .map((item) =>
      item.merchandise.id === merchandiseId ? { ...item, quantity } : item
    )
    .filter((item) => item.quantity > 0);

  const serverLines = newLines.map((line) => ({
    merchandiseId: line.merchandise.id,
    quantity: line.quantity,
  }));
  await updateCartOnServer(serverLines);
}
