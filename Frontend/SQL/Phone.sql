-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS phone_store;
USE phone_store;

-- Bảng Products
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    stock INT,
    brand VARCHAR(100),
    thumbnail VARCHAR(255)
) ENGINE=InnoDB;

-- Bảng Cart
CREATE TABLE Cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng Orders
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    total_amount DECIMAL(10, 2),
    status ENUM('pending', 'paid', 'shipped', 'delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng OrderItems
CREATE TABLE OrderItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng Payments
CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    amount DECIMAL(10, 2),
    payment_method ENUM('bank_transfer', 'momo', 'cash'),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Thêm index cho các trường thường được sử dụng trong tìm kiếm và sắp xếp
ALTER TABLE Products ADD INDEX idx_brand (brand);
ALTER TABLE Products ADD INDEX idx_price (price);
ALTER TABLE Orders ADD INDEX idx_customer_email (customer_email);
ALTER TABLE Orders ADD INDEX idx_status (status);
ALTER TABLE Payments ADD INDEX idx_status (status);