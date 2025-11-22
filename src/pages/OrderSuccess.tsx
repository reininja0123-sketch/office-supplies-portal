import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
        <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
    </CardHeader>
    <CardContent className="text-center space-y-4">
    <p className="text-muted-foreground">
        Thank you for your order. You will receive a confirmation email shortly with your order details.
    </p>
    <Button onClick={() => navigate("/")} className="w-full">
        Continue Shopping
    </Button>
    </CardContent>
    </Card>
    </div>
);
};

export default OrderSuccess;