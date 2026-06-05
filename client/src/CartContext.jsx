import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  function addItem(product, inventory, quantity = 1) {
    setItems(prev => {
      const key = `${inventory.id}`;
      const existing = prev.find(i => i.inventoryId === key);
      if (existing) {
        return prev.map(i => i.inventoryId === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        inventoryId: inventory.id,
        productId: product.id,
        productName: product.name,
        brandName: product.brand?.brandName,
        imageUrl: product.images?.[0]?.url,
        price: inventory.price,
        opticaId: inventory.optica?.id || inventory.opticaId,
        opticaName: inventory.optica?.businessName || 'Óptica',
        stockType: inventory.stockType,
        quantity,
      }];
    });
  }

  function removeItem(inventoryId) {
    setItems(prev => prev.filter(i => i.inventoryId !== inventoryId));
  }

  function updateQty(inventoryId, quantity) {
    if (quantity <= 0) { removeItem(inventoryId); return; }
    setItems(prev => prev.map(i => i.inventoryId === inventoryId ? { ...i, quantity } : i));
  }

  function clearCart() { setItems([]); }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  // Agrupar por óptica
  const byOptica = items.reduce((acc, item) => {
    if (!acc[item.opticaId]) acc[item.opticaId] = { opticaName: item.opticaName, items: [] };
    acc[item.opticaId].items.push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, byOptica }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
