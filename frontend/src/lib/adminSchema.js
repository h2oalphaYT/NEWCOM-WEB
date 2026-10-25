// Field definitions for the admin screens. Keys match the NEWCOM_WEB columns and the backend
// resource names in backend/controllers/web_crud.go.

const yesNo = { type: "bool" };
const STAGES = ["Submitted", "Received at service centre", "Diagnosis", "Repair or replacement", "Ready for collection"];

export const sections = [
  { group: "Storefront", items: [
    { res: "banners", label: "Banners" },
    { res: "promotions", label: "Promotions" },
    { res: "prebuilt", label: "Pre-built PCs" },
    { res: "categories", label: "Shop categories" },
    { res: "itemcontent", label: "Product content" },
    { res: "itemimages", label: "Product images" },
  ] },
  { group: "Sales and support", items: [
    { res: "orders", label: "Orders" },
    { res: "claims", label: "Warranty claims" },
    { res: "bookings", label: "Service bookings" },
    { res: "customers", label: "Customers" },
    { res: "newsletter", label: "Newsletter" },
  ] },
  { group: "System", items: [
    { res: "settings", label: "Settings" },
  ] },
];

export const schemas = {
  banners: {
    title: "Banners", singular: "banner", pk: "BannerId",
    help: "Home hero slides (home-hero) and promo strips under the hero (home-strip). Active banners inside their date range show on the site. While no home-hero banner is active, the built-in video slide is shown.",
    list: ["Title", "Placement", "MediaType", "IsActive", "StartDate", "EndDate", "SortOrder"],
    fields: [
      { key: "Placement", type: "select", options: ["home-hero", "home-strip", "category-top"], required: true, default: "home-hero" },
      { key: "Eyebrow", label: "Small label above the title" },
      { key: "Title", required: true },
      { key: "Subtitle", type: "textarea" },
      { key: "MediaType", type: "select", options: ["image", "video"], required: true, default: "image" },
      { key: "MediaUrl", label: "Image or video", type: "media" },
      { key: "PosterUrl", label: "Video poster (shown while loading)", type: "media" },
      { key: "ButtonText" }, { key: "ButtonUrl", placeholder: "/products" },
      { key: "Button2Text" }, { key: "Button2Url", placeholder: "/pc-builder" },
      { key: "StartDate", type: "date" }, { key: "EndDate", type: "date" },
      { key: "SortOrder", type: "number", default: 0 },
      { key: "IsActive", label: "Active", ...yesNo, default: true },
    ],
  },
  promotions: {
    title: "Promotions", singular: "promotion", pk: "PromotionId",
    help: "Website-only offers. Without a promo code, the discount applies automatically to the listed items while the promotion is active (a special price on an item overrides it). With a promo code, it applies only when the customer enters the code at checkout: to the listed items, or to the whole cart when no items are listed. Tick 'Show in top bar' to advertise the code in the announcement bar.",
    list: ["Name", "PromoCode", "BadgeText", "DiscountType", "DiscountValue", "ShowInBar", "IsActive", "EndDate"],
    fields: [
      { key: "Name", required: true },
      { key: "Slug", required: true, slugFrom: "Name" },
      { key: "Description", type: "textarea" },
      { key: "BadgeText", label: "Badge on product cards", placeholder: "10% off" },
      { key: "DiscountType", type: "select", options: ["percent", "fixed", "price"], required: true, default: "percent" },
      { key: "DiscountValue", type: "money", label: "Discount (percent, LKR off, or fixed LKR price)" },
      { key: "PromoCode", label: "Promo code (optional, e.g. NEWCOM5)", upper: true },
      { key: "MinOrder", type: "money", label: "Minimum order for the code (LKR, optional)" },
      { key: "ShowInBar", label: "Show the code in the top bar", type: "bool" },
      { key: "ImageUrl", label: "Promotion image", type: "media" },
      { key: "StartDate", type: "date" }, { key: "EndDate", type: "date" },
      { key: "SortOrder", type: "number", default: 0 },
      { key: "IsActive", label: "Active", ...yesNo, default: true },
    ],
    items: { label: "Items in this promotion", columns: [
      { key: "ItemCode", type: "item", required: true },
      { key: "SpecialPrice", type: "money", label: "Special price (optional)" },
    ] },
  },
  prebuilt: {
    title: "Pre-built PCs", singular: "pre-built PC", pk: "PrebuiltId",
    help: "Ready-made builds shown on the home page and under Desktop PCs. Link parts to inventory items so price and stock stay live; leave Price empty to use the sum of the parts.",
    list: ["Name", "Tier", "UseCase", "Platform", "Price", "IsFeatured", "IsActive"],
    fields: [
      { key: "Name", required: true },
      { key: "Slug", required: true, slugFrom: "Name" },
      { key: "Tagline" },
      { key: "Tier", type: "select", options: ["", "Budget", "Mid range", "High end", "Workstation"] },
      { key: "UseCase", label: "Use", type: "select", options: ["", "Gaming", "Creator", "Office", "Student", "Streaming"] },
      { key: "Platform", type: "select", options: ["", "intel", "amd"] },
      { key: "Description", type: "textarea" },
      { key: "ImageUrl", label: "Photo", type: "media" },
      { key: "Price", type: "money", label: "Fixed price (empty = sum of parts)" },
      { key: "IsFeatured", label: "Featured on home page", ...yesNo },
      { key: "IsActive", label: "Active", ...yesNo, default: true },
      { key: "SortOrder", type: "number", default: 0 },
    ],
    items: { label: "Parts", columns: [
      { key: "Slot", type: "select", options: ["cpu", "mb", "ram", "gpu", "ssd", "hdd", "psu", "case", "cooler", "fans", "os", "other"], required: true, default: "cpu" },
      { key: "ItemCode", type: "item", fills: "PartName" },
      { key: "PartName", label: "Part name", required: true },
      { key: "Qty", type: "number", default: 1 },
    ] },
  },
  categories: {
    title: "Shop categories", singular: "category", pk: "CategoryId",
    help: "Clean categories for the shop menu. Map each to one or more inventory category codes (comma separated); the search keyword is used when those categories are empty.",
    list: ["Name", "Slug", "InventoryCategoryCodes", "SearchKeyword", "IsVisible", "SortOrder"],
    fields: [
      { key: "Name", required: true }, { key: "Slug", required: true, slugFrom: "Name" },
      { key: "ParentId", type: "number", label: "Parent category ID (optional)" },
      { key: "InventoryCategoryCodes", label: "Inventory category codes", placeholder: "CAT0000060,VGA" },
      { key: "SearchKeyword", placeholder: "graphic" },
      { key: "ImageUrl", label: "Image", type: "media" },
      { key: "SortOrder", type: "number", default: 0 },
      { key: "IsVisible", label: "Visible", ...yesNo, default: true },
    ],
  },
  itemcontent: {
    title: "Product content", singular: "product content", pk: "ItemCode", pkEditable: true,
    help: "Website text for an inventory item: a cleaner title, brand, description and specs. 'Hidden' removes the item from the website without touching the inventory.",
    list: ["ItemCode", "Title", "Brand", "IsFeatured", "IsNewArrival", "IsHidden"],
    fields: [
      { key: "ItemCode", type: "item", required: true, createOnly: true },
      { key: "Title" }, { key: "Brand" },
      { key: "Description", type: "textarea" },
      { key: "SpecsJson", label: "Specs (JSON, e.g. {\"Socket\":\"AM5\"})", type: "textarea" },
      { key: "IsFeatured", label: "Featured", ...yesNo },
      { key: "IsNewArrival", label: "New arrival", ...yesNo },
      { key: "IsHidden", label: "Hide from website", ...yesNo },
      { key: "SeoTitle" }, { key: "SeoDescription", type: "textarea" },
    ],
  },
  itemimages: {
    title: "Product images", singular: "image", pk: "ImageId",
    help: "Extra or replacement photos for inventory items. The primary image replaces the inventory image on the website.",
    list: ["ItemCode", "ImageUrl", "IsPrimary", "SortOrder"],
    fields: [
      { key: "ItemCode", type: "item", required: true },
      { key: "ImageUrl", label: "Image", type: "media", required: true },
      { key: "AltText" },
      { key: "SortOrder", type: "number", default: 0 },
      { key: "IsPrimary", label: "Primary image", ...yesNo },
    ],
  },
  settings: {
    title: "Settings", singular: "setting", pk: "SettingKey", pkEditable: true,
    help: "Site-wide values such as the announcement bar text, WhatsApp number and delivery fee.",
    list: ["SettingKey", "SettingValue", "IsPublic"],
    fields: [
      { key: "SettingKey", required: true, createOnly: true },
      { key: "SettingValue", type: "textarea" },
      { key: "IsPublic", label: "Visible to the website", ...yesNo, default: true },
    ],
  },
  orders: {
    title: "Orders", singular: "order", pk: "OrderId", readOnlyCreate: true, statuses: ["new", "confirmed", "paid", "shipped", "completed", "cancelled"],
    help: "Website orders. Prices were set by the server from the live inventory at checkout.",
    list: ["OrderNo", "Name", "Mobile", "Total", "PaymentMethod", "Status", "CreatedAt"],
    fields: [
      ...["OrderNo", "Name", "Email", "Mobile", "Address", "City", "District", "Province", "DeliveryMethod", "PaymentMethod", "SubTotal", "PromoCode", "Discount", "DeliveryFee", "Total", "Notes", "CreatedAt"].map((k) => ({ key: k, readOnly: true, type: ["SubTotal", "Discount", "DeliveryFee", "Total"].includes(k) ? "money" : k === "CreatedAt" ? "date" : "text" })),
      { key: "Status", type: "select", options: ["new", "confirmed", "paid", "shipped", "completed", "cancelled"], required: true },
      { key: "AdminNote", label: "Internal note", type: "textarea" },
    ],
    items: { label: "Lines", readOnly: true, columns: [{ key: "ItemCode" }, { key: "ItemName" }, { key: "UnitPrice", type: "money" }, { key: "Qty" }, { key: "LineTotal", type: "money" }] },
  },
  claims: {
    title: "Warranty claims", singular: "claim", pk: "ClaimId", readOnlyCreate: true, statuses: ["open", "closed", "rejected"],
    help: "Claims submitted on the website. Moving the stage updates the customer's tracking page.",
    list: ["TicketNo", "Name", "Mobile", "Product", "Stage", "Status", "CreatedAt"],
    fields: [
      ...["TicketNo", "Name", "Mobile", "Email", "InvoiceNo", "Product", "SerialNo", "Issue", "Branch", "CreatedAt"].map((k) => ({ key: k, readOnly: true, type: k === "CreatedAt" ? "date" : k === "Issue" ? "textarea" : "text" })),
      { key: "Stage", type: "select", options: STAGES.map((s, i) => ({ value: i, label: `${i + 1}. ${s}` })) },
      { key: "Status", type: "select", options: ["open", "closed", "rejected"], required: true },
      { key: "AdminNote", label: "Internal note", type: "textarea" },
    ],
  },
  bookings: {
    title: "Service bookings", singular: "booking", pk: "BookingId", readOnlyCreate: true, statuses: ["new", "confirmed", "done", "cancelled"],
    list: ["Service", "Name", "Mobile", "Device", "PreferredDate", "Status", "CreatedAt"],
    fields: [
      ...["Service", "Name", "Mobile", "Device", "PreferredDate", "Branch", "Details", "CreatedAt"].map((k) => ({ key: k, readOnly: true, type: ["PreferredDate", "CreatedAt"].includes(k) ? "date" : k === "Details" ? "textarea" : "text" })),
      { key: "Status", type: "select", options: ["new", "confirmed", "done", "cancelled"], required: true },
      { key: "AdminNote", label: "Internal note", type: "textarea" },
    ],
  },
  customers: {
    title: "Customers", singular: "customer", pk: "CustomerId", readOnlyCreate: true,
    help: "Everyone who registered or checked out with an email address.",
    list: ["Name", "Email", "Mobile", "City", "NewsletterOptIn", "CreatedAt"],
    fields: [
      { key: "Email", readOnly: true }, { key: "Name", required: true }, { key: "Mobile" }, { key: "Address" }, { key: "City" }, { key: "District" }, { key: "Province" },
      { key: "NewsletterOptIn", label: "Newsletter", ...yesNo },
      { key: "CreatedAt", readOnly: true, type: "date" }, { key: "LastLoginAt", readOnly: true, type: "date" },
    ],
  },
  newsletter: {
    title: "Newsletter", singular: "subscriber", pk: "SubscriberId", readOnlyCreate: true,
    list: ["Email", "ConsentAt", "IsActive"],
    fields: [{ key: "Email", readOnly: true }, { key: "ConsentAt", readOnly: true, type: "date" }, { key: "IsActive", label: "Subscribed", ...yesNo }],
  },
};

export const labelOf = (key) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^Is /, "").replace(/ Url$/, "");
