import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Typography, Image, Button, Card, Carousel } from "antd";
import { Link } from 'react-router-dom';
import { FireOutlined, ShoppingCartOutlined, ZoomInOutlined, TrophyOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { formatProductNameForUrl } from '../../utils/stringUtils';

const { Title, Text } = Typography;
const Home = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [phonesByBrand, setPhonesByBrand] = useState({});
    const carouselRefs = useRef({});

    useEffect(() => {
        fetch('/phoneData.json')
            .then(response => response.json())
            .then(data => {
                setBestSellers(data.bestSellers);
                setPhonesByBrand(data.phonesByBrand);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []); // Mảng dependencies trống

    const renderPhoneCard = (phone) => (
        <div key={phone.name} style={{ padding: '0 10px' }}>
            <Card
                hoverable
                cover={
                    <div style={{   
                        padding: '20px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '250px',
                        overflow: 'hidden'
                    }}>
                        <Image 
                            alt={phone.name} 
                            src={phone.img} 
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
                styles={{
                    body: { 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        padding: '10px 0'
                    }
                }}
            >
                <Title level={5} style={{ color: "#219ebc", textAlign: "center", marginBottom: '5px' }}>
                    {phone.name}
                </Title>
                <Text style={{ display: "block", textAlign: "center", marginBottom: '15px' }}>{phone.price}</Text>
                <Row justify="center" style={{ marginTop: 'auto' }}>
                    <Link to={`/details/${formatProductNameForUrl(phone.name)}`}>
                        <Button icon={<ZoomInOutlined />} shape="circle" style={{ marginRight: '10px' }} />
                    </Link>
                    <Button icon={<ShoppingCartOutlined />} type="primary">
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
        autoplaySpeed: 1000,
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
                        <Carousel {...bestSellerSettings} ref={ref => carouselRefs.current['bestSellers'] = ref}>
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
                            <Carousel {...settings} ref={ref => carouselRefs.current[brand] = ref}>
                                {phones.map(renderPhoneCard)}
                            </Carousel>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default Home;