import json
import re

def fix_product(product):
    for key, value in product.items():
        if isinstance(value, str):
            # Sửa lỗi dấu ngoặc kép trong URL
            if key == 'thumbnail' or key == 'images':
                product[key] = re.sub(r'""(https?://[^"]+)""', r'"\1"', value)
            else:
                # Loại bỏ dấu ngoặc kép thừa trong các giá trị chuỗi khác
                product[key] = re.sub(r'^"|"$', '', value)
    return product

def fix_phone_details(input_file, output_file):
    # Đọc file JSON
    with open(input_file, 'r', encoding='utf-8') as f:
        json_str = f.read()
    
    # Tìm vị trí bắt đầu và kết thúc của mảng products
    start = json_str.find('"products": [') + 12
    end = json_str.rfind(']')
    
    # Tách các sản phẩm riêng lẻ
    product_strings = re.findall(r'\{[^{}]*\}', json_str[start:end])
    
    fixed_products = []
    for product_str in product_strings:
        try:
            # Parse và sửa từng sản phẩm
            product = json.loads(product_str)
            fixed_product = fix_product(product)
            fixed_products.append(fixed_product)
        except json.JSONDecodeError as e:
            print(f"Lỗi khi parse sản phẩm: {e}")
            print(f"Sản phẩm gây lỗi: {product_str}")

    # Tạo một dictionary để lưu trữ sản phẩm duy nhất dựa trên title
    unique_products = {}
    for product in fixed_products:
        title = product['title']
        if title not in unique_products:
            unique_products[title] = product

    # Tạo danh sách mới với các sản phẩm duy nhất và đánh số lại id
    new_products = []
    for i, (title, product) in enumerate(unique_products.items(), start=1):
        product['id'] = i
        new_products.append(product)

    # Sắp xếp lại danh sách sản phẩm theo id
    new_products.sort(key=lambda x: x['id'])

    # Tạo dictionary mới với danh sách sản phẩm đã được cập nhật
    new_data = {'products': new_products}

    # Ghi ra file JSON mới
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)

    print(f"Đã xử lý xong. Kết quả được lưu vào {output_file}")

# Sử dụng hàm
fix_phone_details('phoneDetails.json', 'phoneDetails_fixed.json')