import type { OrderPayload, OrderResponse, Product } from './types'

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  const data = (await response.json()) as { products: Product[] }
  return data.products
}

export async function submitOrder(payload: OrderPayload): Promise<OrderResponse> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to submit order')
  }

  return (await response.json()) as OrderResponse
}
