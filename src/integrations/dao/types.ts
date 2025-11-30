export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type AppRole = "admin" | "user";

export interface Category {
    id: string;
    name: string;
    description: string | null;
    created_at: Date | null;
}

export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    created_at: Date | null;
}

export interface Product {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price: number; // In JS this is number, in DB it is Decimal
    stock_quantity: number;
    low_stock_threshold: number;
    sku: string;
    image_url: string | null;
    created_at: Date | null;
    updated_at: Date | null;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    variant_type: string;
    variant_value: string;
    sku: string | null;
    stock_quantity: number;
    price_adjustment: number | null;
    created_at: Date | null;
    updated_at: Date | null;
}

export interface Order {
    id: string;
    user_id: string | null;
    user_email: string;
    user_name: string;
    user_phone: string | null;
    status: string;
    total_amount: number;
    approved_at: Date | null;
    approved_by: string | null;
    created_at: Date | null;
}

export interface OrderItem {
    id: string;
    order_id: string | null;
    product_id: string | null;
    quantity: number;
    price: number;
    created_at: Date | null;
}

export interface UserRole {
    id: string;
    user_id: string;
    role: AppRole;
}

export interface LowStockProduct {
    product_id: string;
    product_name: string;
    current_stock: number;
    threshold: number;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: "admin" | "user";
    created_at: string;
}
