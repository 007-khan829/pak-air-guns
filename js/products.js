/**
 * PAK AIR GUNS - Product Catalog
 * Single Source of Truth for all shop items
 * Category options: "gun" | "scope" | "cover" | "accessory"
 */

const PRODUCTS = [
  {
    id: "product-01",
    name: "Air Rifle",
    category: "gun",
    price: 14500,
    image: "images/products/product-01.jpg",
    description: "Reliable high-power air rifle engineered for precision target shooting and field practice."
  },
  {
    id: "product-02",
    name: "Air Rifle (Wooden Stock)",
    category: "gun",
    price: 19000,
    image: "images/products/product-02.jpg",
    description: "Classic air rifle featuring an elegant polished wooden stock with superior grip and balance."
  },
  {
    id: "product-03",
    name: "Air Rifle",
    category: "gun",
    price: 15000,
    image: "images/products/product-03.jpg",
    description: "Durable synthetic stock air rifle built for consistent accuracy and smooth cocking."
  },
  {
    id: "product-04",
    name: "Air Rifle",
    category: "gun",
    price: 16000,
    image: "images/products/product-04.jpg",
    description: "Ergonomic precision air rifle with enhanced sights and tactical synthetic stock."
  },
  {
    id: "product-05",
    name: "Kral Air Rifle",
    category: "gun",
    price: 21000,
    image: "images/products/product-05.jpg",
    description: "Authentic Kral precision air rifle with thumbhole stock and high-velocity performance."
  },
  {
    id: "product-06",
    name: "Air Rifle LB600",
    category: "gun",
    price: 17000,
    image: "images/products/product-06.jpg",
    description: "Proven LB600 air rifle model offering smooth break-barrel action and dependable power."
  },
  {
    id: "product-07",
    name: "Air Rifle",
    category: "gun",
    price: 24000,
    image: "images/products/product-07.jpg",
    description: "High performance precision air rifle designed for long-range target stability."
  },
  {
    id: "product-08",
    name: "Artemis Air Rifle with Scope",
    category: "gun",
    price: 29000,
    image: "images/products/product-08.jpg",
    description: "Artemis precision air rifle complete with mounted optical scope and tactical camouflage kit."
  },
  {
    id: "product-09",
    name: "Gamo Whisper X",
    category: "gun",
    price: 34000,
    image: "images/products/product-09.jpg",
    description: "High-spec Gamo Whisper X air rifle with integrated sound suppressor and precision scope system."
  },
  {
    id: "product-10",
    name: "Gamo Whisper X",
    category: "gun",
    price: 28000,
    image: "images/products/product-10.jpg",
    description: "Gamo Whisper X tactical air rifle featuring noise dampening fluted barrel and scope."
  },
  {
    id: "product-11",
    name: "Air Rifle with Scope (Wooden Stock)",
    category: "gun",
    price: 22000,
    image: "images/products/product-11.jpg",
    description: "Refined wooden stock air rifle equipped with long-range telescopic sight."
  },
  {
    id: "product-12",
    name: "Air Rifle",
    category: "gun",
    price: 30000,
    image: "images/products/product-12.jpg",
    description: "Advanced match-grade target air rifle featuring top optic rail and pressure gauge."
  },
  {
    id: "product-13",
    name: "Air Rifle",
    category: "gun",
    price: 15000,
    image: "images/products/product-13.jpg",
    description: "Solid lightweight break-barrel air rifle with fiber-optic sights for instant target acquisition."
  },
  {
    id: "product-14",
    name: "Kaiser High Pressure Pump",
    category: "accessory",
    price: 8000,
    image: "images/products/product-14.jpg",
    description: "Heavy-duty 30 MPa / 4500 PSI stainless steel PCP hand pump with pressure gauge and filter kit."
  },
  {
    id: "product-15",
    name: "High Quality Gun Bags",
    category: "cover",
    price: 2500,
    image: "images/products/product-15.jpg",
    description: "Padded heavy-duty rifle slip covers with accessory pockets, available in tactical camo and black."
  },
  {
    id: "product-16",
    name: "Apolo Slug Pellets .35 (9 mm), High Quality",
    category: "accessory",
    price: 300,
    image: "images/products/product-16.jpg",
    description: "Premium Argentine Apolo heavy-weight .35 caliber (9mm) 75-grain micro-calibrated slug pellets."
  },
  {
    id: "product-17",
    name: "XM1 Bullpup Air Rifle with Scope",
    category: "gun",
    price: 45000,
    image: "images/products/product-17.jpg",
    description: "Stoeger XM1 Bullpup high-pressure PCP air rifle with tactical grip, cheek rest, and premium scope."
  },
  {
    id: "product-18",
    name: "Discovery Premium Scope",
    category: "scope",
    price: 3500,
    image: "images/products/product-18.jpg",
    description: "Discovery VT-R 4-16x42 AOE tactical rifle scope with dual mounting rings and lens covers."
  },
  {
    id: "product-19",
    name: "Bushnell Premium Rifle Scope",
    category: "scope",
    price: 4000,
    image: "images/products/product-19.jpg",
    description: "Bushnell Banner Dusk & Dawn 4x32 multi-coated waterproof rifle scope with protective flip caps."
  },
  {
    id: "product-20",
    name: "GAMO Original High Quality Scope",
    category: "scope",
    price: 6000,
    image: "images/products/product-20.jpg",
    description: "Original GAMO 3-9x40 EG illuminated reticle rifle scope with precision turret adjustments."
  },
  {
    id: "product-21",
    name: "Snowpeak T-Rex Air Rifle",
    category: "gun",
    price: 34000,
    image: "images/products/product-21.jpg",
    description: "Snowpeak T-Rex regulated PCP air rifle with suppressor, Picatinny rails, and tactical stock."
  },
  {
    id: "product-22",
    name: "Air Rifle (Made in China)",
    category: "gun",
    price: 14500,
    image: "images/products/product-22.jpg",
    description: "Dependable standard synthetic air rifle with muzzle brake and grooved receiver for scopes."
  },
  {
    id: "product-23",
    name: "Air Rifle (Made in Turkey)",
    category: "gun",
    price: 19000,
    image: "images/products/product-23.jpg",
    description: "Turkish-crafted high-velocity air rifle featuring skeletonized stock and vented recoil pad."
  },
  {
    id: "product-24",
    name: "Air Rifle (Made in China)",
    category: "gun",
    price: 15500,
    image: "images/products/product-24.jpg",
    description: "Smooth underlever cocking air rifle with traditional finished stock and elevated front sight."
  },
  {
    id: "product-25",
    name: "Air Rifle (Made in Turkey)",
    category: "gun",
    price: 21000,
    image: "images/products/product-25.jpg",
    description: "Turkish camo-dipped magnum air rifle engineered for high precision hunting and field durability."
  },
  {
    id: "product-26",
    name: "Air Rifle (Made in Turkey)",
    category: "gun",
    price: 18000,
    image: "images/products/product-26.jpg",
    description: "Camouflage finished Turkish air rifle with ergonomic stock geometry and high power output."
  }
];

// Helper functions for accessing products
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function getProductsByCategory(category) {
  return PRODUCTS.filter(p => p.category === category);
}

function formatPrice(price) {
  if (price === 0 || price === undefined || price === null) {
    return "Price on request";
  }
  return "Rs " + price.toLocaleString("en-PK");
}
