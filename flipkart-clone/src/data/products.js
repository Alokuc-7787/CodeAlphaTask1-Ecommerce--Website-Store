const mobileAccessories = [
  ["Smart Watch", 750, 1650, 4.4, "Daily use smart watch", "/mobile-accessories/smart-watch.svg"],
  ["Music Box", 450, 650, 4.2, "Portable mini speaker", "/mobile-accessories/music-box.svg"],
  ["Bluetooth Earphones", 600, 900, 4.3, "Neckband bluetooth earphones", "/mobile-accessories/bluetooth-earphones.svg"],
  ["Keypad Phone Charger", 80, 120, 4.0, "Basic phone charger", "/mobile-accessories/keypad-phone-charger.svg"],
  ["Voice Mike", 1050, 1299, 4.5, "Wireless voice microphone", "/mobile-accessories/voice-mike.svg"],
  ["Mobile Stand", 150, 250, 4.1, "Foldable mobile stand", "/mobile-accessories/mobile-stand.svg"],
  ["iPhone Charger", 250, 950, 4.2, "USB-C iPhone charger", "/mobile-accessories/iphone-charger.svg"],
  ["Video Stand", 700, 999, 4.3, "Selfie and video stand", "/mobile-accessories/video-stand.svg"],
  ["Airphone", 100, 150, 4.0, "Wired airphone", "/mobile-accessories/airphone.svg"],
  ["Camera Screen Guard", 100, 150, 4.1, "Camera lens protector", "/mobile-accessories/camera-screen-guard.svg"],
  ["Charger", 350, 500, 4.2, "Fast mobile charger", "/mobile-accessories/charger.svg"],
  ["Data Cable", 150, 250, 4.0, "USB data cable", "/mobile-accessories/data-cable.svg"],
];

const products = [
  {
    id: 1,
    name: "iPhone 15",
    category: "Mobiles",
    price: 79999,
    originalPrice: 89999,
    rating: 4.8,
    delivery: "Free delivery by tomorrow",
    tagline: "A17 performance with premium camera system",
    description:
      "A flagship phone for users who want top-tier photos, smooth gaming, and dependable battery life.",
    features: ["48MP main camera", "Dynamic Island", "USB-C charging"],
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Samsung Galaxy S23",
    category: "Mobiles",
    price: 74999,
    originalPrice: 82999,
    rating: 4.7,
    delivery: "Delivery in 2 days",
    tagline: "Compact flagship with sharp AMOLED display",
    description:
      "Balanced flagship hardware with a bright screen, strong cameras, and polished Android experience.",
    features: ["120Hz AMOLED display", "Nightography camera", "Fast wireless charging"],
    image:
      "https://images.unsplash.com/photo-1678911820864-e5f8d1bb6b2f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "OnePlus 12R",
    category: "Mobiles",
    price: 42999,
    originalPrice: 47999,
    rating: 4.6,
    delivery: "Free delivery this week",
    tagline: "High refresh display and fast charging",
    description:
      "Strong value device with gaming-ready performance, fluid visuals, and reliable all-day battery backup.",
    features: ["100W SUPERVOOC", "Snapdragon chipset", "Large battery"],
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Noise Pulse Smartwatch",
    category: "Fashion",
    price: 3999,
    originalPrice: 5999,
    rating: 4.2,
    delivery: "Delivery by tomorrow evening",
    tagline: "Fitness tracking in a clean metal frame",
    description:
      "A stylish smartwatch for daily health metrics, call alerts, and lightweight all-day wear.",
    features: ["Heart rate tracking", "Bluetooth calling", "7-day battery"],
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Men Classic Sneakers",
    category: "Fashion",
    price: 2899,
    originalPrice: 4499,
    rating: 4.3,
    delivery: "Free delivery in 3 days",
    tagline: "Daily wear comfort with clean street styling",
    description:
      "Versatile sneakers built for commuting, casual outings, and long hours on your feet.",
    features: ["Cushioned sole", "Breathable upper", "Neutral everyday styling"],
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Women's Festive Kurti Set",
    category: "Fashion",
    price: 1799,
    originalPrice: 2499,
    rating: 4.4,
    delivery: "Delivery in 2 days",
    tagline: "Comfortable fabric with occasion-ready finish",
    description:
      "A complete festive outfit with tailored comfort, ideal for family events and traditional gatherings.",
    features: ["Soft cotton blend", "Coordinated dupatta", "Elegant print detailing"],
    image:
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Sony Wireless Headphones",
    category: "Electronics",
    price: 8999,
    originalPrice: 12999,
    rating: 4.7,
    delivery: "Free delivery by tomorrow",
    tagline: "Rich sound with dependable noise isolation",
    description:
      "A travel-friendly headphone choice for long listening sessions, calls, and focused work.",
    features: ["Deep bass tuning", "Quick charge support", "Comfort-fit earcups"],
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Gaming Laptop Pro 15",
    category: "Electronics",
    price: 89999,
    originalPrice: 104999,
    rating: 4.6,
    delivery: "Delivery in 4 days",
    tagline: "RTX graphics with creator-ready performance",
    description:
      "Built for multitasking, editing, and modern gaming with strong cooling and a sharp display.",
    features: ["RTX graphics", "144Hz display", "16GB RAM"],
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 9,
    name: "Smart 4K LED TV",
    category: "Electronics",
    price: 38999,
    originalPrice: 46999,
    rating: 4.5,
    delivery: "Installation in 48 hours",
    tagline: "Large-screen streaming for family entertainment",
    description:
      "An easy living-room upgrade with crisp 4K visuals, streaming apps, and immersive audio output.",
    features: ["4K UHD panel", "Built-in streaming apps", "Dolby Audio"],
    image:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 10,
    name: "Bluetooth Speaker Mini",
    category: "Electronics",
    price: 2499,
    originalPrice: 3999,
    rating: 4.1,
    delivery: "Same-week delivery",
    tagline: "Portable sound for desks, travel, and rooms",
    description:
      "Compact speaker with punchy audio for small gatherings, bedside use, and on-the-go listening.",
    features: ["Portable build", "USB-C charging", "Water resistant"],
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 11,
    name: "Slim Fit Casual Shirt",
    category: "Fashion",
    price: 1299,
    originalPrice: 1899,
    rating: 4,
    delivery: "Free delivery in 3 days",
    tagline: "Sharp look for office and casual evenings",
    description:
      "A lightweight shirt with clean tailoring that works across formal-casual wardrobes.",
    features: ["Wrinkle-light fabric", "Tailored fit", "All-season wear"],
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 12,
    name: "Redmi Note 13",
    category: "Mobiles",
    price: 1,
    originalPrice: 21999,
    rating: 4.3,
    delivery: "Delivery by tomorrow",
    tagline: "Reliable budget phone with strong display",
    description:
      "A budget-friendly device that focuses on battery life, bright visuals, and dependable day-to-day use.",
    features: ["AMOLED display", "Fast charging", "50MP main camera"],
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
  },
];

const mobileAccessoryProducts = mobileAccessories.map(
  ([name, price, originalPrice, rating, tagline, image], index) => ({
    id: index + 1,
    name,
    category: "Mobiles",
    price,
    originalPrice,
    rating,
    delivery: index % 2 === 0 ? "Delivery in 2 days" : "Delivery by tomorrow",
    tagline,
    description: `${name} for mobile accessory buyers with reliable daily-use quality.`,
    features: ["Shop stock", "Best value", "Daily use"],
    image,
  }),
);

const fallbackProducts = [
  ...mobileAccessoryProducts,
  ...products
    .filter((product) => product.category !== "Mobiles")
    .map((product, index) => ({
      ...product,
      id: mobileAccessoryProducts.length + index + 1,
    })),
];

export default fallbackProducts;
