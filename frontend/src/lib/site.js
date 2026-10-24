// Contact details taken from https://www.newcom.lk/ and /contact (checked 2026-10-25).
export const site = {
  name: "Newcom",
  legalName: "Newcom Computer Systems PVT LTD",
  tagline: "Enrich Life Through Technology",
  address: "517 2/1, Mayfair House, First Floor, Galle Road, Colombo 04, Sri Lanka",
  phone: "0112 588 000",
  phoneHref: "tel:+94112588000",
  whatsapp: "070 603 8927",
  whatsappNumber: "94706038927",
  email: "info@newcom.lk",
  hours: [
    { days: "Monday to Friday", time: "9:00 AM to 6:00 PM" },
    { days: "Saturday", time: "9:00 AM to 2:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  social: {
    facebook: "https://www.facebook.com/newcom.lk",
    instagram: "https://www.instagram.com/newcom.lk/",
  },
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9627718425645!2d79.85258847581777!3d6.895056518732384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25b7245094923%3A0xdfec30948a34429b!2sNEWCOM%20COMPUTER%20SYSTEMS%20PVT%20LTD!5e0!3m2!1sen!2slk!4v1757997668579!5m2!1sen!2slk",
};

export const whatsappLink = (text) =>
  `https://wa.me/${site.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const lkr = (n) => "LKR " + Number(n || 0).toLocaleString("en-US");
