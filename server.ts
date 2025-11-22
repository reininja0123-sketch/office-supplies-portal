import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto'; // Native Node module for UUIDs
import pool from './src/db';
import { Product, Category, Order, LowStockProduct } from './src/integrations/dao/types';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// 1. PRODUCT ROUTES (Store & Admin)
// ==========================================

// GET All Products
// Supports filtering by category: /products?category_id=...
app.get('/products', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const categoryId = req.query.category_id;

        let query = "SELECT * FROM products";
        let params: any[] = [];

        if (categoryId) {
            query += " WHERE category_id = ?";
            params.push(categoryId);
        }

        query += " ORDER BY created_at DESC";

        const rows = await conn.query(query, params);

        // MariaDB returns rows + meta data. Slice ensures we send just the rows.
        const products: Product[] = rows.slice(0, rows.length);
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});

// POST Create Product (Admin)
app.post('/products', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const {
            name, description, price, stock_quantity, sku,
            image_url, category_id, low_stock_threshold
        } = req.body;

        const id = crypto.randomUUID();

        await conn.query(
            `INSERT INTO products 
       (id, name, description, price, stock_quantity, sku, image_url, category_id, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, name, description, price, stock_quantity, sku,
                image_url || null, category_id || null, low_stock_threshold || 10
            ]
        );

        res.status(201).json({ message: 'Product created', id });
    } catch (err: any) {
        console.error("Error creating product:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// PUT Update Product (Admin)
app.put('/products/:id', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const {
            name, description, price, stock_quantity, sku,
            image_url, category_id, low_stock_threshold
        } = req.body;

        const { id } = req.params;

        await conn.query(
            `UPDATE products SET 
       name=?, description=?, price=?, stock_quantity=?, sku=?, 
       image_url=?, category_id=?, low_stock_threshold=?
       WHERE id=?`,
            [
                name, description, price, stock_quantity, sku,
                image_url || null, category_id || null, low_stock_threshold, id
            ]
        );

        res.json({ message: 'Product updated' });
    } catch (err: any) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// DELETE Product (Admin)
app.delete('/products/:id', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM products WHERE id = ?", [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// ==========================================
// 2. CATEGORY ROUTES (Store & Admin)
// ==========================================

// GET Categories
app.get('/categories', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM categories ORDER BY name ASC");
        const categories: Category[] = rows.slice(0, rows.length);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});

// POST Category (Admin)
app.post('/categories', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { name, description } = req.body;
        const id = crypto.randomUUID();

        await conn.query(
            "INSERT INTO categories (id, name, description) VALUES (?, ?, ?)",
            [id, name, description]
        );
        res.status(201).json({ message: 'Category created', id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// PUT Category (Admin)
app.put('/categories/:id', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { name, description } = req.body;
        await conn.query(
            "UPDATE categories SET name=?, description=? WHERE id=?",
            [name, description, req.params.id]
        );
        res.json({ message: 'Category updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// DELETE Category (Admin)
app.delete('/categories/:id', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// ==========================================
// 3. ORDER ROUTES (Checkout & Dashboard)
// ==========================================

// POST Create Order (Checkout)
// Performs a Transaction: Creates Order -> Inserts Items -> Deducts Stock
app.post('/orders', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const { user_email, user_name, user_phone, total_amount, items, user_id } = req.body;
        const orderId = crypto.randomUUID();

        // 1. Insert Order
        await conn.query(
            `INSERT INTO orders 
       (id, user_id, user_email, user_name, user_phone, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [orderId, user_id || null, user_email, user_name, user_phone || null, total_amount]
        );

        // 2. Process Items
        for (const item of items) {
            const itemId = crypto.randomUUID();

            // Check stock availability
            const [product] = await conn.query(
                "SELECT stock_quantity, price FROM products WHERE id = ?",
                [item.product_id]
            );

            if (!product || product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ID: ${item.product_id}`);
            }

            // Insert Order Item (Using price from DB for security)
            const itemPrice = product.price;

            await conn.query(
                `INSERT INTO order_items (id, order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
                [itemId, orderId, item.product_id, item.quantity, itemPrice]
            );

            // Deduct Stock
            await conn.query(
                "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
                [item.quantity, item.product_id]
            );
        }

        await conn.commit();
        res.status(201).json({ message: 'Order placed successfully', id: orderId });

    } catch (err: any) {
        if (conn) await conn.rollback();
        console.error("Order failed:", err);
        res.status(500).json({ error: err.message || 'Failed to process order' });
    } finally {
        if (conn) conn.release();
    }
});

// GET Orders (Dashboard & Admin)
// Supports filtering by user_id: /orders?user_id=...
app.get('/orders', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const userId = req.query.user_id;

        let query = "SELECT * FROM orders";
        let params: any[] = [];

        if (userId) {
            query += " WHERE user_id = ?";
            params.push(userId);
        }

        query += " ORDER BY created_at DESC";

        const rows = await conn.query(query, params);
        const orders: Order[] = rows.slice(0, rows.length);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});

// GET Order Items (Single Order - Dashboard Details)
app.get('/orders/:id/items', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Join with products to get name and sku for display
        const query = `
      SELECT oi.*, p.name as product_name, p.sku as product_sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
        const rows = await conn.query(query, [req.params.id]);

        // Transform result to match Dashboard expected interface (nested products object)
        const formattedRows = rows.map((row: any) => ({
            id: row.id,
            order_id: row.order_id,
            product_id: row.product_id,
            quantity: row.quantity,
            price: row.price,
            created_at: row.created_at,
            products: { // Nested object required by Dashboard.tsx
                name: row.product_name,
                sku: row.product_sku
            }
        }));

        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});

// GET Order Items Bulk (For Dashboard CSV Export)
// Usage: /order-items?order_ids=id1,id2,id3
app.get('/order-items', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const orderIdsParam = req.query.order_ids as string;

        if (!orderIdsParam) {
            // Return empty if no IDs (or could implement "return all items" for admin)
            return res.json([]);
        }

        const orderIds = orderIdsParam.split(',');

        // Create placeholders (?,?,?)
        const placeholders = orderIds.map(() => '?').join(',');

        const query = `
      SELECT oi.*, p.name as product_name, p.sku as product_sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${placeholders})
    `;

        const rows = await conn.query(query, orderIds);

        const formattedRows = rows.map((row: any) => ({
            id: row.id,
            order_id: row.order_id,
            product_id: row.product_id,
            quantity: row.quantity,
            price: row.price,
            created_at: row.created_at,
            products: {
                name: row.product_name,
                sku: row.product_sku
            }
        }));

        res.json(formattedRows);
    } catch (err) {
        console.error("Error fetching bulk items:", err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});

// PUT Order Status (Admin)
app.put('/orders/:id/status', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { status, approved_by } = req.body;

        await conn.query(
            `UPDATE orders SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?`,
            [status, approved_by || null, req.params.id]
        );

        res.json({ message: 'Order status updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// ==========================================
// 4. REPORTS / EXTRAS
// ==========================================

// GET Low Stock Report
app.get('/products/low-stock', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`
      SELECT 
        id as product_id, 
        name as product_name, 
        stock_quantity as current_stock, 
        low_stock_threshold as threshold
      FROM products 
      WHERE stock_quantity <= low_stock_threshold
    `);
        const products: LowStockProduct[] = rows.slice(0, rows.length);
        res.json({ count: products.length, products });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});