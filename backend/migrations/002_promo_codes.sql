-- Promo codes: a promotion with a PromoCode only applies at checkout when the customer enters
-- the code (on its listed items, or the whole cart when it lists none). ShowInBar puts the code
-- in the announcement bar at the top of the site. Idempotent.

IF COL_LENGTH('dbo.WebPromotion', 'PromoCode') IS NULL
  ALTER TABLE dbo.WebPromotion ADD PromoCode NVARCHAR(40) NULL;
GO
IF COL_LENGTH('dbo.WebPromotion', 'MinOrder') IS NULL
  ALTER TABLE dbo.WebPromotion ADD MinOrder DECIMAL(18,2) NULL;      -- minimum cart subtotal for the code
GO
IF COL_LENGTH('dbo.WebPromotion', 'ShowInBar') IS NULL
  ALTER TABLE dbo.WebPromotion ADD ShowInBar BIT NOT NULL CONSTRAINT DF_WebPromotion_ShowInBar DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_WebPromotion_PromoCode')
  CREATE UNIQUE INDEX UX_WebPromotion_PromoCode ON dbo.WebPromotion(PromoCode) WHERE PromoCode IS NOT NULL;
GO
IF COL_LENGTH('dbo.WebOrder', 'PromoCode') IS NULL
  ALTER TABLE dbo.WebOrder ADD PromoCode NVARCHAR(40) NULL;
GO
