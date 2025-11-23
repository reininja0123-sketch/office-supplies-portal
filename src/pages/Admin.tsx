import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, ShoppingBag, Pencil, Trash2, Plus, Upload, Download, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "@/components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, auth } from "@/lib/api"; // Updated Import

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
    image_url: string;
    category_id: string;
    low_stock_threshold: number;
}

interface Order {
    id: string;
    user_email: string;
    user_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    approved_at?: string;
    approved_by?: string;
}

const Admin = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        sku: "",
        image_url: "",
        low_stock_threshold: "10",
        category_id: "",
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = () => {
        try {
            const user = auth.getUser();

            if (!user) {
                navigate("/auth");
                return;
            }

            // Check role from local session (set in Auth.tsx)
            if (user.role !== 'admin') {
                toast({
                    title: "Access Denied",
                    description: "You do not have admin privileges",
                    variant: "destructive",
                });
                navigate("/");
                return;
            }

            setIsAdmin(true);
            fetchProducts();
            fetchOrders();
            fetchCategories();
        } catch (error) {
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await api.get('/categories');
            setCategories(data || []);
        } catch (error) {
            console.error("Failed to fetch categories");
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await api.get('/products');
            setProducts(data || []);
        } catch (error) {
            console.error("Failed to fetch products");
        }
    };

    const fetchOrders = async () => {
        try {
            // Fetch all orders (backend handles returning all for admin)
            const data = await api.get('/orders');
            setOrders(data || []);
        } catch (error) {
            console.error("Failed to fetch orders");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity),
            sku: formData.sku,
            image_url: formData.image_url,
            low_stock_threshold: parseInt(formData.low_stock_threshold),
            category_id: formData.category_id || null,
        };

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, productData);
                toast({ title: "Product updated successfully" });
            } else {
                await api.post('/products', productData);
                toast({ title: "Product created successfully" });
            }

            setIsDialogOpen(false);
            setEditingProduct(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                stock_quantity: "",
                sku: "",
                image_url: "",
                low_stock_threshold: "10",
                category_id: "",
            });
            fetchProducts();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock_quantity: product.stock_quantity.toString(),
            sku: product.sku,
            image_url: product.image_url || "",
            low_stock_threshold: product.low_stock_threshold.toString(),
            category_id: product.category_id || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await api.delete(`/products/${id}`);
            toast({ title: "Product deleted successfully" });
            fetchProducts();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, categoryFormData);
                toast({ title: "Category updated successfully" });
            } else {
                await api.post('/categories', categoryFormData);
                toast({ title: "Category created successfully" });
            }

            setIsCategoryDialogOpen(false);
            setEditingCategory(null);
            setCategoryFormData({ name: "", description: "" });
            fetchCategories();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure? Products in this category will be uncategorized.")) return;

        try {
            await api.delete(`/categories/${id}`);
            toast({ title: "Category deleted successfully" });
            fetchCategories();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleApproveOrder = async (orderId: string, newStatus: string) => {
        try {
            const user = auth.getUser();

            await api.put(`/orders/${orderId}/status`, {
                status: newStatus,
                approved_by: user?.id
            });

            // Email notification logic is now handled (or mocked) by the backend
            // when the status changes, we don't invoke edge functions from client anymore.

            toast({
                title: "Order updated",
                description: `Order status changed to ${newStatus}`,
            });

            fetchOrders();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Description', 'Price', 'Stock Quantity', 'SKU', 'Image URL', 'Low Stock Threshold'];
        const csvData = products.map(p => [
            p.name,
            p.description || '',
            p.price,
            p.stock_quantity,
            p.sku,
            p.image_url || '',
            p.low_stock_threshold
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: "Export successful",
            description: `Exported ${products.length} products to CSV`,
        });
    };

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n');
                // Simple CSV parsing
                const productsToImport = [];

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;

                    const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];

                    if (values.length >= 5) {
                        productsToImport.push({
                            name: values[0],
                            description: values[1] || '',
                            price: parseFloat(values[2]) || 0,
                            stock_quantity: parseInt(values[3]) || 0,
                            sku: values[4],
                            image_url: values[5] || '',
                            low_stock_threshold: parseInt(values[6]) || 10,
                        });
                    }
                }

                if (productsToImport.length === 0) {
                    toast({
                        title: "No products to import",
                        description: "The CSV file appears to be empty or invalid",
                        variant: "destructive",
                    });
                    return;
                }

                // Parallel API calls to insert products (Since our server.ts endpoint handles one at a time)
                // In a production app, you would create a bulk-insert endpoint.
                const promises = productsToImport.map(product => api.post('/products', product));
                await Promise.all(promises);

                toast({
                    title: "Import successful",
                    description: `Imported ${productsToImport.length} products`,
                });

                fetchProducts();
            } catch (error: any) {
                toast({
                    title: "Import failed",
                    description: error.message,
                    variant: "destructive",
                });
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <Button variant="outline" onClick={() => navigate("/")}>
                        Back to Store
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="products">
                    <TabsList>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Product Management</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={exportToCSV}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <label htmlFor="csv-import" className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Import CSV
                                            <input
                                                id="csv-import"
                                                type="file"
                                                accept=".csv"
                                                className="hidden"
                                                onChange={handleImportCSV}
                                            />
                                        </label>
                                    </Button>
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    setEditingProduct(null);
                                                    setFormData({
                                                        name: "",
                                                        description: "",
                                                        price: "",
                                                        stock_quantity: "",
                                                        sku: "",
                                                        image_url: "",
                                                        low_stock_threshold: "10",
                                                        category_id: "",
                                                    });
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Product
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Product Name</Label>
                                                    <Input
                                                        id="name"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, name: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={formData.description}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, description: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="price">Price</Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            step="0.01"
                                                            required
                                                            value={formData.price}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, price: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="stock">Stock Quantity</Label>
                                                        <Input
                                                            id="stock"
                                                            type="number"
                                                            required
                                                            value={formData.stock_quantity}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    stock_quantity: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="sku">SKU</Label>
                                                        <Input
                                                            id="sku"
                                                            required
                                                            value={formData.sku}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, sku: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                                                        <Input
                                                            id="low_stock_threshold"
                                                            type="number"
                                                            required
                                                            value={formData.low_stock_threshold}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    low_stock_threshold: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Category</Label>
                                                    <Select
                                                        value={formData.category_id}
                                                        onValueChange={(value) =>
                                                            setFormData({ ...formData, category_id: value })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category (optional)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">No Category</SelectItem>
                                                            {categories.map((cat) => (
                                                                <SelectItem key={cat.id} value={cat.id}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Product Image</Label>
                                                    <ImageUpload
                                                        currentImage={formData.image_url}
                                                        onImageUploaded={(url) =>
                                                            setFormData({ ...formData, image_url: url })
                                                        }
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full">
                                                    {editingProduct ? "Update Product" : "Add Product"}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>{product.sku}</TableCell>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell>₱{product.price.toFixed(2)}</TableCell>
                                                <TableCell>
                          <span
                              className={
                                  product.stock_quantity <= product.low_stock_threshold
                                      ? "text-red-600 font-bold"
                                      : ""
                              }
                          >
                            {product.stock_quantity}
                          </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(product)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs">
                                                    {order.id.slice(0, 8)}
                                                </TableCell>
                                                <TableCell>{order.user_name}</TableCell>
                                                <TableCell>{order.user_email}</TableCell>
                                                <TableCell>₱{order.total_amount.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            order.status === "pending"
                                                                ? "bg-yellow-500"
                                                                : order.status === "processing"
                                                                    ? "bg-blue-500"
                                                                    : order.status === "completed"
                                                                        ? "bg-green-500"
                                                                        : ""
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {order.status === "pending" && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApproveOrder(order.id, "processing")}
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {order.status === "processing" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleApproveOrder(order.id, "completed")}
                                                        >
                                                            Complete
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="categories">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Category Management</CardTitle>
                                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                setEditingCategory(null);
                                                setCategoryFormData({ name: "", description: "" });
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Category
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingCategory ? "Edit Category" : "Add New Category"}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cat-name">Category Name</Label>
                                                <Input
                                                    id="cat-name"
                                                    required
                                                    value={categoryFormData.name}
                                                    onChange={(e) =>
                                                        setCategoryFormData({ ...categoryFormData, name: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cat-description">Description</Label>
                                                <Textarea
                                                    id="cat-description"
                                                    value={categoryFormData.description}
                                                    onChange={(e) =>
                                                        setCategoryFormData({ ...categoryFormData, description: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">
                                                {editingCategory ? "Update Category" : "Add Category"}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>{category.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingCategory(category);
                                                                setCategoryFormData({
                                                                    name: category.name,
                                                                    description: category.description || "",
                                                                });
                                                                setIsCategoryDialogOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Admin;