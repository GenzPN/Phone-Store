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

def insert_product(connection, product):
    try:
        cursor = connection.cursor()
        query = """INSERT INTO Products 
                   (title, description, price, stock, brand, thumbnail) 
                   VALUES (%s, %s, %s, %s, %s, %s)"""
        values = (product['title'], product['description'], product['price'],
                  product.get('stock', 0), product['brand'], product['thumbnail'])
        cursor.execute(query, values)
        connection.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error inserting product: {e}")
        connection.rollback()
        return None

def insert_product_details(connection, product_id, details):
    try:
        cursor = connection.cursor()
        for category in details:
            for item in category['items']:
                query = """INSERT INTO ProductDetails 
                           (product_id, category, label, value) 
                           VALUES (%s, %s, %s, %s)"""
                values = (product_id, category['category'], item['label'], item['value'])
                cursor.execute(query, values)
        connection.commit()
    except Error as e:
        print(f"Error inserting product details: {e}")
        connection.rollback()

def insert_product_reviews(connection, product_id, reviews):
    try:
        cursor = connection.cursor()
        for review in reviews:
            query = """INSERT INTO ProductReviews 
                       (product_id, user_id, rating, comment) 
                       VALUES (%s, %s, %s, %s)"""
            values = (product_id, review['user_id'], review['rating'], review['comment'])
            cursor.execute(query, values)
        connection.commit()
        print(f"Inserted {len(reviews)} reviews for product ID: {product_id}")
    except Error as e:
        print(f"Error inserting product reviews: {e}")
        connection.rollback()

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

def insert_product_ratings(connection, product_id, ratings):
    try:
        cursor = connection.cursor()
        for rating in ratings:
            query = """INSERT INTO ProductRatings 
                       (product_id, name, rating, comment) 
                       VALUES (%s, %s, %s, %s)"""
            values = (product_id, rating['name'], rating['rating'], rating['comment'])
            cursor.execute(query, values)
        connection.commit()
    except Error as e:
        print(f"Error inserting product ratings: {e}")
        connection.rollback()

def main():
    create_requirements_file()

    connection = create_connection()
    if connection is None:
        return

    # Đọc và xử lý dữ liệu người dùng từ sample_users.json
    with open('sample_users.json', 'r', encoding='utf-8') as file:
        user_data = json.load(file)
        for user in user_data['users']:
            user_id = insert_user(connection, user)
            if user_id:
                print(f"Inserted user: {user['username']}")

    # Đọc và xử lý dữ liệu từ phoneDetails.json
    with open('phoneDetails.json', 'r', encoding='utf-8') as file:
        phone_data = json.load(file)
        for product in phone_data['products']:
            product_id = insert_product(connection, product)
            if product_id:
                print(f"Inserted product: {product['title']}")

    # Đọc và xử lý dữ liệu từ productDetails.json
    with open('productDetails.json', 'r', encoding='utf-8') as file:
        product_details = json.load(file)
        for product_name, details in product_details.items():
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM Products WHERE title = %s", (product_name,))
            result = cursor.fetchone()
            if result:
                product_id = result[0]
                insert_product_details(connection, product_id, details)
                print(f"Inserted details for product: {product_name}")

    # Thay đổi tên file từ 'productRatings.json' thành 'productReviews.json'
    with open('productReviews.json', 'r', encoding='utf-8') as file:
        product_reviews = json.load(file)
        for product_name, reviews in product_reviews.items():
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM Products WHERE title = %s", (product_name,))
            result = cursor.fetchone()
            if result:
                product_id = result[0]
                insert_product_reviews(connection, product_id, reviews)
                print(f"Inserted reviews for product: {product_name}")

    connection.close()

if __name__ == "__main__":
    main()