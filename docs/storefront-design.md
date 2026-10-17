# Storefront and portal design

The shared visual system uses local, variable Vazirmatn typography, thin Lucide
icons, warm orange actions, grey text and restrained white/off-white surfaces.
AI workspaces retain their purpose-specific canvases. No new component library,
animation framework or runtime network dependency is introduced.

## Interaction principles

- Each screen has a clear primary action. Secondary information opens on demand.
- Preserve the homepage's hero, clients, catalogue categories, industries and
  brands. Remove the popular-products duplicate; rename utility products and
  condense company strengths into one small section.
- Search accepts a name, SKU or size. Category navigation preserves all taxonomy
  levels on desktop and mobile. Native dialogs provide focus containment,
  Escape dismissal and focus return for the mobile menu.
- Product detail is family based: selecting a SKU synchronizes its images,
  technical data and price; selecting a linked image selects that SKU. Shared
  family specifications remain distinct from SKU specifications. Detailed tables
  for small families are disclosed on demand.
- Product image retries use the same file on jsDelivr/GitHub, never a different
  product. Missing images and load failures have distinct messages.
- The cart shows item quantities, a clear total and next step, with a dedicated
  mobile checkout strip that avoids the bottom navigation. Demo inquiries are
  no longer presented as customer requests; inquiries and saved-product lists
  are isolated by user identity in the current browser.

## Portal additions

Both portals have customer-controlled saved products and a multi-SKU purchase
list. Input supports Persian/Arabic digits and validates up to 100 lines before
adding anything. Unknown/inactive SKUs, family-only identifiers and invalid
quantities are flagged. Unpriced items link to their SKU detail for inquiry;
priced items use the customer's active price list. Wholesale customers without
an assigned list receive no fabricated price. New menus, labels and visibility
are managed in Content Studio; disabling quick SKU ordering also disables the
multi-SKU tool. Existing account/CRM access separation is unchanged.

A default discovery card and quick links make empty dashboards useful. Publishing
CMS banners replaces the default discovery card; disabling promotional banners
hides it. Copy is editable in the portal label editor. The recent-order summary
contains only the signed-in customer's existing order records.

## Validation

TypeScript, authentication/content isolation and purchase-list validation tests,
plus real browser checks cover desktop, mobile, search, category dialogs, exact
SKU/image selection, saved products, bulk preview, populated cart quantities and
both portal roles. These changes do not add SMS credentials, AI credentials or a
new server-side checkout/order-processing implementation.
