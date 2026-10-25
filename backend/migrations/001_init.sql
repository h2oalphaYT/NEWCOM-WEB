-- NEWCOM_WEB: website-only data (content, promotions, customers, orders, support).
-- The inventory database (NEWCOM) is never written to by the website.
-- Idempotent: every object is created only if it does not exist yet. Batches are separated by GO.

IF OBJECT_ID('dbo.WebAdminUser') IS NULL
CREATE TABLE dbo.WebAdminUser (
  AdminId       INT IDENTITY(1,1) PRIMARY KEY,
  Email         NVARCHAR(200) NOT NULL UNIQUE,
  Name          NVARCHAR(120) NOT NULL,
  PasswordHash  NVARCHAR(200) NOT NULL,
  Role          NVARCHAR(20)  NOT NULL DEFAULT 'admin',      -- admin | editor
  IsActive      BIT           NOT NULL DEFAULT 1,
  CreatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
  LastLoginAt   DATETIME2     NULL
);
GO

IF OBJECT_ID('dbo.WebBanner') IS NULL
CREATE TABLE dbo.WebBanner (
  BannerId     INT IDENTITY(1,1) PRIMARY KEY,
  Placement    NVARCHAR(40)  NOT NULL DEFAULT 'home-hero',   -- home-hero | home-strip | category-top
  Eyebrow      NVARCHAR(80)  NULL,
  Title        NVARCHAR(200) NOT NULL,
  Subtitle     NVARCHAR(400) NULL,
  MediaType    NVARCHAR(10)  NOT NULL DEFAULT 'image',       -- image | video
  MediaUrl     NVARCHAR(500) NULL,
  PosterUrl    NVARCHAR(500) NULL,
  ButtonText   NVARCHAR(60)  NULL,
  ButtonUrl    NVARCHAR(300) NULL,
  Button2Text  NVARCHAR(60)  NULL,
  Button2Url   NVARCHAR(300) NULL,
  StartDate    DATETIME2     NULL,
  EndDate      DATETIME2     NULL,
  SortOrder    INT           NOT NULL DEFAULT 0,
  IsActive     BIT           NOT NULL DEFAULT 1,
  CreatedAt    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID('dbo.WebPromotion') IS NULL
CREATE TABLE dbo.WebPromotion (
  PromotionId   INT IDENTITY(1,1) PRIMARY KEY,
  Name          NVARCHAR(160) NOT NULL,
  Slug          NVARCHAR(160) NOT NULL UNIQUE,
  Description   NVARCHAR(1000) NULL,
  BadgeText     NVARCHAR(40)  NULL,                          -- shown on product cards, e.g. "10% off"
  DiscountType  NVARCHAR(10)  NOT NULL DEFAULT 'percent',    -- percent | fixed | price
  DiscountValue DECIMAL(18,2) NOT NULL DEFAULT 0,
  ImageUrl      NVARCHAR(500) NULL,
  StartDate     DATETIME2     NULL,
  EndDate       DATETIME2     NULL,
  SortOrder     INT           NOT NULL DEFAULT 0,
  IsActive      BIT           NOT NULL DEFAULT 1,
  CreatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID('dbo.WebPromotionItem') IS NULL
CREATE TABLE dbo.WebPromotionItem (
  PromotionId  INT           NOT NULL REFERENCES dbo.WebPromotion(PromotionId) ON DELETE CASCADE,
  ItemCode     NVARCHAR(20)  NOT NULL,                       -- inventory cItemCode
  SpecialPrice DECIMAL(18,2) NULL,                           -- overrides the discount for this item
  PRIMARY KEY (PromotionId, ItemCode)
);
GO

IF OBJECT_ID('dbo.WebPrebuiltPc') IS NULL
CREATE TABLE dbo.WebPrebuiltPc (
  PrebuiltId   INT IDENTITY(1,1) PRIMARY KEY,
  Name         NVARCHAR(160) NOT NULL,
  Slug         NVARCHAR(160) NOT NULL UNIQUE,
  Tagline      NVARCHAR(200) NULL,
  Tier         NVARCHAR(40)  NULL,                           -- Budget | Mid range | High end | Workstation
  UseCase      NVARCHAR(80)  NULL,                           -- Gaming | Creator | Office | Student
  Platform     NVARCHAR(10)  NULL,                           -- intel | amd
  Description  NVARCHAR(MAX) NULL,
  ImageUrl     NVARCHAR(500) NULL,
  Price        DECIMAL(18,2) NULL,                           -- NULL = sum of the parts
  IsFeatured   BIT           NOT NULL DEFAULT 0,
  IsActive     BIT           NOT NULL DEFAULT 1,
  SortOrder    INT           NOT NULL DEFAULT 0,
  CreatedAt    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID('dbo.WebPrebuiltPcPart') IS NULL
CREATE TABLE dbo.WebPrebuiltPcPart (
  PartId      INT IDENTITY(1,1) PRIMARY KEY,
  PrebuiltId  INT           NOT NULL REFERENCES dbo.WebPrebuiltPc(PrebuiltId) ON DELETE CASCADE,
  Slot        NVARCHAR(20)  NOT NULL,                        -- cpu | mb | ram | gpu | ssd | hdd | psu | case | cooler | fans | os | other
  ItemCode    NVARCHAR(20)  NULL,                            -- inventory item, when linked
  PartName    NVARCHAR(200) NOT NULL,
  Qty         INT           NOT NULL DEFAULT 1,
  SortOrder   INT           NOT NULL DEFAULT 0
);
GO

IF OBJECT_ID('dbo.WebCategory') IS NULL
CREATE TABLE dbo.WebCategory (
  CategoryId              INT IDENTITY(1,1) PRIMARY KEY,
  Name                    NVARCHAR(120) NOT NULL,
  Slug                    NVARCHAR(120) NOT NULL UNIQUE,
  ParentId                INT NULL REFERENCES dbo.WebCategory(CategoryId),
  InventoryCategoryCodes  NVARCHAR(400) NULL,              -- comma-separated cCategoryCode list
  SearchKeyword           NVARCHAR(80)  NULL,              -- fallback name search
  ImageUrl                NVARCHAR(500) NULL,
  SortOrder               INT NOT NULL DEFAULT 0,
  IsVisible               BIT NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.WebItemContent') IS NULL
CREATE TABLE dbo.WebItemContent (
  ItemCode        NVARCHAR(20)  PRIMARY KEY,
  Brand           NVARCHAR(80)  NULL,
  Title           NVARCHAR(200) NULL,
  Description     NVARCHAR(MAX) NULL,
  SpecsJson       NVARCHAR(MAX) NULL,
  IsFeatured      BIT NOT NULL DEFAULT 0,
  IsNewArrival    BIT NOT NULL DEFAULT 0,
  IsHidden        BIT NOT NULL DEFAULT 0,
  SeoTitle        NVARCHAR(200) NULL,
  SeoDescription  NVARCHAR(400) NULL,
  UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID('dbo.WebItemImage') IS NULL
CREATE TABLE dbo.WebItemImage (
  ImageId    INT IDENTITY(1,1) PRIMARY KEY,
  ItemCode   NVARCHAR(20)  NOT NULL,
  ImageUrl   NVARCHAR(500) NOT NULL,
  AltText    NVARCHAR(200) NULL,
  SortOrder  INT NOT NULL DEFAULT 0,
  IsPrimary  BIT NOT NULL DEFAULT 0
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_WebItemImage_ItemCode')
  CREATE INDEX IX_WebItemImage_ItemCode ON dbo.WebItemImage(ItemCode);
GO

IF OBJECT_ID('dbo.WebCustomer') IS NULL
CREATE TABLE dbo.WebCustomer (
  CustomerId      INT IDENTITY(1,1) PRIMARY KEY,
  Email           NVARCHAR(200) NOT NULL UNIQUE,
  Name            NVARCHAR(120) NOT NULL,
  Mobile          NVARCHAR(20)  NULL,
  PasswordHash    NVARCHAR(200) NULL,                        -- NULL for guest checkouts
  Address         NVARCHAR(300) NULL,
  City            NVARCHAR(80)  NULL,
  District        NVARCHAR(80)  NULL,
  Province        NVARCHAR(40)  NULL,
  NewsletterOptIn BIT NOT NULL DEFAULT 0,
  CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  LastLoginAt     DATETIME2 NULL
);
GO

IF OBJECT_ID('dbo.WebOrder') IS NULL
CREATE TABLE dbo.WebOrder (
  OrderId         INT IDENTITY(1,1) PRIMARY KEY,
  OrderNo         NVARCHAR(20)  NOT NULL UNIQUE,
  CustomerId      INT NULL REFERENCES dbo.WebCustomer(CustomerId),
  Name            NVARCHAR(120) NOT NULL,
  Email           NVARCHAR(200) NULL,
  Mobile          NVARCHAR(20)  NOT NULL,
  Address         NVARCHAR(300) NULL,
  City            NVARCHAR(80)  NULL,
  District        NVARCHAR(80)  NULL,
  Province        NVARCHAR(40)  NULL,
  DeliveryMethod  NVARCHAR(30)  NOT NULL DEFAULT 'delivery',  -- delivery | pickup
  PaymentMethod   NVARCHAR(30)  NOT NULL,                     -- card | koko | mintpay | bank | store
  Status          NVARCHAR(20)  NOT NULL DEFAULT 'new',       -- new | confirmed | paid | shipped | completed | cancelled
  SubTotal        DECIMAL(18,2) NOT NULL DEFAULT 0,
  Discount        DECIMAL(18,2) NOT NULL DEFAULT 0,
  DeliveryFee     DECIMAL(18,2) NOT NULL DEFAULT 0,
  Total           DECIMAL(18,2) NOT NULL DEFAULT 0,
  Notes           NVARCHAR(1000) NULL,
  AdminNote       NVARCHAR(1000) NULL,
  CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID('dbo.WebOrderLine') IS NULL
CREATE TABLE dbo.WebOrderLine (
  OrderLineId  INT IDENTITY(1,1) PRIMARY KEY,
  OrderId      INT NOT NULL REFERENCES dbo.WebOrder(OrderId) ON DELETE CASCADE,
  ItemCode     NVARCHAR(40)  NOT NULL,
  ItemName     NVARCHAR(250) NOT NULL,
  UnitPrice    DECIMAL(18,2) NOT NULL,
  Qty          INT NOT NULL,
  LineTotal    DECIMAL(18,2) NOT NULL
);
GO

IF OBJECT_ID('dbo.WebWarrantyClaim') IS NULL
CREATE TABLE dbo.WebWarrantyClaim (
  ClaimId     INT IDENTITY(1,1) PRIMARY KEY,
  TicketNo    NVARCHAR(20)  NOT NULL UNIQUE,
  CustomerId  INT NULL REFERENCES dbo.WebCustomer(CustomerId),
  Name        NVARCHAR(120) NOT NULL,
  Mobile      NVARCHAR(20)  NOT NULL,
  Email       NVARCHAR(200) NULL,
  InvoiceNo   NVARCHAR(60)  NOT NULL,
  Product     NVARCHAR(200) NOT NULL,
  SerialNo    NVARCHAR(80)  NOT NULL,
  Issue       NVARCHAR(2000) NOT NULL,
  Branch      NVARCHAR(60)  NULL,
  Stage       INT NOT NULL DEFAULT 0,                         -- 0 submitted .. 4 ready for collection
  Status      NVARCHAR(20) NOT NULL DEFAULT 'open',           -- open | closed | rejected
  AdminNote   NVARCHAR(1000) NULL,
  CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID('dbo.WebServiceBooking') IS NULL
CREATE TABLE dbo.WebServiceBooking (
  BookingId     INT IDENTITY(1,1) PRIMARY KEY,
  Service       NVARCHAR(80)  NOT NULL,
  Name          NVARCHAR(120) NOT NULL,
  Mobile        NVARCHAR(20)  NOT NULL,
  Device        NVARCHAR(200) NOT NULL,
  PreferredDate DATE NULL,
  Branch        NVARCHAR(60) NULL,
  Details       NVARCHAR(2000) NULL,
  Status        NVARCHAR(20) NOT NULL DEFAULT 'new',          -- new | confirmed | done | cancelled
  AdminNote     NVARCHAR(1000) NULL,
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

IF OBJECT_ID('dbo.WebNewsletter') IS NULL
CREATE TABLE dbo.WebNewsletter (
  SubscriberId  INT IDENTITY(1,1) PRIMARY KEY,
  Email         NVARCHAR(200) NOT NULL UNIQUE,
  ConsentAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  IsActive      BIT NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.WebSetting') IS NULL
CREATE TABLE dbo.WebSetting (
  SettingKey    NVARCHAR(80) PRIMARY KEY,
  SettingValue  NVARCHAR(MAX) NULL,
  IsPublic      BIT NOT NULL DEFAULT 1,
  UpdatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- default settings (only inserted the first time)
IF NOT EXISTS (SELECT 1 FROM dbo.WebSetting WHERE SettingKey = 'announcement')
  INSERT INTO dbo.WebSetting (SettingKey, SettingValue) VALUES ('announcement', N'Island-wide delivery · Manufacturer warranty on all products');
IF NOT EXISTS (SELECT 1 FROM dbo.WebSetting WHERE SettingKey = 'whatsapp')
  INSERT INTO dbo.WebSetting (SettingKey, SettingValue) VALUES ('whatsapp', N'94706038927');
IF NOT EXISTS (SELECT 1 FROM dbo.WebSetting WHERE SettingKey = 'delivery_fee')
  INSERT INTO dbo.WebSetting (SettingKey, SettingValue) VALUES ('delivery_fee', N'0');
GO
