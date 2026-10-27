/**
 * PAK AIR GUNS - Site Configuration
 * Single source of truth for global shop settings
 */

// ============================================================================
// MAINTENANCE MODE SWITCH:
// Set to `true` to put the website under Maintenance Mode (all pages redirect to maintenance.html)
// Set to `false` to turn maintenance mode off and restore full website access
// ============================================================================
const MAINTENANCE_MODE = false;

if (typeof window !== 'undefined' && MAINTENANCE_MODE) {
  const currentPath = window.location.pathname;
  const isMaintenancePage = currentPath.endsWith('maintenance.html') || window.location.href.includes('maintenance.html');
  if (!isMaintenancePage) {
    if (document.documentElement) {
      document.documentElement.style.display = 'none';
    }
    window.location.replace('maintenance.html');
  }
}

const WHATSAPP_NUMBER = "923102157098";
const DELIVERY_CHARGES = 1500;

const SHOP_CONFIG = {
  shopName: "PAK AIR GUNS",
  tagline: "Premier Air Guns, Scopes & Hunting Gear in Pakistan",
  address: "Shop # 16, Main Wagah Road, Lahore, Pakistan",
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappDisplay: "+92 310 2157098",
  deliveryCharges: DELIVERY_CHARGES,
  deliveryPolicy: "Delivery all over Pakistan: Rs 1,500.",
  paymentPolicy: "Open the parcel first, then send the remaining payment.",
  currency: "Rs",
  currencySymbol: "Rs."
};
