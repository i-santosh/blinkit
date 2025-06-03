import { Link } from "@remix-run/react";
import { ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useCartStore } from "~/store/cart";

export function CartButton() {
  const { totalItems, totalPrice } = useCartStore();
  
  return (
    <Link to="/cart" className="relative">
      <Button className="flex items-center gap-2 pr-3" size="sm">
        <ShoppingBag size={18} />
        <span className="font-medium">Cart</span>
        {totalItems > 0 && (
          <span className="ml-1 text-xs bg-white text-primary rounded-full px-1.5 py-0.5 font-bold border border-primary">
            {totalItems}
          </span>
        )}
      </Button>
      {totalItems > 0 && (
        <span className="absolute -bottom-4 left-0 right-0 text-xs font-bold text-center bg-white/80 py-0.5 rounded-full backdrop-blur-sm text-black">
          ₹{totalPrice}
        </span>
      )}
    </Link>
  );
} 