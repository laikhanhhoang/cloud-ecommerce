export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'phone',
    description:
      'iPhone 15 Pro Max với chip A17 Pro, màn hình ProMotion 120Hz và camera nâng cấp cho trải nghiệm chụp ảnh linh hoạt. Thiết kế bền bỉ, hiệu năng mạnh mẽ, phù hợp cho cả làm việc và giải trí.',
    specs: {
      CPU: 'A17 Pro',
      RAM: '8GB',
      Storage: '256GB / 512GB',
      Display: '6.7" OLED, 120Hz',
      Connectivity: '5G, Wi‑Fi 6E',
    },
    base_price: '29000000',
    main_image: 'https://placehold.co/600x600/png?text=iPhone+15+Pro+Max',
    images: [
      {
        id: 101,
        image: 'https://placehold.co/900x900/png?text=iPhone+15+Pro+Max',
        is_main: true
      },
      {
        id: 102,
        image: 'https://placehold.co/900x900/png?text=iPhone+15+Side',
        is_main: false
      },
      {
        id: 103,
        image: 'https://placehold.co/900x900/png?text=iPhone+15+Natural',
        is_main: false
      },
      {
        id: 104,
        image: 'https://placehold.co/900x900/png?text=iPhone+15+Black+512GB',
        is_main: false
      }
    ],
    variants: [
      {
        id: 1001,
        sku: 'IP15PM-256-BLK',
        price: '29000000',
        version: '256GB',
        color: 'Black',
        stock: 12,
        variant_image: {
          id: 101,
          image: 'https://placehold.co/900x900/png?text=iPhone+15+Pro+Max',
          is_main: true
        }
      },
      {
        id: 1003,
        sku: 'IP15PM-256-NAT',
        price: '29500000',
        version: '256GB',
        color: 'Natural',
        stock: 9,
        variant_image: {
          id: 103,
          image: 'https://placehold.co/900x900/png?text=iPhone+15+Natural',
          is_main: false
        }
      },
      {
        id: 1004,
        sku: 'IP15PM-512-BLK',
        price: '31500000',
        version: '512GB',
        color: 'Black',
        stock: 7,
        variant_image: {
          id: 104,
          image: 'https://placehold.co/900x900/png?text=iPhone+15+Black+512GB',
          is_main: false
        }
      },
      {
        id: 1002,
        sku: 'IP15PM-512-NAT',
        price: '32000000',
        version: '512GB',
        color: 'Natural',
        stock: 6,
        variant_image: {
          id: 103,
          image: 'https://placehold.co/900x900/png?text=iPhone+15+Natural',
          is_main: false
        }
      }
    ],
    created_at: '2026-05-13T10:00:00+07:00',
    updated_at: '2026-05-13T12:00:00+07:00',
    options: {
      version: ['256GB', '512GB'],
      color: ['Black', 'Natural']
    },
    isFeatured: true
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'phone',
    description: null,
    specs: null,
    base_price: '27000000',
    main_image: 'https://placehold.co/600x600/png?text=Galaxy+S24+Ultra',
    images: [
      {
        id: 201,
        image: 'https://placehold.co/900x900/png?text=Galaxy+S24+Ultra',
        is_main: true
      }
    ],
    variants: [
      {
        id: 2001,
        sku: 'S24U-256-GRY',
        price: '27000000',
        version: '256GB',
        color: 'Gray',
        stock: 10,
        variant_image: {
          id: 201,
          image: 'https://placehold.co/900x900/png?text=Galaxy+S24+Ultra',
          is_main: true
        }
      }
    ],
    created_at: '2026-05-13T10:30:00+07:00',
    updated_at: '2026-05-13T12:30:00+07:00',
    options: {
      version: ['256GB'],
      color: ['Gray']
    },
    isFeatured: true
  },
  {
    id: 3,
    name: 'Xiaomi 14 Pro',
    brand: 'Xiaomi',
    category: 'phone',
    description: null,
    specs: null,
    base_price: '23000000',
    main_image: null,
    images: [
      {
        id: 301,
        image: 'https://placehold.co/900x900/png?text=Xiaomi+14+Pro',
        is_main: true
      }
    ],
    variants: [
      {
        id: 3001,
        sku: 'XM14P-256-GRN',
        price: '23000000',
        version: '256GB',
        color: 'Green',
        stock: 8,
        variant_image: {
          id: 301,
          image: 'https://placehold.co/900x900/png?text=Xiaomi+14+Pro',
          is_main: true
        }
      }
    ],
    created_at: '2026-05-13T11:00:00+07:00',
    updated_at: '2026-05-13T12:40:00+07:00',
    options: {
      version: ['256GB'],
      color: ['Green']
    },
    isFeatured: false
  },
  {
    id: 4,
    name: 'MacBook Pro 16 M3 Max',
    brand: 'Apple',
    category: 'laptop',
    description:
      'MacBook Pro 16 inch trang bị Apple Silicon dòng M3 cho hiệu năng cao và thời lượng pin ấn tượng. Phù hợp cho dựng phim, thiết kế và các tác vụ nặng.',
    specs: {
      CPU: 'Apple M3 Max',
      RAM: '36GB',
      Storage: '1TB SSD',
      Display: '16.2" Liquid Retina XDR',
      Weight: '2.1kg',
    },
    base_price: '80000000',
    main_image: 'https://placehold.co/600x600/png?text=MacBook+Pro+16',
    images: [
      {
        id: 401,
        image: 'https://placehold.co/900x900/png?text=MacBook+Pro+16',
        is_main: true
      }
    ],
    variants: [
      {
        id: 4001,
        sku: 'MBP16-M3-1TB',
        price: '80000000',
        version: '1TB',
        color: 'Space Black',
        stock: 5,
        variant_image: {
          id: 401,
          image: 'https://placehold.co/900x900/png?text=MacBook+Pro+16',
          is_main: true
        }
      }
    ],
    created_at: '2026-05-13T11:15:00+07:00',
    updated_at: '2026-05-13T12:45:00+07:00',
    options: {
      version: ['1TB'],
      color: ['Space Black']
    },
    isFeatured: true
  },
  {
    id: 5,
    name: 'Dell XPS 15 9530',
    brand: 'Dell',
    category: 'laptop',
    description: null,
    specs: null,
    base_price: '45000000',
    main_image: 'https://placehold.co/600x600/png?text=Dell+XPS+15',
    images: [
      {
        id: 501,
        image: 'https://placehold.co/900x900/png?text=Dell+XPS+15',
        is_main: true
      }
    ],
    variants: [
      {
        id: 5001,
        sku: 'XPS15-512-SLV',
        price: '45000000',
        version: '512GB',
        color: 'Silver',
        stock: 7,
        variant_image: {
          id: 501,
          image: 'https://placehold.co/900x900/png?text=Dell+XPS+15',
          is_main: true
        }
      }
    ],
    created_at: '2026-05-13T11:20:00+07:00',
    updated_at: '2026-05-13T12:50:00+07:00',
    options: {
      version: ['512GB'],
      color: ['Silver']
    },
    isFeatured: false
  },
  {
    id: 6,
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'headphone',
    description: null,
    specs: null,
    base_price: '7500000',
    main_image: 'https://placehold.co/600x600/png?text=Sony+WH-1000XM5',
    images: [
      {
        id: 601,
        image: 'https://placehold.co/900x900/png?text=Sony+WH-1000XM5',
        is_main: true
      }
    ],
    variants: [
      {
        id: 6001,
        sku: 'SONY-XM5-BLK',
        price: '7500000',
        version: '2024',
        color: 'Black',
        stock: 20,
        variant_image: {
          id: 601,
          image: 'https://placehold.co/900x900/png?text=Sony+WH-1000XM5',
          is_main: true
        }
      }
    ],
    created_at: '2026-05-13T11:25:00+07:00',
    updated_at: '2026-05-13T12:55:00+07:00',
    options: {
      version: ['2024'],
      color: ['Black']
    },
    isFeatured: true
  },
  {
    id: 7,
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    category: 'watch',
    description: null,
    specs: null,
    base_price: '10000000',
    main_image: 'https://placehold.co/600x600/png?text=Apple+Watch+Series+9',
    images: [
      {
        id: 701,
        image: 'https://placehold.co/900x900/png?text=Apple+Watch+Series+9',
        is_main: true
      }
    ],
    variants: [
      {
        id: 7001,
        sku: 'AWS9-45-BLK',
        price: '10000000',
        version: '45mm',
        color: 'Black',
        stock: 14,
        variant_image: {
          id: 701,
          image: 'https://placehold.co/900x900/png?text=Apple+Watch+Series+9',
          is_main: true
        }
      }
    ],
    created_at: '2026-05-13T11:30:00+07:00',
    updated_at: '2026-05-13T13:00:00+07:00',
    options: {
      version: ['45mm'],
      color: ['Black']
    },
    isFeatured: false
  },
  {
    id: 8,
    name: 'iPad Pro 11 inch M4',
    brand: 'Apple',
    category: 'tablet',
    description: null,
    specs: null,
    base_price: '25000000',
    main_image: 'https://placehold.co/600x600/png?text=iPad+Pro+11',
    images: [
      {
        id: 801,
        image: 'https://placehold.co/900x900/png?text=iPad+Pro+11',
        is_main: true
      }
    ],
    variants: [
      {
        id: 8001,
        sku: 'IPAD11-256-SLV',
        price: '25000000',
        version: '256GB',
        color: 'Silver',
        stock: 9,
        variant_image: {
          id: 801,
          image: 'https://placehold.co/900x900/png?text=iPad+Pro+11',
          is_main: true
        }
      }
    ],
    created_at: '2026-05-13T11:40:00+07:00',
    updated_at: '2026-05-13T13:10:00+07:00',
    options: {
      version: ['256GB'],
      color: ['Silver']
    },
    isFeatured: true
  },
  {
    id: 9,
    name: 'Sản phẩm Demo (Không có biến thể)',
    brand: null,
    category: 'phone',
    description: null,
    specs: null,
    base_price: '0',
    main_image: null,
    images: [],
    variants: [],
    created_at: '2026-05-13T12:10:00+07:00',
    updated_at: '2026-05-13T12:10:00+07:00',
    options: null,
    isFeatured: false
  }
];
