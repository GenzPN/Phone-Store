import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col, Typography, Image, Button, Card, Carousel, message, Spin } from "antd";
import { Link, useNavigate } from 'react-router-dom';
import { FireOutlined, ShoppingCartOutlined, ZoomInOutlined, TrophyOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { formatProductNameForUrl } from '../../utils/stringUtils';
import { useCart, CartItem } from '../../contexts/CartContext';
import axios from 'axios';
import { useConfig } from '../../hook/useConfig';

const { Title, Text } = Typography;

interface Phone {
  id: number;
  title: string;
  name: string;
  price: string | number;
  thumbnail: string;
  brand: string;
}

const Home: React.FC = () => {
    const { cartItems, addToCart } = useCart();
    const [bestSellers, setBestSellers] = useState<Phone[]>([]);
    const [phonesByBrand, setPhonesByBrand] = useState<Record<string, Phone[]>>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const carouselRefs = useRef<Record<string, any>>({});
    const navigate = useNavigate();
    const config = useConfig();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/products`, {
                    params: {
                        page: currentPage,
                        limit: 20
                    }
                });

                const data = response.data;
                
                if (!data.products || data.products.length === 0) {
                    console.warn('No products received from API');
                    message.warning('Không có sản phẩm nào được tìm thấy.');
                    return;
                }

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
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        message.error(`Lỗi server: ${error.response.data.message || 'Không thể tải sản phẩm'}`);
                    } else if (error.request) {
                        // The request was made but no response was received
                        message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.');
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        message.error('Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.');
                    }
                } else {
                    message.error('Có lỗi không xác định xảy ra. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

    const formatPrice = useCallback((price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numPrice);
    }, []);

    const handleImageClick = useCallback((phone: Phone) => {
        navigate(`/details/${phone.brand?.toLowerCase() || ''}/${formatProductNameForUrl(phone.title) || ''}`);
    }, [navigate]);

    const handleAddToCart = useCallback((phone: Phone) => {
        const newCartItem: CartItem = {
            id: phone.id,
            product_id: phone.id,
            quantity: 1,
            title: phone.title,
            price: typeof phone.price === 'string' ? parseFloat(phone.price) : phone.price,
            thumbnail: phone.thumbnail
        };
        addToCart(newCartItem);
    }, [addToCart, formatPrice]);

    const renderPhoneCard = useCallback((phone: Phone) => (
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
                    onClick={() => handleImageClick(phone)}
                    >
                        <Image 
                            alt={phone.title} 
                            src={phone.thumbnail || 'đường_dẫn_đến_ảnh_mặc_định'} 
                            preview={false}
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
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
                <Text style={{ display: "block", textAlign: "center", marginBottom: '15px', fontSize: '16px', fontWeight: 'bold', color: '#f5222d' }}>
                    {phone.price !== null && phone.price !== undefined ? formatPrice(phone.price) : 'Giá không xác định'}
                </Text>
                <Row justify="center" style={{ marginTop: 'auto' }}>
                    <Link to={`/details/${phone.brand?.toLowerCase() || ''}/${formatProductNameForUrl(phone.title) || ''}`}>
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
    ), [formatPrice, handleImageClick, handleAddToCart]);

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
            {loading ? (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <Spin size="large" />
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : (
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
                            src={config?.banner || "https://i.ytimg.com/vi/eDqfg_LexCQ/maxresdefault.jpg"}
                            alt="Banner" 
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
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
            )}
        </>
    );
};

export default Home;