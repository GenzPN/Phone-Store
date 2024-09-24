import json
import mysql.connector
from mysql.connector import Error
from importlib.metadata import distributions

# Đọc dữ liệu từ productDetails.json
with open('productDetails.json', 'r', encoding='utf-8') as file:
    product_details_data = json.load(file)

def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='phone_store',
            user='root',
            password=''
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

def create_requirements_file():
    try:
        installed_packages = distributions()
        installed_packages_list = sorted([f"{dist.metadata['Name']}=={dist.version}" for dist in installed_packages])
        
        with open('requirements.txt', 'w') as f:
            for package in installed_packages_list:
                f.write(f"{package}\n")
        print("requirements.txt file created successfully.")
    except Exception as e:
        print(f"Error creating requirements.txt: {e}")

def insert_product_from_phonedetails(cursor, product):
    sql = """
    INSERT INTO Products (
        title, description, price, stock, brand, thumbnail, images,
        screen, back_camera, front_camera, ram, storage, battery,
        category, sku, warranty_information, shipping_information,
        availability_status, return_policy, minimum_order_quantity,
        discount_percentage, is_featured, featured_sort_order
    )
    VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    price = VALUES(price),
    stock = VALUES(stock),
    brand = VALUES(brand),
    thumbnail = VALUES(thumbnail),
    images = VALUES(images),
    screen = VALUES(screen),
    back_camera = VALUES(back_camera),
    front_camera = VALUES(front_camera),
    ram = VALUES(ram),
    storage = VALUES(storage),
    battery = VALUES(battery),
    category = VALUES(category),
    sku = VALUES(sku),
    warranty_information = VALUES(warranty_information),
    shipping_information = VALUES(shipping_information),
    availability_status = VALUES(availability_status),
    return_policy = VALUES(return_policy),
    minimum_order_quantity = VALUES(minimum_order_quantity),
    discount_percentage = VALUES(discount_percentage),
    is_featured = VALUES(is_featured),
    featured_sort_order = VALUES(featured_sort_order)
    """
    
    # Lấy thông tin chi tiết sản phẩm từ productDetails.json
    product_details = product_details_data.get(product['title'], [])
    details_dict = {item['label']: item['value'] for item in product_details}
    
    values = (
        product['title'],
        product.get('description', ''),
        product.get('price', 0),
        product.get('stock', 0),
        product.get('brand', ''),
        product.get('thumbnail', ''),
        json.dumps(product.get('images', [])),
        details_dict.get('Màn hình', ''),
        details_dict.get('Camera sau', ''),
        details_dict.get('Camera Selfie', ''),
        details_dict.get('RAM', ''),
        details_dict.get('Bộ nhớ trong', ''),
        details_dict.get('Pin', ''),
        product.get('category', ''),
        product.get('sku', ''),
        product.get('warrantyInformation', ''),
        product.get('shippingInformation', ''),
        product.get('availabilityStatus', ''),
        product.get('returnPolicy', ''),
        product.get('minimumOrderQuantity', 1),
        product.get('discountPercentage', 0),
        product.get('is_featured', False),
        product.get('featured_sort_order', 0)
    )
    cursor.execute(sql, values)

def insert_user(connection, user):
    try:
        cursor = connection.cursor()
        query = """INSERT INTO Users 
                   (username, email, password, fullName, gender, image, isAdmin) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        values = (user['username'], user['email'], user['password'],
                  user['fullName'], user.get('gender'), user.get('image'),
                  user.get('isAdmin', False))
        cursor.execute(query, values)
        connection.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error inserting user: {e}")
        connection.rollback()
        return None

def insert_product_reviews(connection, product_id, reviews):
    try:
        cursor = connection.cursor()
        for review in reviews:
            query = """INSERT INTO ProductReviews 
                       (product_id, user_id, rating, comment, reviewer_name) 
                       VALUES (%s, NULL, %s, %s, %s)"""
            values = (product_id, review['rating'], review['comment'], review.get('username', 'Anonymous'))
            cursor.execute(query, values)
        connection.commit()
        print(f"Inserted {len(reviews)} reviews for product ID: {product_id}")
    except Error as e:
        print(f"Error inserting product reviews: {e}")
        connection.rollback()

def insert_user_address(connection, address):
    try:
        cursor = connection.cursor()
        query = """INSERT INTO UserAddresses 
                   (user_id, fullName, phone, address, is_default, address_type, company_name) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        values = (address['user_id'], address['fullName'], address['phone'],
                  address['address'], address['is_default'], address['address_type'],
                  address.get('company_name'))
        cursor.execute(query, values)
        connection.commit()
        print(f"Inserted address for user ID: {address['user_id']}")
    except Error as e:
        print(f"Error inserting user address: {e}")
        connection.rollback()

def insert_order(connection, order):
    try:
        cursor = connection.cursor()
        query = """INSERT INTO Orders 
                   (user_id, address_id, total_amount, status, note, created_at) 
                   VALUES (%s, %s, %s, %s, %s, %s)"""
        values = (order['user_id'], order['address_id'], order['total_amount'],
                  order['status'], order['note'], order['created_at'])
        cursor.execute(query, values)
        order_id = cursor.lastrowid

        for item in order['order_items']:
            item_query = """INSERT INTO OrderItems 
                            (order_id, product_id, quantity, price) 
                            VALUES (%s, %s, %s, %s)"""
            item_values = (order_id, item['product_id'], item['quantity'], item['price'])
            cursor.execute(item_query, item_values)

        payment_query = """INSERT INTO Payments 
                           (order_id, amount, payment_method, status, transaction_id, created_at) 
                           VALUES (%s, %s, %s, %s, %s, %s)"""
        payment_values = (order_id, order['payment']['amount'], order['payment']['payment_method'],
                          order['payment']['status'], order['payment']['transaction_id'],
                          order['payment']['created_at'])
        cursor.execute(payment_query, payment_values)

        connection.commit()
        print(f"Inserted order ID: {order_id} for user ID: {order['user_id']}")
    except Error as e:
        print(f"Error inserting order: {e}")
        connection.rollback()

def main():
    create_requirements_file()

    connection = create_connection()
    if connection is None:
        return

    cursor = connection.cursor()

    # Đọc và xử lý dữ liệu từ phoneDetails.json
    with open('phoneDetails.json', 'r', encoding='utf-8') as file:
        phone_data = json.load(file)
        for product in phone_data['products']:
            insert_product_from_phonedetails(cursor, product)
            print(f"Inserted/Updated product: {product['title']}")

    # Đọc và xử lý dữ liệu người dùng từ sample_users.json
    with open('sample_users.json', 'r', encoding='utf-8') as file:
        user_data = json.load(file)
        for user in user_data['users']:
            user_id = insert_user(connection, user)
            if user_id:
                print(f"Inserted user: {user['username']}")

    # Đọc và xử lý dữ liệu từ productReviews.json
    with open('productReviews.json', 'r', encoding='utf-8') as file:
        product_reviews = json.load(file)
        for product_name, reviews in product_reviews.items():
            cursor.execute("SELECT id FROM Products WHERE title = %s", (product_name,))
            result = cursor.fetchone()
            if result:
                product_id = result[0]
                insert_product_reviews(connection, product_id, reviews)
                print(f"Inserted reviews for product: {product_name}")

    # Đọc và xử lý dữ liệu địa chỉ người dùng từ address.json
    with open('address.json', 'r', encoding='utf-8') as file:
        address_data = json.load(file)
        for address in address_data['user_addresses']:
            insert_user_address(connection, address)

    # Đọc và xử lý dữ liệu đơn hàng từ order.json
    with open('order.json', 'r', encoding='utf-8') as file:
        order_data = json.load(file)
        for order in order_data['orders']:
            insert_order(connection, order)

    connection.commit()
    connection.close()

if __name__ == "__main__":
    main()