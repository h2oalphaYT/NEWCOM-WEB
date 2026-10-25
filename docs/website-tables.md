# Website-only tables: recommendation

The website reads the inventory database and never writes to it. Everything below is content the
**website** needs that the inventory system does not hold today. Recommended approach: create these as
`tblWeb…` tables in the same database (or a small separate `NEWCOM_WEB` database), edited from a small
admin page in the inventory app or a website admin, and read by the website API through `fxWeb…` functions,
the same pattern the inventory already uses.

## Recommended now (in priority order)

| # | Table | What it is for | Key columns |
|---|---|---|---|
| 1 | `tblWebCategory` | Clean shop categories. The inventory has 64 categories including test/dummy ones ("test", "Example #1", "Dummy 1…6 Network Accessories") and some items sit in the wrong one (an RTX 3050 is under "Computer Peripherals"). This table maps inventory categories to the menu the shopper sees and hides the rest. | WebCategoryId, Name, Slug, ParentId, InventoryCategoryCodes (list), ImageUrl, SortOrder, IsVisible |
| 2 | `tblWebItemImage` | More than one photo per item, plus a manual override when the inventory image is missing or poor. Today only one `vcItemImage` exists and many items have none. | ItemCode, ImageUrl / S3Key, SortOrder, IsPrimary, AltText |
| 3 | `tblWebItemContent` | Website-only product content: marketing title, full description, key specs (socket, RAM type, wattage, screen size…), brand, and SEO fields. Needed for real filters, comparison and the PC builder's compatibility checks. | ItemCode, Brand, Title, Description (markdown), SpecsJson, SeoTitle, SeoDescription, IsFeatured, IsNewArrival |
| 4 | `tblWebBanner` | Home hero slides and promo banners (image or video, headline, button link), with a schedule so they switch on and off by themselves. | BannerId, Placement (home-hero, home-mid, category-top), Title, Subtitle, MediaUrl, LinkUrl, StartDate, EndDate, SortOrder, IsActive |
| 5 | `tblWebPromotion` + `tblWebPromotionItem` | Website promotions such as "10% off GPUs this week" and bundle deals, shown as badges and sale prices. Keeps website offers separate from in-store pricing. | PromotionId, Name, Type (percent, fixed, bundle), Value, StartDate, EndDate, IsActive; PromotionItem: PromotionId, ItemCode or CategoryId |
| 6 | `tblWebPcBuilderPart` | Marks which items appear in the PC builder, under which slot, with the specs the compatibility checks need (socket, RAM generation, form factor, GPU length, wattage, cooler height). | ItemCode, Slot, Platform, Socket, RamType, FormFactor, LengthMm, Watts, SpecsJson |

## Recommended when the matching feature goes live

| Table | Needed for |
|---|---|
| `tblWebOrder` + `tblWebOrderLine` | Online checkout (cart → order) before it is pushed into the inventory as an invoice. |
| `tblWebCustomer` | Customer accounts, saved addresses and order history. The Web-Service `spMastCustomerSaveApi` could be reused here. |
| `tblWebWarrantyClaim` + `tblWebWarrantyStatus` | The warranty claim portal: real ticket numbers, status history and email updates. Today claims are kept only in the browser. |
| `tblWebServiceBooking` | Repair and service bookings, so they are tracked instead of only sent by WhatsApp. |
| `tblWebReview` | Reviews cached from Google, or written by customers who bought the item. |
| `tblWebNewsletter` | Newsletter sign-ups with consent date. |
| `tblWebBranch` | Branch details (address, hours, map link) and per-branch stock display, once more branches than Colombo are confirmed. |
| `tblWebSavedBuild` | PC builds saved and shared by customers (today the share link carries the parts in the URL). |
| `tblWebSetting` | Site settings such as the announcement bar text, WhatsApp number and delivery fee rules, so they can change without a code release. |

## Notes

- Keep these tables out of the inventory's own save procedures; the website API should only get read access
  to inventory tables, plus write access to `tblWeb…` tables when orders or claims go live.
- The website API currently connects as `sa`. Before launch, create a login that can only `SELECT` and run the
  `fx…` functions it needs.
