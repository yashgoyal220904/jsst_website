export const products = [
  {
    id: "iphone-15-pro-max",
    name: "Apple iPhone 15 Pro Max",
    brand: "Apple",
    category: "Premium Flagship",
    price: 159900,
    mrp: 159900,
    rating: 4.9,
    reviewsCount: 342,
    imageColor: "linear-gradient(135deg, #8E8E93 0%, #3A3A3C 100%)", // Titanium gray CSS display
    specs: {
      display: "6.7-inch Super Retina XDR OLED, 120Hz",
      processor: "Apple A17 Pro (3nm)",
      ram: "8 GB",
      storage: "256 GB",
      backCamera: "48 MP + 12 MP + 12 MP (5x Optical Zoom)",
      frontCamera: "12 MP TrueDepth",
      battery: "4441 mAh (25W fast charging)",
      os: "iOS 17 (Upgradable to iOS 18)",
      network: "5G Supported",
      weight: "221g"
    },
    features: [
      "Aerospace-grade Titanium design",
      "Action button customizable shortcut",
      "USB-C support with USB 3 speeds",
      "Dynamic Island notifications"
    ],
    inStock: true
  },
  {
    id: "samsung-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Premium Flagship",
    price: 129999,
    mrp: 134999,
    rating: 4.8,
    reviewsCount: 295,
    imageColor: "linear-gradient(135deg, #1C1D21 0%, #4E5159 100%)", // Titanium Black CSS
    specs: {
      display: "6.8-inch Dynamic AMOLED 2X, 120Hz, HDR10+",
      processor: "Snapdragon 8 Gen 3 for Galaxy",
      ram: "12 GB",
      storage: "256 GB",
      backCamera: "200 MP + 50 MP + 12 MP + 10 MP (100x Space Zoom)",
      frontCamera: "12 MP Dual Pixel",
      battery: "5000 mAh (45W fast charging)",
      os: "Android 14, One UI 6.1",
      network: "5G Supported",
      weight: "232g"
    },
    features: [
      "Integrated S-Pen stylus included",
      "Galaxy AI (Live Translate, Circle to Search)",
      "Corning Gorilla Armor anti-reflective glass",
      "7 Years of OS & Security updates"
    ],
    inStock: true
  },
  {
    id: "oneplus-12",
    name: "OnePlus 12 5G",
    brand: "OnePlus",
    category: "Flagship",
    price: 69999,
    mrp: 69999,
    rating: 4.7,
    reviewsCount: 188,
    imageColor: "linear-gradient(135deg, #0A2E24 0%, #155E4C 100%)", // Emerald Green CSS
    specs: {
      display: "6.82-inch LTPO AMOLED, 120Hz, 4500 nits peak",
      processor: "Snapdragon 8 Gen 3",
      ram: "16 GB",
      storage: "512 GB",
      backCamera: "50 MP + 64 MP + 48 MP Hasselblad Calibration",
      frontCamera: "32 MP",
      battery: "5400 mAh (100W SUPERVOOC charging)",
      os: "OxygenOS based on Android 14",
      network: "5G Supported",
      weight: "220g"
    },
    features: [
      "100W Wired & 50W Wireless Charging",
      "4th Gen Hasselblad Camera System",
      "Dual Cryo-velocity VC Cooling System",
      "Alert Slider for profiles"
    ],
    inStock: true
  },
  {
    id: "iphone-15",
    name: "Apple iPhone 15",
    brand: "Apple",
    category: "High-End",
    price: 79900,
    mrp: 79900,
    rating: 4.6,
    reviewsCount: 215,
    imageColor: "linear-gradient(135deg, #E3EFF2 0%, #A9C9D3 100%)", // Pastel Blue
    specs: {
      display: "6.1-inch Super Retina XDR OLED",
      processor: "Apple A16 Bionic (4nm)",
      ram: "6 GB",
      storage: "128 GB",
      backCamera: "48 MP + 12 MP",
      frontCamera: "12 MP TrueDepth",
      battery: "3349 mAh (20W fast charging)",
      os: "iOS 17",
      network: "5G Supported",
      weight: "171g"
    },
    features: [
      "Dynamic Island now standard",
      "48MP main camera with 2x Telephoto",
      "Color-infused glass back design",
      "USB-C connector"
    ],
    inStock: true
  },
  {
    id: "samsung-a55",
    name: "Samsung Galaxy A55 5G",
    brand: "Samsung",
    category: "Mid-Range",
    price: 39999,
    mrp: 42999,
    rating: 4.4,
    reviewsCount: 112,
    imageColor: "linear-gradient(135deg, #D6C7E8 0%, #A994C7 100%)", // Awesome Lilac
    specs: {
      display: "6.6-inch Super AMOLED, 120Hz, Gorilla Glass Victus+",
      processor: "Exynos 1480 (4nm)",
      ram: "8 GB",
      storage: "128 GB",
      backCamera: "50 MP + 12 MP + 5 MP",
      frontCamera: "32 MP",
      battery: "5000 mAh (25W charging)",
      os: "Android 14, One UI 6.1",
      network: "5G Supported",
      weight: "213g"
    },
    features: [
      "Premium glass back with metal frame",
      "IP67 dust and water resistance",
      "Samsung Knox Vault security chip",
      "Four major OS updates guaranteed"
    ],
    inStock: true
  },
  {
    id: "realme-12-pro-plus",
    name: "Realme 12 Pro+ 5G",
    brand: "Realme",
    category: "Mid-Range Premium",
    price: 29999,
    mrp: 32999,
    rating: 4.5,
    reviewsCount: 146,
    imageColor: "linear-gradient(135deg, #1C2E4A 0%, #0F172A 100%)", // Submarine Blue with Gold highlights
    specs: {
      display: "6.7-inch Curved Vision OLED, 120Hz",
      processor: "Snapdragon 7s Gen 2",
      ram: "12 GB",
      storage: "256 GB",
      backCamera: "50 MP + 64 MP (Periscope Portrait) + 8 MP",
      frontCamera: "32 MP Sony",
      battery: "5000 mAh (67W SUPERVOOC charging)",
      os: "Realme UI 5.0 based on Android 14",
      network: "5G Supported",
      weight: "196g"
    },
    features: [
      "Luxury watch-inspired leather back design",
      "64MP Periscope Portrait Camera with 3x optical zoom",
      "120Hz Curved Display with ultra-narrow bezels",
      "3D VC Cooling System"
    ],
    inStock: true
  },
  {
    id: "redmi-note-13-pro",
    name: "Redmi Note 13 Pro 5G",
    brand: "Xiaomi",
    category: "Mid-Range",
    price: 25999,
    mrp: 28999,
    rating: 4.3,
    reviewsCount: 220,
    imageColor: "linear-gradient(135deg, #A8C3D8 0%, #507E9F 100%)", // Coral Purple/Blue
    specs: {
      display: "6.67-inch 1.5K CrystalRes AMOLED, 120Hz",
      processor: "Snapdragon 7s Gen 2",
      ram: "8 GB",
      storage: "256 GB",
      backCamera: "200 MP (OIS) + 8 MP + 2 MP",
      frontCamera: "16 MP",
      battery: "5100 mAh (67W Turbo charging)",
      os: "MIUI 14 upgradable to HyperOS",
      network: "5G Supported",
      weight: "187g"
    },
    features: [
      "200MP Ultra-clear camera with OIS",
      "Corning Gorilla Glass Victus protection",
      "In-display fingerprint sensor with heart rate monitoring",
      "IP54 splash-proof design"
    ],
    inStock: true
  },
  {
    id: "xiaomi-14",
    name: "Xiaomi 14",
    brand: "Xiaomi",
    category: "Flagship",
    price: 69999,
    mrp: 79999,
    rating: 4.7,
    reviewsCount: 94,
    imageColor: "linear-gradient(135deg, #2E3033 0%, #151617 100%)", // Obsidian Black
    specs: {
      display: "6.36-inch LTPO AMOLED, 120Hz, 3000 nits peak",
      processor: "Snapdragon 8 Gen 3",
      ram: "12 GB",
      storage: "512 GB",
      backCamera: "50 MP + 50 MP + 50 MP Leica Summilux Lens",
      frontCamera: "32 MP",
      battery: "4610 mAh (90W HyperCharge)",
      os: "Xiaomi HyperOS based on Android 14",
      network: "5G Supported",
      weight: "193g"
    },
    features: [
      "Compact 6.36\" premium hand-feel design",
      "Leica Professional Optical system",
      "90W Wired & 50W Wireless HyperCharge",
      "IP68 dust and water resistance"
    ],
    inStock: true
  },
  {
    id: "oneplus-nord-ce4",
    name: "OnePlus Nord CE4 5G",
    brand: "OnePlus",
    category: "Budget Friendly",
    price: 24999,
    mrp: 26999,
    rating: 4.3,
    reviewsCount: 165,
    imageColor: "linear-gradient(135deg, #D4EDEA 0%, #88D1C7 100%)", // Celadon Marble
    specs: {
      display: "6.7-inch Fluid AMOLED, 120Hz, HDR10+",
      processor: "Snapdragon 7 Gen 3",
      ram: "8 GB",
      storage: "128 GB",
      backCamera: "50 MP (Sony LYT-600) + 8 MP",
      frontCamera: "16 MP",
      battery: "5500 mAh (100W SUPERVOOC charging)",
      os: "OxygenOS based on Android 14",
      network: "5G Supported",
      weight: "186g"
    },
    features: [
      "100W SUPERVOOC charges 1-100% in 29 mins",
      "Massive 5500mAh high-density battery",
      "Sony LYT-600 main camera with OIS",
      "Dual Stereo Speakers with 200% volume mode"
    ],
    inStock: true
  },
  {
    id: "motorola-edge-50-pro",
    name: "Motorola Edge 50 Pro 5G",
    brand: "Motorola",
    category: "Mid-Range Premium",
    price: 31999,
    mrp: 35999,
    rating: 4.5,
    reviewsCount: 104,
    imageColor: "linear-gradient(135deg, #7A5B80 0%, #3D2D40 100%)", // Luxe Lavender Vegan Leather
    specs: {
      display: "6.7-inch 1.5K pOLED Curved display, 144Hz",
      processor: "Snapdragon 7 Gen 3",
      ram: "12 GB",
      storage: "256 GB",
      backCamera: "50 MP + 10 MP (3x Telephoto) + 13 MP (Ultrawide)",
      frontCamera: "50 MP AF",
      battery: "4500 mAh (125W TurboPower charging)",
      os: "Android 14, Hello UI",
      network: "5G Supported",
      weight: "186g"
    },
    features: [
      "Pantone Validated camera & curved screen colors",
      "Premium Vegan Leather back finish",
      "125W Wired & 50W Wireless charging support",
      "IP68 underwater protection"
    ],
    inStock: true
  },
  {
    id: "poco-x6-pro",
    name: "POCO X6 Pro 5G",
    brand: "POCO",
    category: "Budget Flagship",
    price: 22999,
    mrp: 25999,
    rating: 4.4,
    reviewsCount: 197,
    imageColor: "linear-gradient(135deg, #F9D030 0%, #D8A502 100%)", // POCO Yellow
    specs: {
      display: "6.67-inch CrystalRes Flow AMOLED, 120Hz",
      processor: "MediaTek Dimensity 8300 Ultra (4nm)",
      ram: "8 GB",
      storage: "256 GB",
      backCamera: "64 MP (OIS) + 8 MP + 2 MP",
      frontCamera: "16 MP",
      battery: "5000 mAh (67W Turbo charging)",
      os: "Xiaomi HyperOS based on Android 14",
      network: "5G Supported",
      weight: "186g"
    },
    features: [
      "Flagship-grade Dimensity 8300 Ultra processor",
      "WildBoost Optimization 2.0 for gamers",
      "Sleek design with 94.27% screen-to-body ratio",
      "Dual speakers with Dolby Atmos"
    ],
    inStock: true
  },
  {
    id: "vivo-v30-pro",
    name: "Vivo V30 Pro 5G",
    brand: "Vivo",
    category: "Mid-Range Premium",
    price: 41999,
    mrp: 46999,
    rating: 4.6,
    reviewsCount: 132,
    imageColor: "linear-gradient(135deg, #E6F3F7 0%, #A2CBD7 100%)", // Andaman Blue
    specs: {
      display: "6.78-inch Curved AMOLED, 120Hz, 2800 nits peak",
      processor: "MediaTek Dimensity 8200",
      ram: "12 GB",
      storage: "512 GB",
      backCamera: "50 MP (Zeiss) + 50 MP (Zeiss Portrait) + 50 MP Zeiss Wide",
      frontCamera: "50 MP Group Selfie",
      battery: "5000 mAh (80W FlashCharge)",
      os: "Funtouch OS 14 based on Android 14",
      network: "5G Supported",
      weight: "188g"
    },
    features: [
      "Zeiss Co-engineered Professional Imaging triple system",
      "Studio-quality Smart Aura Light portrait ring",
      "Thinnest 5000mAh battery phone on the market (7.45mm)",
      "3D curved display with 1.5K resolution"
    ],
    inStock: true
  }
];
