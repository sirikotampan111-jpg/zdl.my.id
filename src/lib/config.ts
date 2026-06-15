/**
 * Centralized business configuration for Zheng Digital Lab
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
export const GOOGLE_MAPS_LINK = "https://www.google.com/maps?q=Zheng+Digital+Lab";
export const GOOGLE_MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3966.041578037104!2d106.5153282!3d-6.2582536!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4207fd7fbd2135%3A0xe4b883bfb89f7185!2sZheng%20digital%20lab!5e0!3m2!1sid!2sid!4v1781533483148!5m2!1sid!2sid";

// Site
export const SITE_NAME = "Zheng Digital Lab";
export const SITE_DOMAIN = "zdl.my.id";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || `https://${SITE_DOMAIN}`;
export const COMPANY_NAME = "Zheng Digital Lab";
