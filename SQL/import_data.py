import json
import mysql.connector
from mysql.connector import Error

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
            # Trước tiên, tìm user_id dựa trên username
            user_query = "SELECT id FROM Users WHERE username = %s"
            cursor.execute(user_query, (review['user'],))
            user_result = cursor.fetchone()
            
            if user_result:
                user_id = user_result[0]
            else:
                # Nếu không tìm thấy user, tạo một user mới
                insert_user_query = "INSERT INTO Users (username, email, password) VALUES (%s, %s, %s)"
                cursor.execute(insert_user_query, (review['user'], f"{review['user']}@example.com", "defaultpassword"))
                connection.commit()
                user_id = cursor.lastrowid

            query = """INSERT INTO ProductReviews 
                       (product_id, user_id, rating, comment) 
                       VALUES (%s, %s, %s, %s)"""
            values = (product_id, user_id, review['rating'], review['comment'])
            cursor.execute(query, values)
        connection.commit()
    except Error as e:
        print(f"Error inserting product reviews: {e}")
        connection.rollback()

def insert_user(connection, user):
    try:
        cursor = connection.cursor()
        query = """INSERT INTO Users 
                   (username, email, password, firstName, lastName, gender, image, isAdmin) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
        values = (user['username'], user['email'], user['password'],
                  user.get('firstName'), user.get('lastName'), user.get('gender'),
                  user.get('image'), user.get('isAdmin', False))
        cursor.execute(query, values)
        connection.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error inserting user: {e}")
        connection.rollback()
        return None

def main():
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
            # Tìm product_id dựa trên tên sản phẩm
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM Products WHERE title = %s", (product_name,))
            result = cursor.fetchone()
            if result:
                product_id = result[0]
                insert_product_details(connection, product_id, details)
                print(f"Inserted details for product: {product_name}")

    # Đọc và xử lý dữ liệu từ productReviews.json
    with open('productReviews.json', 'r', encoding='utf-8') as file:
        product_reviews = json.load(file)
        for product_name, reviews in product_reviews.items():
            # Tìm product_id dựa trên tên sản phẩm
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