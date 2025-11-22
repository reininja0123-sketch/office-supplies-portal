INSERT IGNORE INTO storage_buckets (
    id, name, is_public, file_size_limit, allowed_mime_types
) VALUES (
    'product-images',
    'product-images',
    1,
    5242880,
    'image/jpeg,image/jpg,image/png,image/webp'
);