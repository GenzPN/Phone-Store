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
            password=''  # Thêm mật khẩu của bạn vào đây
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
    query = """
    INSERT INTO Products (
        title, description, category, price, stock, brand, sku, 
        warranty_information, shipping_information, availability_status, return_policy, 
        minimum_order_quantity, thumbnail, is_featured, featured_sort_order,
        discount_percentage, images, screen, back_camera, front_camera, ram, storage, battery
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    price = VALUES(price),
    stock = VALUES(stock),
    warranty_information = VALUES(warranty_information),
    shipping_information = VALUES(shipping_information),
    availability_status = VALUES(availability_status),
    return_policy = VALUES(return_policy),
    minimum_order_quantity = VALUES(minimum_order_quantity),
    thumbnail = VALUES(thumbnail),
    is_featured = VALUES(is_featured),
    featured_sort_order = VALUES(featured_sort_order),
    discount_percentage = VALUES(discount_percentage),
    images = VALUES(images),
    screen = VALUES(screen),
    back_camera = VALUES(back_camera),
    front_camera = VALUES(front_camera),
    ram = VALUES(ram),
    storage = VALUES(storage),
    battery = VALUES(battery)
    """
    values = (
        product['title'],
        product['description'],
        product['category'],
        product['price'],
        product['stock'],
        product['brand'],
        product['sku'],
        product['warrantyInformation'],
        product['shippingInformation'],
        product['availabilityStatus'],
        product['returnPolicy'],
        product['minimumOrderQuantity'],
        product['thumbnail'],
        product.get('is_featured', False),
        product.get('featured_sort_order', 0),
        product.get('discountPercentage', 0),
        json.dumps(product['images']),
        product.get('screen', ''),
        product.get('back_camera', ''),
        product.get('front_camera', ''),
        product.get('ram', ''),
        product.get('storage', ''),
        product.get('battery', '')
    )
    cursor.execute(query, values)
    return cursor.lastrowid

# Thêm hàm mới để chèn hình ảnh sản phẩm
def insert_product_images(cursor, product_id, images):
    query = """
    INSERT INTO ProductImages (product_id, image_url) 
    VALUES (%s, %s)
    ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)
    """
    for image_url in images:
        cursor.execute(query, (product_id, image_url))

def insert_or_update_user(connection, user):
    try:
        cursor = connection.cursor()
        query = """INSERT INTO Users 
                   (username, email, password, fullName, gender, image, isAdmin) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE
                   email = VALUES(email),
                   password = VALUES(password),
                   fullName = VALUES(fullName),
                   gender = VALUES(gender),
                   image = VALUES(image),
                   isAdmin = VALUES(isAdmin)"""
        values = (user['username'], user['email'], user['password'],
                  user['fullName'], user.get('gender'), user.get('image'),
                  user.get('isAdmin', False))
        cursor.execute(query, values)
        connection.commit()
        print(f"Inserted/Updated user: {user['username']}")
    except Error as e:
        print(f"Error inserting/updating user: {e}")
        connection.rollback()

def insert_product_reviews(connection, product_id, reviews):
    try:
        cursor = connection.cursor()
        for review in reviews:
            query = """INSERT INTO ProductReviews 
                       (product_id, user_id, rating, comment, reviewer_name) 
                       VALUES (%s, %s, %s, %s, %s)
                       ON DUPLICATE KEY UPDATE
                       rating = VALUES(rating),
                       comment = VALUES(comment)"""
            cursor.execute(query, (product_id, None, review['rating'], review['comment'], review['user']))
        connection.commit()
        cursor.close()
    except Error as e:
        print(f"Error inserting product reviews: {e}")
        connection.rollback()
    finally:
        # Ensure the cursor is closed
        if cursor:
            cursor.close()

def insert_user_address(connection, address):
    try:
        cursor = connection.cursor()
        query = """INSERT INTO UserAddresses 
                   (user_id, full_name, phone, address, city, is_default) 
                   VALUES (%s, %s, %s, %s, %s, %s)"""
        values = (address['user_id'], address['fullName'], address['phone'],
                  address['address'], address.get('city', 'Default City'), address['is_default'])
        cursor.execute(query, values)
        connection.commit()
        print(f"Inserted address for user ID: {address['user_id']}")
    except Error as e:
        print(f"Error inserting user address: {e}")
        connection.rollback()

def insert_order(connection, order):
    try:
        cursor = connection.cursor()
        
        # Kiểm tra xem tất cả product_id có tồn tại trong bảng Products không
        for item in order['order_items']:
            cursor.execute("SELECT id FROM Products WHERE id = %s", (item['product_id'],))
            if not cursor.fetchone():
                print(f"Product with id {item['product_id']} does not exist. Skipping order.")
                return

        # Tiếp tục với việc chèn đơn hàng nếu tất cả product_id đều hợp lệ
        query = """INSERT INTO Orders 
                   (user_id, shipping_address_id, total_amount, status, note, created_at,
                   transaction_id, payment_method, payment_status) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        values = (order['user_id'], order['address_id'], order['total_amount'],
                  order['status'], order.get('note'), order['created_at'],
                  order['payment']['transaction_id'], order['payment']['payment_method'],
                  order['payment']['status'])
        cursor.execute(query, values)
        order_id = cursor.lastrowid

        for item in order['order_items']:
            item_query = """INSERT INTO OrderItems 
                            (order_id, product_id, quantity, price) 
                            VALUES (%s, %s, %s, %s)"""
            item_values = (order_id, item['product_id'], item['quantity'], item['price'])
            cursor.execute(item_query, item_values)

        connection.commit()
        print(f"Inserted order ID: {order_id} for user ID: {order['user_id']}")
    except Error as e:
        print(f"Error inserting order: {e}")
        connection.rollback()

def main():
    connection = create_connection()
    if connection is None:
        return

    try:
        cursor = connection.cursor()

        # Đọc và xử lý dữ liệu từ phoneDetails.json
        with open('phoneDetails.json', 'r', encoding='utf-8') as file:
            phone_data = json.load(file)
            for product in phone_data['products']:
                # Đọc thông tin chi tiết từ productDetails.json
                try:
                    with open('productDetails.json', 'r', encoding='utf-8') as details_file:
                        product_details = json.load(details_file)
                    if product['title'] in product_details:
                        details = product_details[product['title']]
                        product['screen'] = next((detail['value'] for detail in details if detail['label'] == 'Màn hình'), '')
                        product['back_camera'] = next((detail['value'] for detail in details if detail['label'] == 'Camera sau'), '')
                        product['front_camera'] = next((detail['value'] for detail in details if detail['label'] == 'Camera Selfie'), '')
                        product['ram'] = next((detail['value'] for detail in details if detail['label'] == 'RAM'), '')
                        product['storage'] = next((detail['value'] for detail in details if detail['label'] == 'Bộ nhớ trong'), '')
                        product['battery'] = next((detail['value'] for detail in details if detail['label'] == 'Pin'), '')
                except FileNotFoundError:
                    print("productDetails.json not found. Skipping product details.")
                except json.JSONDecodeError:
                    print("Error decoding productDetails.json. File may be empty or invalid. Skipping product details.")

                product_id = insert_product_from_phonedetails(cursor, product)
                print(f"Inserted/Updated product: {product['title']}")

        # Đọc và xử lý dữ liệu người dùng từ sample_users.json
        with open('sample_users.json', 'r', encoding='utf-8') as file:
            user_data = json.load(file)
            for user in user_data['users']:
                insert_or_update_user(connection, user)

        # Đọc và xử lý dữ liệu đánh giá sản phẩm từ productReviews.json
        with open('productReviews.json', 'r', encoding='utf-8') as file:
            review_data = json.load(file)
            for product_name, reviews in review_data.items():
                cursor.execute("SELECT id FROM Products WHERE title = %s", (product_name,))
                result = cursor.fetchone()
                if result:
                    product_id = result[0]
                    insert_product_reviews(connection, product_id, reviews)
                    print(f"Inserted reviews for product: {product_name}")

        # Đọc và xử lý dữ liệu địa chỉ người dùng từ address.json (nếu có)
        try:
            with open('address.json', 'r', encoding='utf-8') as file:
                address_data = json.load(file)
                for address in address_data['user_addresses']:
                    insert_user_address(connection, address)
        except FileNotFoundError:
            print("address.json not found. Skipping address import.")

        # Đọc và xử lý dữ liệu đơn hàng từ order.json (nếu có)
        try:
            with open('order.json', 'r', encoding='utf-8') as file:
                order_data = json.load(file)
                for order in order_data['orders']:
                    insert_order(connection, order)
        except FileNotFoundError:
            print("order.json not found. Skipping order import.")
        except Error as e:
            print(f"Error processing orders: {e}")

        connection.commit()
        print("Data import completed successfully.")
    except Error as e:
        print(f"Error in main function: {e}")
    finally:
        if connection.is_connected():
            connection.close()
        print("MySQL connection is closed")

if __name__ == "__main__":
    main()