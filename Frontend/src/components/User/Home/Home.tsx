import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Typography, Image, Button, Card, Carousel, message } from "antd";
import { Link, useNavigate } from 'react-router-dom';
import { FireOutlined, ShoppingCartOutlined, ZoomInOutlined, TrophyOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { formatProductNameForUrl } from '../../../utils/stringUtils';
import { useCart } from '../../../contexts/CartContext';

const { Title, Text } = Typography;

interface Phone {
  id: number;
  title: string;
  name: string; // Thêm trường này
  price: string | number;
  thumbnail: string;
  brand: string;
  quantity?: number;
}

const Home: React.FC = () => {
    const { cartItems, setCartItems } = useCart();
    const [bestSellers, setBestSellers] = useState<Phone[]>([]);
    const [phonesByBrand, setPhonesByBrand] = useState<Record<string, Phone[]>>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const carouselRefs = useRef<Record<string, any>>({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products?page=${currentPage}&limit=20`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Received products:', data.products);
                const products: Phone[] = data.products;
                
                setBestSellers(products.slice(0, 4));

                const groupedProducts = products.reduce((acc: Record<string, Phone[]>, product: Phone) => {
                    if (!acc[product.brand]) {
                        acc[product.brand] = [];
                    }
                    acc[product.brand].push(product);
                    return acc;
                }, {});

                setPhonesByBrand(prevState => ({
                    ...prevState,
                    ...groupedProducts
                }));
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [currentPage]);

    const handleImageClick = (productName: string) => {
        navigate(`/details/${formatProductNameForUrl(productName)}`);
    };

    const handleAddToCart = (phone: Phone) => {
        const existingItem = cartItems.find((item: CartItem) => item.id === phone.id);
        let updatedCart: CartItem[];
        if (existingItem) {
            updatedCart = cartItems.map((item: CartItem) =>
                item.id === phone.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item
            );
        } else {
            const newCartItem: CartItem = {
                id: phone.id,
                name: phone.title,
                price: typeof phone.price === 'string' ? parseFloat(phone.price) : phone.price,
                thumbnail: phone.thumbnail,
                brand: phone.brand,
                quantity: 1
            };
            updatedCart = [...cartItems, newCartItem];
        }
        setCartItems(updatedCart);

        // Lưu đơn hàng vào cookie
        fetch('http://localhost:5000/api/cookie/save-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCart),
            credentials: 'include', // Quan trọng để gửi và nhận cookies
        })
            .then(response => response.json())
            .then(data => console.log(data.message))
            .catch(error => console.error('Error saving order to cookie:', error));

        message.success(`Đã thêm ${phone.title} vào giỏ hàng`);
    };

    const renderPhoneCard = (phone: Phone) => (
        <div key={phone.id} style={{ padding: '0 10px' }}>
            <Card
                hoverable
                cover={
                    <div style={{   
                        padding: '20px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '300px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }}
                    onClick={() => handleImageClick(phone.title)}
                    >
                        <Image 
                            alt={phone.title} 
                            src={phone.thumbnail} 
                            preview={false}
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                objectPosition: 'center'
                            }}
                        />
                    </div>
                }
                bordered={false}
                style={{ 
                    height: '100%', 
                    paddingTop: '5px', 
                    paddingBottom: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none',
                    background: 'transparent'
                }}
                bodyStyle={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '10px 0'
                }}
            >
                <Title level={5} style={{ color: "#219ebc", textAlign: "center", marginBottom: '5px' }}>
                    {phone.title}
                </Title>
                <Text style={{ display: "block", textAlign: "center", marginBottom: '15px' }}>
                    {phone.price !== null && phone.price !== undefined ? phone.price : 'Giá không xác định'}
                </Text>
                <Row justify="center" style={{ marginTop: 'auto' }}>
                    <Link to={`/details/${formatProductNameForUrl(phone.title)}`}>
                        <Button icon={<ZoomInOutlined />} shape="circle" style={{ marginRight: '10px' }} />
                    </Link>
                    <Button 
                        icon={<ShoppingCartOutlined />} 
                        type="primary"
                        onClick={() => handleAddToCart(phone)}
                    >
                        Thêm vào
                    </Button>
                </Row>
            </Card>
        </div>
    );

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    const bestSellerSettings = {
        ...settings,
        autoplay: true,
        autoplaySpeed: 3500,
    };

    return (
        <>
            {/* Banner cố định */}
            <div style={{ 
                width: '100%', 
                height: '300px', 
                overflow: 'hidden', 
                marginBottom: '20px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Image 
                    src="https://i.ytimg.com/vi/eDqfg_LexCQ/maxresdefault.jpg" 
                    alt="Banner" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />
            </div>

            <Row gutter={[24, 24]} justify="center" style={{ marginTop: 20 }}>
                <Col span={24}>
                    <Card
                        title={
                            <Row align="middle">
                                <TrophyOutlined style={{ color: "#ffd700" }} />
                                <Title level={4} style={{ marginLeft: 10, color: "#219ebc" }}>
                                    Bán chạy nhất
                                </Title>
                            </Row>
                        }
                        bordered={false}
                        style={{ width: '100%', maxWidth: 1200, borderRadius: 20, margin: '0 auto' }}
                        extra={
                            <div>
                                <Button 
                                    className="custom-carousel-button prev" 
                                    icon={<LeftOutlined />} 
                                    onClick={() => carouselRefs.current['bestSellers']?.prev()}
                                />
                                <Button 
                                    className="custom-carousel-button next" 
                                    icon={<RightOutlined />} 
                                    onClick={() => carouselRefs.current['bestSellers']?.next()}
                                />
                            </div>
                        }
                    >
                        <Carousel {...bestSellerSettings} ref={ref => {if (ref) carouselRefs.current['bestSellers'] = ref}}>
                            {bestSellers.map(renderPhoneCard)}
                        </Carousel>
                    </Card>
                </Col>

                {Object.entries(phonesByBrand).map(([brand, phones]) => (
                    <Col span={24} key={brand}>
                        <Card
                            title={
                                <Row align="middle">
                                    <FireOutlined />
                                    <Title level={4} style={{ marginLeft: 10, color: "#219ebc" }}>
                                        {brand}
                                    </Title>
                                </Row>
                            }
                            bordered={false}
                            style={{ width: '100%', maxWidth: 1200, borderRadius: 20, margin: '0 auto' }}
                            extra={
                                <div>
                                    <Button 
                                        className="custom-carousel-button prev" 
                                        icon={<LeftOutlined />} 
                                        onClick={() => carouselRefs.current[brand]?.prev()}
                                    />
                                    <Button 
                                        className="custom-carousel-button next" 
                                        icon={<RightOutlined />} 
                                        onClick={() => carouselRefs.current[brand]?.next()}
                                    />
                                </div>
                            }
                        >
                            <Carousel {...settings} ref={ref => {if (ref) carouselRefs.current[brand] = ref}}>
                                {phones.map(renderPhoneCard)}
                            </Carousel>
                        </Card>
                    </Col>
                ))}
            </Row>
            
            {currentPage < totalPages && (
                <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                    Load More
                </Button>
            )}
        </>
    );
};

export default Home;