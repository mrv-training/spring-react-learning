-- Initialize default users
-- Password for both users: password123
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$nXRdETQFW/0qMp8YZ1fecO6VM/mf54WDAkvWb.NZIC0J77qaw3GCG', 'ADMIN'),
('user', '$2a$10$nXRdETQFW/0qMp8YZ1fecO6VM/mf54WDAkvWb.NZIC0J77qaw3GCG', 'USER');

INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Accessories', 'Mice, chargers, stands, and everyday extras', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Computers', 'Laptops, docks, and displays', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Audio', 'Headphones, speakers, and microphones', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Storage', 'Drives, cards, and portable storage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cables', 'HDMI, USB, and cable management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Furniture', 'Desks, chairs, and workspace furniture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bags', 'Sleeves, cases, and carrying bags', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (name, sku, description, price, stock, category_id, image_url, created_at, updated_at) VALUES
('Wireless Mouse', 'PRD-1001', 'Ergonomic 2.4GHz wireless mouse', 19.99, 120, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-1001/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB-C Hub', 'PRD-1002', '7-in-1 USB-C hub with HDMI', 49.50, 45, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-1002/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Notebook 14"', 'PRD-2001', '14-inch laptop for daily work', 899.00, 18, (SELECT id FROM categories WHERE name = 'Computers'), 'https://picsum.photos/seed/PRD-2001/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mechanical Keyboard', 'PRD-1003', 'Hot-swappable mechanical keyboard', 79.00, 60, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-1003/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HD Webcam', 'PRD-3001', '1080p webcam for meetings', 59.00, 80, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3001/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('27" Monitor', 'PRD-3002', '27-inch IPS monitor', 249.00, 22, (SELECT id FROM categories WHERE name = 'Computers'), 'https://picsum.photos/seed/PRD-3002/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Noise Headphones', 'PRD-3003', 'Over-ear wireless headphones', 129.00, 35, (SELECT id FROM categories WHERE name = 'Audio'), 'https://picsum.photos/seed/PRD-3003/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB Drive 128GB', 'PRD-3004', 'USB 3.2 flash drive', 18.50, 200, (SELECT id FROM categories WHERE name = 'Storage'), 'https://picsum.photos/seed/PRD-3004/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Phone Stand', 'PRD-3005', 'Adjustable aluminum phone stand', 15.00, 150, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3005/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HDMI Cable 2m', 'PRD-3006', 'High-speed HDMI 2.1 cable', 12.90, 300, (SELECT id FROM categories WHERE name = 'Cables'), 'https://picsum.photos/seed/PRD-3006/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Desk Chair', 'PRD-3007', 'Ergonomic mesh office chair', 189.00, 12, (SELECT id FROM categories WHERE name = 'Furniture'), 'https://picsum.photos/seed/PRD-3007/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('External SSD 1TB', 'PRD-3008', 'Portable USB-C SSD', 109.00, 40, (SELECT id FROM categories WHERE name = 'Storage'), 'https://picsum.photos/seed/PRD-3008/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Wireless Charger', 'PRD-3009', '15W Qi wireless charging pad', 24.00, 90, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3009/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laptop Sleeve 14"', 'PRD-3010', 'Padded neoprene laptop sleeve', 22.00, 70, (SELECT id FROM categories WHERE name = 'Bags'), 'https://picsum.photos/seed/PRD-3010/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bluetooth Speaker', 'PRD-3011', 'Portable waterproof speaker', 45.00, 55, (SELECT id FROM categories WHERE name = 'Audio'), 'https://picsum.photos/seed/PRD-3011/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB Microphone', 'PRD-3012', 'Cardioid USB condenser microphone', 69.00, 28, (SELECT id FROM categories WHERE name = 'Audio'), 'https://picsum.photos/seed/PRD-3012/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LED Desk Lamp', 'PRD-3013', 'Dimmable LED lamp with USB port', 32.00, 64, (SELECT id FROM categories WHERE name = 'Furniture'), 'https://picsum.photos/seed/PRD-3013/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Wireless Earbuds', 'PRD-3014', 'In-ear earbuds with charging case', 89.00, 48, (SELECT id FROM categories WHERE name = 'Audio'), 'https://picsum.photos/seed/PRD-3014/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laptop Stand', 'PRD-3015', 'Aluminum riser for 13-16 inch laptops', 39.00, 75, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3015/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4K HDMI Adapter', 'PRD-3016', 'USB-C to HDMI 4K adapter', 27.50, 110, (SELECT id FROM categories WHERE name = 'Cables'), 'https://picsum.photos/seed/PRD-3016/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Gaming Mousepad', 'PRD-3017', 'XL stitched-edge mousepad', 16.00, 140, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3017/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Power Bank 20k', 'PRD-3018', '20000mAh USB-C power bank', 42.00, 33, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3018/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Webcam Tripod', 'PRD-3019', 'Flexible mini tripod for webcams', 14.50, 88, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3019/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB-C Cable 1m', 'PRD-3020', 'Braided USB-C charging cable', 9.90, 250, (SELECT id FROM categories WHERE name = 'Cables'), 'https://picsum.photos/seed/PRD-3020/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Monitor Arm', 'PRD-3021', 'Single gas-spring monitor mount', 59.00, 26, (SELECT id FROM categories WHERE name = 'Furniture'), 'https://picsum.photos/seed/PRD-3021/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Wireless Presenter', 'PRD-3022', 'USB presenter with laser pointer', 21.00, 40, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3022/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laptop Dock', 'PRD-3023', 'Dual-display USB-C docking station', 159.00, 15, (SELECT id FROM categories WHERE name = 'Computers'), 'https://picsum.photos/seed/PRD-3023/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Keyboard Wrist Rest', 'PRD-3024', 'Memory-foam wrist rest', 13.50, 95, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3024/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Portable Monitor', 'PRD-3025', '15.6-inch USB-C portable screen', 179.00, 19, (SELECT id FROM categories WHERE name = 'Computers'), 'https://picsum.photos/seed/PRD-3025/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Desk Organizer', 'PRD-3026', 'Wood desktop organizer tray', 28.00, 52, (SELECT id FROM categories WHERE name = 'Furniture'), 'https://picsum.photos/seed/PRD-3026/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Streaming Light', 'PRD-3027', '10-inch ring light with stand', 36.00, 31, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3027/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SD Card 256GB', 'PRD-3028', 'UHS-I V30 microSD card', 29.00, 120, (SELECT id FROM categories WHERE name = 'Storage'), 'https://picsum.photos/seed/PRD-3028/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cable Sleeve', 'PRD-3029', '1.5m cord management sleeve', 8.50, 180, (SELECT id FROM categories WHERE name = 'Cables'), 'https://picsum.photos/seed/PRD-3029/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Footrest', 'PRD-3030', 'Adjustable under-desk footrest', 34.00, 24, (SELECT id FROM categories WHERE name = 'Furniture'), 'https://picsum.photos/seed/PRD-3030/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB Hub 4-port', 'PRD-3031', 'Powered 4-port USB 3.0 hub', 23.00, 67, (SELECT id FROM categories WHERE name = 'Accessories'), 'https://picsum.photos/seed/PRD-3031/400/400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
