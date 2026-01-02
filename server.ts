import express, { Request, Response } from 'express';
import cors from 'cors';
// import crypto from 'crypto'; // Native Node module for UUIDs
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './src/db';
import { Product, Category, Order, LowStockProduct } from './src/integrations/dao/types';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// POST Register (Standard User)
app.post('/auth/register', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { email, password, full_name } = req.body;

        // Check 'users' table
        const existing = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const id = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(password, 12);

        await conn.beginTransaction();

        // 1. Create User
        await conn.query(
            "INSERT INTO users (id, email, full_name, password_hash) VALUES (?, ?, ?, ?)",
            [id, email, full_name, passwordHash]
        );

        // 2. Assign 'user' role
        await conn.query(
            "INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), ?, 'user')",
            [id]
        );

        await conn.commit();
        res.status(201).json({ message: "Registration successful" });

    } catch (err: any) {
        if (conn) await conn.rollback();
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    } finally {
        if (conn) conn.release();
    }
});

// POST Login
app.post('/auth/login', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { email, password } = req.body;

        // Join 'users' with 'user_roles'
        const rows = await conn.query(`
            SELECT u.*, ur.role 
            FROM users u 
            LEFT JOIN user_roles ur ON u.id = ur.user_id 
            WHERE u.email = ?
        `, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = rows[0];

        if (!user.password_hash) {
            return res.status(401).json({ error: "Invalid credentials (no password set)" });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Return user info
        res.json({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role || 'user'
            }
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    } finally {
        if (conn) conn.release();
    }
});

// POST Create New Admin
app.post('/auth/create-admin', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { requester_id, email, password, full_name } = req.body;

        // 1. Verify Requester is Admin
        const adminCheck = await conn.query(
            "SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'",
            [requester_id]
        );

        if (adminCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Only admins can create new admins." });
        }

        // 2. Create New Admin in 'users' table
        const existing = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ error: "Email exists" });

        const id = crypto.randomUUID();
        const hash = await bcrypt.hash(password, 10);

        await conn.beginTransaction();

        await conn.query(
            "INSERT INTO users (id, email, full_name, password_hash) VALUES (?, ?, ?, ?)",
            [id, email, full_name, hash]
        );

        await conn.query(
            "INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), ?, 'admin')",
            [id]
        );

        await conn.commit();

        res.json({ message: "New Admin created successfully" });

    } catch (err: any) {
        if (conn) await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// ==========================================
// USER MANAGEMENT ROUTES (Admin)
// ==========================================

// GET All Users
app.get('/users', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Join users with user_roles to get the role
        const query = `
      SELECT u.id, u.email, u.full_name, u.created_at, ur.role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role <> 'superadmin'
      ORDER BY u.created_at DESC
    `;
        const rows = await conn.query(query);
        const users = rows.slice(0, rows.length);
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
});

// PUT / UPDATE  User Role
app.put('/users/:id/role', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { role } = req.body; // 'admin' or 'user'
        const userId = req.params.id;

        // Using ON DUPLICATE KEY UPDATE logic just in case, though usually row exists
        await conn.query(
            `INSERT INTO user_roles (id, user_id, role) 
                VALUES (UUID(), ?, ?) 
                ON DUPLICATE KEY UPDATE role = ?`,
            [userId, role, role]
        );

        res.json({ message: 'User role updated' });
    } catch (err: any) {
        console.error("Error updating role:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// UPDATE  User Role
app.patch('/users/:id/role', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("conn " + conn);
        const { role } = req.body; // 'admin' or 'user'
        const userId = req.params.id;

        // Validation
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        await conn.query(
            `UPDATE user_roles set role = ? WHERE user_id = ?`,
            [role, userId]
        );

        res.json({ message: 'SUCCESS' });
    } catch (err: any) {
        console.error("Error updating role:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

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
      SELECT oi.*, p.name as product_name, p.sku as product_sku, p.stock_quantity
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
            approved_quantity: row.approved_quantity, // This is the APPROVED quantity
            approval_status: row.approval_status,
            price: row.price,
            created_at: row.created_at,
            products: { // Nested object required by Dashboard.tsx
                name: row.product_name,
                sku: row.product_sku,
                stock_quantity: row.stock_quantity
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

// POST Approve Order (Handles Partial Approval & Restocking)
app.post('/orders/:id/approve', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const orderId = req.params.id;
        const { itemApprovals, status, approved_by, new_total } = req.body;

        // 1. Update Order Status
        await conn.query(
            `UPDATE orders
             SET status = ?, total_amount = ?, approved_by = ?, approved_at = NOW()
             WHERE id = ?`,
            [status, new_total, approved_by, orderId]
        );

        // 2. Process Items
        // We need to compare the APPROVED qty against the REQUESTED qty (original 'quantity')
        const originalItems = await conn.query("SELECT id, product_id, quantity FROM order_items WHERE order_id = ?", [orderId]);

        for (const approval of itemApprovals) {
            const originalItem = originalItems.find((i: any) => i.id === approval.order_item_id);

            if (originalItem) {
                // Calculate Restock: If they asked for 10, and we approve 8, we return 2 to stock.
                // If we reject all (approve 0), we return 10 to stock.
                const restockAmount = originalItem.quantity - approval.approved_quantity;

                if (restockAmount > 0) {
                    await conn.query(
                        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
                        [restockAmount, originalItem.product_id]
                    );
                }

                // Determine Item Status
                let itemStatus = 'processing';
                if (approval.approved_quantity === 0) itemStatus = 'rejected';
                else if (approval.approved_quantity < originalItem.quantity) itemStatus = 'partial';

                // Update the order_items table with specific columns
                // NOTE: We do NOT change 'quantity' anymore, we update 'approved_quantity'
                await conn.query(
                    `UPDATE order_items 
           SET approved_quantity = ?, approval_status = ? 
           WHERE id = ?`,
                    [approval.approved_quantity, itemStatus, approval.order_item_id]
                );
            }
        }

        await conn.commit();
        res.json({ success: true, new_total });

    } catch (err: any) {
        if (conn) await conn.rollback();
        console.error("Approval failed:", err);
        res.status(500).json({ error: err.message });
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


// ==========================================
// 4. Image Upload
// ==========================================
app.post('/upload', upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the public URL
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({ url: fileUrl });
});

// ==========================================
// 5. Audit Trail
// ==========================================
app.put('/audit', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // await conn.beginTransaction();
        const { query, action, table, userId } = req.body;

        let desc = action;

        if (query === 'UPDATE') {
            const {
                oldValue: oldValue,
                newValue: newValue,
                userId: userId
            } = action;
            desc = userId + ',' + oldValue + ',' + newValue;
        }
        console.log(">>>>> " + JSON.stringify(req.body));
        await conn.query(
            `INSERT INTO audit (trans_type, trans_table, trans_action, transaction_by)
             VALUES (?, ?, ?, ?)`,
            [query, table, desc, userId]
        );
        // await conn.commit();
        res.status(201);
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