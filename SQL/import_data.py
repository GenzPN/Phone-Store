import json
import mysql.connector
from mysql.connector import Error
import pkg_resources

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
        installed_packages = pkg_resources.working_set
        installed_packages_list = sorted([f"{i.key}=={i.version}" for i in installed_packages])
        
        with open('requirements.txt', 'w') as f:
            for package in installed_packages_list:
                f.write(f"{package}\n")
        print("requirements.txt file created successfully.")
    except Exception as e:
        print(f"Error creating requirements.txt: {e}")

def insert_product_from_phonedetails(cursor, product):
    sql = """
    INSERT INTO Products (
        id, title, description, price, stock, brand, thumbnail, images,
        category, sku, warranty_information, shipping_information,
        availability_status, return_policy, minimum_order_quantity,
        discount_percentage, is_featured, featured_sort_order
    )
    VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    price = VALUES(price),
    stock = VALUES(stock),
    brand = VALUES(brand),
    thumbnail = VALUES(thumbnail),
    images = VALUES(images),
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
    values = (
        product['id'],
        product['title'],
        product['description'],
        product['price'],
        product['stock'],
        product['brand'],
        product['thumbnail'],
        json.dumps(product['images']),
        product['category'],
        product['sku'],
        product['warrantyInformation'],
        product['shippingInformation'],
        product['availabilityStatus'],
        product['returnPolicy'],
        product['minimumOrderQuantity'],
        product['discountPercentage'],
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

    connection.commit()
    connection.close()

if __name__ == "__main__":
    main()