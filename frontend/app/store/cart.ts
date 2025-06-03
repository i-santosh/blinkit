import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  decrementItem: (id: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addItem: (item) => {
        const currentItems = get().items;
        // Ensure ID is a number for consistent comparison
        const itemId = Number(item.id);
        const existingItem = currentItems.find((i) => i.id === itemId);
        
        if (existingItem) {
          // Update quantity if item already exists
          set((state) => ({
            items: state.items.map((i) => 
              i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
            totalItems: state.totalItems + 1,
            totalPrice: state.totalPrice + item.price,
          }));
        } else {
          // Add new item with quantity 1, ensuring ID is a number
          set((state) => ({
            items: [...state.items, { ...item, id: itemId, quantity: 1 }],
            totalItems: state.totalItems + 1,
            totalPrice: state.totalPrice + item.price,
          }));
        }
      },
      
      removeItem: (id) => {
        const currentItems = get().items;
        // Ensure ID is a number for consistent comparison
        const itemId = Number(id);
        const itemToRemove = currentItems.find((i) => i.id === itemId);
        
        if (itemToRemove) {
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
            totalItems: state.totalItems - itemToRemove.quantity,
            totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity),
          }));
        }
      },
      
      updateQuantity: (id, quantity) => {
        const currentItems = get().items;
        // Ensure ID is a number for consistent comparison
        const itemId = Number(id);
        const item = currentItems.find((i) => i.id === itemId);
        
        if (item && quantity > 0) {
          const quantityDiff = quantity - item.quantity;
          
          set((state) => ({
            items: state.items.map((i) => 
              i.id === itemId ? { ...i, quantity } : i
            ),
            totalItems: state.totalItems + quantityDiff,
            totalPrice: state.totalPrice + (item.price * quantityDiff),
          }));
        } else if (item && quantity === 0) {
          // Remove item if quantity is zero
          get().removeItem(itemId);
        }
      },
      
      decrementItem: (id) => {
        const currentItems = get().items;
        // Ensure ID is a number for consistent comparison
        const itemId = Number(id);
        const item = currentItems.find((i) => i.id === itemId);
        
        if (item) {
          if (item.quantity > 1) {
            // If quantity is greater than 1, decrement it
            get().updateQuantity(itemId, item.quantity - 1);
          } else {
            // If quantity is 1, remove the item
            get().removeItem(itemId);
          }
        }
      },
      
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },
    }),
    {
      name: 'blinkit-cart',
    }
  )
);