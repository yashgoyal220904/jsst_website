/**
 * Stripe Payment Integration Configuration
 * 
 * Configure your Stripe Publishable Key and Stripe Price IDs here.
 * If VITE_STRIPE_PUBLISHABLE_KEY is provided in your environment variables (.env file)
 * and USE_REAL_STRIPE is set to true, checking out will redirect customers to 
 * Stripe's official secure payment page.
 * 
 * By default, this is disabled and the checkout will use a highly detailed, 
 * interactive Stripe Sandbox Simulator (with OTP simulation) so the application
 * runs out-of-the-box on static servers.
 */

export const STRIPE_CONFIG = {
  // Toggle to switch between Stripe Checkout redirect and Stripe Elements Sandbox Simulation
  USE_REAL_STRIPE: false,

  // Stripe Publishable Key (e.g. "pk_test_...")
  // Can be hardcoded here or loaded from environment variables (recommended)
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",

  // Mapping of local product IDs to Stripe Price IDs (created in your Stripe Dashboard)
  // Required only if USE_REAL_STRIPE is true
  PRICE_IDS: {
    "iphone-15-pro-max": "price_1PabcXYZexample001",
    "samsung-s24-ultra": "price_1PabcXYZexample002",
    "oneplus-12": "price_1PabcXYZexample003",
    "xiaomi-14": "price_1PabcXYZexample004",
    "vivo-x100-pro": "price_1PabcXYZexample005",
    "realme-gt-5-pro": "price_1PabcXYZexample006",
    "google-pixel-8-pro": "price_1PabcXYZexample007"
  }
};
