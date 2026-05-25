import { Response, createServer } from 'miragejs'

const products = [
  {
    id: 'olive-oil',
    title: 'Cold Pressed Olive Oil',
    description: 'Peppery finishing oil for salads, roasted vegetables, and warm bread.',
    price: 12.5,
    unit: 'bottle',
    category: 'Pantry',
  },
  {
    id: 'sea-salt',
    title: 'Flaked Sea Salt',
    description: 'Bright finishing salt with wide crystals for steaks and tomatoes.',
    price: 6.9,
    unit: 'jar',
    category: 'Essentials',
  },
  {
    id: 'apricot-jam',
    title: 'Apricot Jam',
    description: 'Small-batch jam with citrus peel and a light honey finish.',
    price: 8.4,
    unit: 'jar',
    category: 'Breakfast',
  },
  {
    id: 'cocoa-granola',
    title: 'Cocoa Buckwheat Granola',
    description: 'Crunchy granola with toasted nuts, cacao nibs, and maple syrup.',
    price: 9.75,
    unit: 'bag',
    category: 'Breakfast',
  },
  {
    id: 'coffee-beans',
    title: 'House Roast Coffee',
    description: 'Chocolate-forward arabica blend with notes of toasted almond.',
    price: 14.2,
    unit: 'pack',
    category: 'Drinks',
  },
  {
    id: 'herbal-tea',
    title: 'Garden Herbal Tea',
    description: 'Mint, verbena, and dried pear slices for a calm evening cup.',
    price: 7.5,
    unit: 'box',
    category: 'Drinks',
  },
  {
    id: 'pasta',
    title: 'Bronze-Cut Pasta',
    description: 'Ridged pasta that holds sauces well and stays firm after cooking.',
    price: 5.6,
    unit: 'pack',
    category: 'Dinner',
  },
  {
    id: 'tomato-sauce',
    title: 'Slow Simmer Tomato Sauce',
    description: 'Tomato sauce with garlic confit, basil, and a touch of chili.',
    price: 7.95,
    unit: 'bottle',
    category: 'Dinner',
  },
]

function createOrderId() {
  return `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function makeServer() {
  return createServer({
    seeds(server) {
      server.db.loadData({
        products,
        orders: [],
      })
    },

    routes() {
      this.namespace = 'api'

      this.get('/products', (schema) => {
        return {
          products: schema.db.products,
        }
      })

      this.post('/orders', (schema, request) => {
        const payload = JSON.parse(request.requestBody || '{}')

        if (!Array.isArray(payload.items) || payload.items.length === 0) {
          return new Response(
            400,
            { 'Content-Type': 'application/json' },
            { error: 'Order must include at least one item' },
          )
        }

        const order = {
          id: createOrderId(),
          items: payload.items,
          total: Number(payload.total) || 0,
          itemCount: payload.items.reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0,
          ),
          createdAt: new Date().toISOString(),
        }

        schema.db.orders.insert(order)

        return {
          order: {
            id: order.id,
            total: order.total,
            itemCount: order.itemCount,
            createdAt: order.createdAt,
          },
        }
      })
    },
  })
}
