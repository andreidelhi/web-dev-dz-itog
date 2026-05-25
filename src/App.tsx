import { startTransition, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import './App.css'
import { fetchProducts, submitOrder } from './api'
import type { CartState, Product } from './types'

function App() {
  const [cart, setCart] = useState<CartState>({})
  const [lastOrderId, setLastOrderId] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const checkoutMutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: (data) => {
      setLastOrderId(data.order.id)
      setIsDialogOpen(true)
      setCart({})
    },
  })

  const products = productsQuery.data ?? []
  const cartItems = products
    .filter((product) => cart[product.id] > 0)
    .map((product) => ({
      product,
      quantity: cart[product.id],
    }))

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  function setQuantity(productId: string, quantity: number) {
    startTransition(() => {
      setCart((currentCart) => {
        if (quantity <= 0) {
          const nextCart = { ...currentCart }
          delete nextCart[productId]
          return nextCart
        }

        return {
          ...currentCart,
          [productId]: quantity,
        }
      })
    })
  }

  function addToCart(product: Product) {
    setQuantity(product.id, (cart[product.id] ?? 0) + 1)
  }

  function changeQuantity(product: Product, delta: number) {
    setQuantity(product.id, (cart[product.id] ?? 0) + delta)
  }

  function handleCheckout() {
    checkoutMutation.mutate({
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      total: totalPrice,
    })
  }

  return (
    <>
      <main className="shop-shell">
        <section className="shop-hero">
          <div>
            <p className="shop-eyebrow">Домашняя работа 3. Финальный проект</p>
            <h1>Сезонная лавка с быстрым оформлением заказа</h1>
            <p className="shop-description">
              Одностраничный магазин на React, TypeScript, MirageJS и TanStack
              Query. Товары загружаются с мокированного сервера, а заказ тоже
              сохраняется в него.
            </p>
          </div>

          <div className="hero-metrics">
            <article>
              <span>{products.length}</span>
              <p>Товаров загружено</p>
            </article>
            <article>
              <span>{totalQuantity}</span>
              <p>Товаров в корзине</p>
            </article>
            <article>
              <span>${totalPrice.toFixed(2)}</span>
              <p>Сумма корзины</p>
            </article>
          </div>
        </section>

        <section className="shop-layout">
          <section className="catalog-panel">
            <div className="section-heading">
              <p className="section-label">Каталог</p>
              <h2>Выберите товары для корзины</h2>
            </div>

            {productsQuery.isLoading ? (
              <p className="status-box">Загрузка товаров из MirageJS...</p>
            ) : null}

            {productsQuery.isError ? (
              <p className="status-box error-box">
                Не удалось загрузить каталог. Обновите страницу.
              </p>
            ) : null}

            <div className="product-grid">
              {products.map((product) => {
                const quantity = cart[product.id] ?? 0

                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-badge">{product.category}</div>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>

                    <div className="product-footer">
                      <div>
                        <strong>${product.price.toFixed(2)}</strong>
                        <span>за {product.unit}</span>
                      </div>

                      {quantity === 0 ? (
                        <button type="button" onClick={() => addToCart(product)}>
                          В корзину
                        </button>
                      ) : (
                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() => changeQuantity(product, -1)}
                          >
                            -
                          </button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(product, 1)}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="cart-panel">
            <div className="section-heading">
              <p className="section-label">Корзина</p>
              <h2>Текущий заказ</h2>
            </div>

            {cartItems.length === 0 ? (
              <p className="status-box">
                Корзина пуста. Добавьте товары, чтобы увидеть состав заказа.
              </p>
            ) : (
              <div className="cart-list">
                {cartItems.map((item) => (
                  <article className="cart-item" key={item.product.id}>
                    <div>
                      <h3>{item.product.title}</h3>
                      <p>
                        ${item.product.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>

                    <div className="quantity-controls compact">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.product, -1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.product, 1)}
                      >
                        +
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="cart-summary">
              <div>
                <span>Всего товаров</span>
                <strong>{totalQuantity}</strong>
              </div>
              <div>
                <span>Итоговая сумма</span>
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
            </div>

            {checkoutMutation.isError ? (
              <p className="status-box error-box">
                Не удалось сохранить заказ. Попробуйте ещё раз.
              </p>
            ) : null}

            <button
              className="checkout-button"
              type="button"
              disabled={cartItems.length === 0 || checkoutMutation.isPending}
              onClick={handleCheckout}
            >
              {checkoutMutation.isPending ? 'Сохранение заказа...' : 'Оформить заказ'}
            </button>
          </aside>
        </section>
      </main>

      {isDialogOpen ? (
        <div className="dialog-backdrop" role="presentation">
          <div className="dialog-card" role="dialog" aria-modal="true">
            <p className="section-label">Заказ оформлен</p>
            <h2>Спасибо за покупку</h2>
            <p>
              Мокированный сервер сохранил ваш заказ. Номер подтверждения:
              <strong> {lastOrderId}</strong>
            </p>
            <button type="button" onClick={() => setIsDialogOpen(false)}>Закрыть</button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default App
