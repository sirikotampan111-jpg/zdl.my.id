/**
 * Centralized business configuration for Zheng Digital Studio
 * All hardcoded business values should be referenced from here
 */

// WhatsApp
export const WHATSAPP_NUMBER = "6288973745596";
export const WHATSAPP_DISPLAY = "0889-7374-5596";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

// Bank
export const BANK_NAME = "Seabank";
export const BANK_ACCOUNT = "901913604812";

// Address
export const BUSINESS_ADDRESS =
  "Kp. Jawaringan, RT.003/RW.004, Mekar Bakti, Kec. Panongan, Kabupaten Tangerang, Banten 17510";
export const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/xFZmgdisDB2uDjTb6";
export const GOOGLE_MAPS_EMBED =
  "https://maps.google.com/maps?q=Kp.+Jawaringan+Mekar+Bakti+Panongan+Tangerang+Banten+17510&t=&z=15&ie=UTF8&iwloc=&output=embed";

// Site
export const SITE_NAME = "Zheng Digital Studio";
export const SITE_DOMAIN = "zds.asia";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || `https://${SITE_DOMAIN}`;
export const COMPANY_NAME = "Zheng Digital Studio";
