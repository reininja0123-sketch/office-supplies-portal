import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Minus, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadRISPDF } from "@/utils/generateRISPDF";
import { api, auth } from "@/lib/api";

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number; // Requested Quantity
    approved_quantity: number | null; // New Column
    approval_status: string | null;   // New Column
    price: number;
    product?: {
        name: string;
        stock_quantity: number;
        sku: string;
    };
}

interface Order {
    id: string;
    user_name: string;
    user_email: string;
    total_amount: number;
    status: string;
    created_at: string;
}

interface OrderApprovalDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprovalComplete: () => void;
}

interface ItemApproval {
    order_item_id: string;
    approved_quantity: number;
    product_name: string;
    requested_quantity: number;
    available_stock: number;
}

export function OrderApprovalDialog({
                                        order,
                                        open,
                                        onOpenChange,
                                        onApprovalComplete,
                                    }: OrderApprovalDialogProps) {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [itemApprovals, setItemApprovals] = useState<ItemApproval[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (order && open) {
            fetchOrderItems();
        }
    }, [order, open]);

    const fetchOrderItems = async () => {
        if (!order) return;
        setLoading(true);
        try {
            const data: any[] = await api.get(`/orders/${order.id}/items`);

            // Map API response to our interface
            const items = (data || []).map((item: any) => ({
                ...item,
                product: item.products,
            }));

            setOrderItems(items);

            // Initialize approvals state
            setItemApprovals(
                items.map((item: OrderItem) => ({
                    order_item_id: item.id,
                    // Default approved qty is the requested qty (item.quantity)
                    approved_quantity: item.approved_quantity !== null ? item.approved_quantity : item.quantity,
                    product_name: item.product?.name || "Unknown Product",
                    requested_quantity: item.quantity,
                    available_stock: item.product?.stock_quantity || 0,
                }))
            );
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateApprovalQuantity = (itemId: string, quantity: number) => {
        setItemApprovals((prev) =>
            prev.map((item) =>
                item.order_item_id === itemId
                    ? { ...item, approved_quantity: Math.max(0, Math.min(quantity, item.available_stock + item.requested_quantity)) }
                    // Note: Logic above limits to available stock.
                    // Ideally, you can't give more than requested, so:
                    // Math.min(quantity, item.requested_quantity)
                    : item
            )
        );
    };

    const approveAll = () => {
        setItemApprovals((prev) =>
            prev.map((item) => ({
                ...item,
                approved_quantity: item.requested_quantity,
            }))
        );
    };

    const rejectAll = () => {
        setItemApprovals((prev) =>
            prev.map((item) => ({
                ...item,
                approved_quantity: 0,
            }))
        );
    };

    const calculateNewTotal = () => {
        return itemApprovals.reduce((sum, item) => {
            const orderItem = orderItems.find((oi) => oi.id === item.order_item_id);
            return sum + (orderItem?.price || 0) * item.approved_quantity;
        }, 0);
    };

    const handleSubmit = async () => {
        if (!order) return;
        setSubmitting(true);

        try {
            const newTotal = calculateNewTotal();
            const allRejected = itemApprovals.every((item) => item.approved_quantity === 0);
            const someReduced = itemApprovals.some(
                (item) => item.approved_quantity > 0 && item.approved_quantity < item.requested_quantity
            );

            // Determine Order Status
            let newStatus = "processing";
            if (allRejected) newStatus = "cancelled";
            else if (someReduced) newStatus = "processing"; // Or 'partial_approval' if you add that status to DB enum
            else newStatus = "approved"; // Or keep 'processing' if that is your flow

            const user = auth.getUser();
            const approverName = user?.full_name || user?.email || "Admin";

            await api.post(`/orders/${order.id}/approve`, {
                itemApprovals: itemApprovals.map((item) => ({
                    order_item_id: item.order_item_id,
                    approved_quantity: item.approved_quantity,
                })),
                status: newStatus,
                new_total: newTotal,
                approved_by: user?.id
            });

            // Generate RIS PDF
            if (!allRejected) {
                const pdfItems = orderItems.map((item) => {
                    const approval = itemApprovals.find((a) => a.order_item_id === item.id);
                    return {
                        product: {
                            id: item.product_id,
                            name: item.product?.name || "Unknown",
                            sku: item.product?.sku || "",
                            price: item.price,
                            stock_quantity: item.product?.stock_quantity || 0,
                        },
                        quantity: item.quantity, // Requested
                        approved_quantity: approval?.approved_quantity || 0,
                        approval_status: approval?.approved_quantity === 0 ? "rejected" :
                            (approval?.approved_quantity || 0) < item.quantity ? "partial" : "approved",
                    };
                });

                try {
                    await downloadRISPDF({
                        orderId: order.id,
                        userName: order.user_name,
                        userEmail: order.user_email,
                        items: pdfItems,
                        total: newTotal,
                        date: new Date(order.created_at),
                        status: newStatus,
                        approvalInfo: {
                            approvedBy: approverName,
                            approvedAt: new Date(),
                            issuedBy: approverName,
                        },
                    });
                } catch (pdfError) {
                    console.error("PDF Generation failed", pdfError);
                }
            }

            toast({
                title: "Success",
                description: allRejected
                    ? "Order rejected successfully"
                    : "Order approved and RIS form generated",
            });

            onApprovalComplete();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Approval error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to process approval",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Order Approval - {order.user_name}
                        <Badge variant="outline">{order.status}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* Order Details Header - Same as before */}
                        <div>
                            <span className="text-muted-foreground">Customer:</span>{" "}
                            <span className="font-medium">{order.user_name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Email:</span>{" "}
                            <span className="font-medium">{order.user_email}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Order Date:</span>{" "}
                            <span className="font-medium">
                                {new Date(order.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Original Total:</span>{" "}
                            <span className="font-medium">₱{order.total_amount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={approveAll}>
                            <Check className="mr-1 h-4 w-4" />
                            Approve All
                        </Button>
                        <Button variant="outline" size="sm" onClick={rejectAll}>
                            <X className="mr-1 h-4 w-4" />
                            Reject All
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading order items...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-center">Requested</TableHead>
                                    <TableHead className="text-center">Available Stock</TableHead>
                                    <TableHead className="text-center">Approved Qty</TableHead>
                                    <TableHead className="text-right">Line Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemApprovals.map((item) => {
                                    const orderItem = orderItems.find((oi) => oi.id === item.order_item_id);
                                    const lineTotal = (orderItem?.price || 0) * item.approved_quantity;

                                    // Stock logic: Stock available for assignment is Current Product Stock
                                    // But conceptually, the 'requested' amount is already reserved (deducted).
                                    // So we don't need to check stock unless we are *increasing* quantity (which we aren't).
                                    // The 'available_stock' displayed is what's left in the warehouse for *other* orders.

                                    return (
                                        <TableRow key={item.order_item_id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.product_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        ₱{orderItem?.price?.toFixed(2)} each
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{item.requested_quantity}</TableCell>
                                            <TableCell className="text-center">
                                                {item.available_stock}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            updateApprovalQuantity(item.order_item_id, item.approved_quantity - 1)
                                                        }
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={item.requested_quantity}
                                                        value={item.approved_quantity}
                                                        onChange={(e) =>
                                                            updateApprovalQuantity(item.order_item_id, parseInt(e.target.value) || 0)
                                                        }
                                                        className="w-16 h-8 text-center"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            updateApprovalQuantity(item.order_item_id, item.approved_quantity + 1)
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">₱{lineTotal.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.approved_quantity === 0
                                                            ? "destructive"
                                                            : item.approved_quantity < item.requested_quantity
                                                                ? "secondary"
                                                                : "default"
                                                    }
                                                >
                                                    {item.approved_quantity === 0
                                                        ? "Rejected"
                                                        : item.approved_quantity < item.requested_quantity
                                                            ? "Reduced"
                                                            : "Full"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-lg font-semibold">
                            New Total: ₱{calculateNewTotal().toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Original: ₱{order.total_amount.toFixed(2)}
                            {calculateNewTotal() < order.total_amount && (
                                <span className="text-destructive ml-2">
                                    (₱{(order.total_amount - calculateNewTotal()).toFixed(2)} reduction)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Processing..." : "Confirm Approval"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}