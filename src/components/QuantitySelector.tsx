import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  initValue?: number;
}

export const QuantitySelector = ({ maxQuantity, onQuantityChange, initValue }: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(1);

  console.log('initValue : ' + initValue);



  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      setQuantity(value);
      onQuantityChange(value);
    } else if (e.target.value === "") {
      setQuantity(1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={quantity == 0}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        min="0"
        max={maxQuantity}
        value={quantity}
        onChange={handleInputChange}
        className="w-16 text-center"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
