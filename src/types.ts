export type Product = {
  id: string
  title: string
  description: string
  price: number
  unit: string
  category: string
}

export type CartState = Record<string, number>

export type OrderPayload = {
  items: Array<{
    productId: string
    quantity: number
  }>
  total: number
}

export type OrderResponse = {
  order: {
    id: string
    total: number
    itemCount: number
    createdAt: string
  }
}
