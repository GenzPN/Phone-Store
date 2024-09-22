-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS phone_store;
USE phone_store;

-- Bảng Users
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(150),
    gender ENUM('male', 'female', 'other'),
    image VARCHAR(255),
    isAdmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Bảng UserAddresses
CREATE TABLE UserAddresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fullName VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    address_type ENUM('home', 'company') DEFAULT 'home',
    company_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB;

-- Bảng Products
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INT,
    stock INT,
    brand VARCHAR(100),
    thumbnail VARCHAR(255),
    INDEX idx_brand (brand),
    INDEX idx_price (price)
) ENGINE=InnoDB;

-- Bảng Cart
CREATE TABLE Cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng Orders
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_id INT,
    total_amount INT,
    status ENUM('pending', 'paid', 'shipped', 'delivered') DEFAULT 'pending',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES UserAddresses(id) ON DELETE SET NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Bảng OrderItems
CREATE TABLE OrderItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price INT,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng Payments
CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    amount INT,
    payment_method ENUM('bank_transfer', 'momo', 'cod') DEFAULT 'cod',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Bảng ProductDetails
CREATE TABLE ProductDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    category VARCHAR(100),
    label VARCHAR(100),
    value TEXT,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng ProductReviews
CREATE TABLE ProductReviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Bảng PaymentGateways
CREATE TABLE PaymentGateways (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_method ENUM('bank_transfer', 'momo', 'cod') UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    config JSON,
    handling_fee_fixed DECIMAL(10, 2) DEFAULT 0,
    handling_fee_percent DECIMAL(5, 2) DEFAULT 0,
    enable BOOLEAN DEFAULT TRUE,
    sort INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_method (payment_method),
    INDEX idx_enable (enable),
    INDEX idx_sort (sort)
) ENGINE=InnoDB;