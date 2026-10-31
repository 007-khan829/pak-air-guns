/**
 * PAK AIR GUNS - Product Catalog
 * Single Source of Truth for all shop items
 * Sourced from free royalty-free stock imagery (Pexels)
 * Category options: "gun" | "scope" | "cover" | "accessory"
 */

const PRODUCTS = [
  {
    id: "product-01",
    name: "Air Rifle",
    category: "gun",
    price: 18500,
    image: "assets/images/product-01.webp",
    alt: "AR-style tactical precision air rifle displayed on wooden planks",
    description: "Reliable high-power air rifle engineered for precision target shooting and field practice."
  },
  {
    id: "product-02",
    name: "Air Rifle (Wooden Stock)",
    category: "gun",
    price: 24500,
    image: "assets/images/product-02.webp",
    alt: "Classic polished wooden stock air rifle resting on rustic wooden bench outdoors",
    description: "Classic air rifle featuring an elegant polished wooden stock with superior grip and balance."
  },
  {
    id: "product-03",
    name: "Air Rifle",
    category: "gun",
    price: 19000,
    image: "assets/images/product-03.webp",
    alt: "Durable tactical synthetic air rifle leaning against rustic backdrop",
    description: "Durable synthetic stock air rifle built for consistent accuracy and smooth cocking."
  },
  {
    id: "product-04",
    name: "Air Rifle",
    category: "gun",
    price: 21500,
    image: "assets/images/product-04.webp",
    alt: "Ergonomic precision air rifles on rugged outdoor terrain",
    description: "Ergonomic precision air rifle with enhanced sights and tactical synthetic stock."
  },
  {
    id: "product-05",
    name: "Kral Air Rifle",
    category: "gun",
    price: 28000,
    image: "assets/images/product-05.webp",
    alt: "Authentic Kral precision air rifle on natural wood surface",
    description: "Authentic Kral precision air rifle with thumbhole stock and high-velocity performance."
  },
  {
    id: "product-06",
    name: "Air Rifle LB600",
    category: "gun",
    price: 22000,
    image: "assets/images/product-06.webp",
    alt: "Proven LB600 break-barrel air rifle model on outdoor wooden table",
    description: "Proven LB600 air rifle model offering smooth break-barrel action and dependable power."
  },
  {
    id: "product-07",
    name: "Air Rifle",
    category: "gun",
    price: 31500,
    image: "assets/images/product-07.webp",
    alt: "High performance precision target air rifles on store display rack",
    description: "High performance precision air rifle designed for long-range target stability."
  },
  {
    id: "product-08",
    name: "Artemis Air Rifle with Scope",
    category: "gun",
    price: 38500,
    image: "assets/images/product-08.webp",
    alt: "Artemis precision scoped air rifle with tactical camouflage gear",
    description: "Artemis precision air rifle complete with mounted optical scope and tactical camouflage kit."
  },
  {
    id: "product-09",
    name: "Gamo Whisper X",
    category: "gun",
    price: 44500,
    image: "assets/images/product-09.webp",
    alt: "Gamo Whisper X air rifle with integrated sound suppressor and precision scope",
    description: "High-spec Gamo Whisper X air rifle with integrated sound suppressor and precision scope system."
  },
  {
    id: "product-10",
    name: "Gamo Whisper X",
    category: "gun",
    price: 36000,
    image: "assets/images/product-10.webp",
    alt: "Gamo Whisper X tactical air rifle with mounted optic sight and fluted barrel",
    description: "Gamo Whisper X tactical air rifle featuring noise dampening fluted barrel and scope."
  },
  {
    id: "product-11",
    name: "Air Rifle with Scope (Wooden Stock)",
    category: "gun",
    price: 29500,
    image: "assets/images/product-11.webp",
    alt: "Refined wooden stock air rifle equipped with long-range telescopic sight",
    description: "Refined wooden stock air rifle equipped with long-range telescopic sight."
  },
  {
    id: "product-12",
    name: "Air Rifle",
    category: "gun",
    price: 39000,
    image: "assets/images/product-12.webp",
    alt: "Advanced match-grade target precision air rifle in competitive sports setting",
    description: "Advanced match-grade target air rifle featuring top optic rail and pressure gauge."
  },
  {
    id: "product-13",
    name: "Air Rifle",
    category: "gun",
    price: 19500,
    image: "assets/images/product-13.webp",
    alt: "Lightweight break-barrel air rifle with quick sights outdoors",
    description: "Solid lightweight break-barrel air rifle with fiber-optic sights for instant target acquisition."
  },
  {
    id: "product-14",
    name: "Kaiser High Pressure Pump",
    category: "accessory",
    price: 13500,
    image: "assets/images/product-14.webp",
    alt: "Heavy-duty 4500 PSI stainless steel PCP hand pump with pressure gauge and filter kit",
    description: "Heavy-duty 30 MPa / 4500 PSI stainless steel PCP hand pump with pressure gauge and filter kit."
  },
  {
    id: "product-15",
    name: "High Quality Gun Bags",
    category: "cover",
    price: 4200,
    image: "assets/images/product-15.webp",
    alt: "Padded heavy-duty rifle slip covers with accessory pockets for rifle transport",
    description: "Padded heavy-duty rifle slip covers with accessory pockets, available in tactical camo and black."
  },
  {
    id: "product-16",
    name: "Apolo Slug Pellets .35 (9 mm), High Quality",
    category: "accessory",
    price: 1600,
    image: "assets/images/product-16.webp",
    alt: "Premium calibrated heavy-weight slug pellets lying on dark textured surface",
    description: "Premium Argentine Apolo heavy-weight .35 caliber (9mm) 75-grain micro-calibrated slug pellets."
  },
  {
    id: "product-17",
    name: "XM1 Bullpup Air Rifle with Scope",
    category: "gun",
    price: 58500,
    image: "assets/images/product-17.webp",
    alt: "Stoeger XM1 Bullpup high-pressure PCP air rifle with tactical grip and scope",
    description: "Stoeger XM1 Bullpup high-pressure PCP air rifle with tactical grip, cheek rest, and premium scope."
  },
  {
    id: "product-18",
    name: "Discovery Premium Scope",
    category: "scope",
    price: 8500,
    image: "assets/images/product-18.webp",
    alt: "Discovery VT-R tactical rifle scope with dual mounting rings and lens covers",
    description: "Discovery VT-R 4-16x42 AOE tactical rifle scope with dual mounting rings and lens covers."
  },
  {
    id: "product-19",
    name: "Bushnell Premium Rifle Scope",
    category: "scope",
    price: 7500,
    image: "assets/images/product-19.webp",
    alt: "Bushnell Banner Dusk & Dawn multi-coated waterproof optical rifle scope",
    description: "Bushnell Banner Dusk & Dawn 4x32 multi-coated waterproof rifle scope with protective flip caps."
  },
  {
    id: "product-20",
    name: "GAMO Original High Quality Scope",
    category: "scope",
    price: 11500,
    image: "assets/images/product-20.webp",
    alt: "Original GAMO illuminated reticle precision rifle scope with turret adjustments",
    description: "Original GAMO 3-9x40 EG illuminated reticle rifle scope with precision turret adjustments."
  },
  {
    id: "product-21",
    name: "Snowpeak T-Rex Air Rifle",
    category: "gun",
    price: 46000,
    image: "assets/images/product-21.webp",
    alt: "Snowpeak T-Rex regulated PCP tactical air rifle with suppressor in outdoor field",
    description: "Snowpeak T-Rex regulated PCP air rifle with suppressor, Picatinny rails, and tactical stock."
  },
  {
    id: "product-22",
    name: "Air Rifle (Made in China)",
    category: "gun",
    price: 18000,
    image: "assets/images/product-22.webp",
    alt: "Dependable standard synthetic air rifle with muzzle brake and grooved receiver",
    description: "Dependable standard synthetic air rifle with muzzle brake and grooved receiver for scopes."
  },
  {
    id: "product-23",
    name: "Air Rifle (Made in Turkey)",
    category: "gun",
    price: 25000,
    image: "assets/images/product-23.webp",
    alt: "Turkish-crafted high-velocity air rifle with skeletonized stock",
    description: "Turkish-crafted high-velocity air rifle featuring skeletonized stock and vented recoil pad."
  },
  {
    id: "product-24",
    name: "Air Rifle (Made in China)",
    category: "gun",
    price: 20500,
    image: "assets/images/product-24.webp",
    alt: "Smooth underlever cocking air rifle with finished stock and elevated front sight",
    description: "Smooth underlever cocking air rifle with traditional finished stock and elevated front sight."
  },
  {
    id: "product-25",
    name: "Air Rifle (Made in Turkey)",
    category: "gun",
    price: 27500,
    image: "assets/images/product-25.webp",
    alt: "Turkish camo-dipped magnum air rifle engineered for high precision hunting",
    description: "Turkish camo-dipped magnum air rifle engineered for high precision hunting and field durability."
  },
  {
    id: "product-26",
    name: "Air Rifle (Made in Turkey)",
    category: "gun",
    price: 23500,
    image: "assets/images/product-26.webp",
    alt: "Camouflage finished Turkish air rifle with ergonomic stock geometry and high power",
    description: "Camouflage finished Turkish air rifle with ergonomic stock geometry and high power output."
  },
  {
    id: "product-27",
    name: "Universal Airgun Cleaning Kit",
    category: "accessory",
    price: 3200,
    image: "assets/images/product-27.webp",
    alt: "Complete air rifle cleaning kit with brass bore rods, phosphor bronze brushes, and case",
    description: "Complete universal air rifle barrel maintenance kit with multi-caliber brass rods, brushes, and carry box."
  },
  {
    id: "product-28",
    name: "Tactical Padded Rifle Sling",
    category: "accessory",
    price: 2400,
    image: "assets/images/product-28.webp",
    alt: "Tactical adjustable 2-point rifle sling with padded shoulder strap and quick-detach clips",
    description: "Durable 2-point adjustable rifle sling with heavy-duty metal swivels and padded breathable shoulder strap."
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
  return "Rs. " + price.toLocaleString("en-PK");
}
