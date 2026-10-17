# Catalogue imported from the customer workbook

Source: `New Microsoft Excel Worksheet.xlsx`, Sheet1, rows 2–1384. The checksum and totals are recorded in `src/data/catalogueImport.json`.

- All 1,383 family rows and 10,435 unique SKU records are preserved in `catalogueSource.json`, including original Arabic/Persian spellings, sizes, brands, profiles, units, materials, source classification status and filter suggestions.
- Navigation uses only the main category, submenu and technical-type columns: 29 / 64 / 90. Family names and individual SKU descriptions do not populate the mega menu.
- Each family has a stable `FAM-<first SKU>` page. Its searchable, paginated table lists every original SKU, size and description. Selecting a row carries that SKU into the existing inquiry workflow. Direct SKU URLs resolve to their family and select the requested SKU.
- The source does not include prices or inventory. Products require inquiry, inventory is marked unknown, and no ratings, certifications or technical performance claims are synthesized.
- The old generated 864-product dataset and its unreliable image/name associations are replaced. Historical source remains in Git history. Old AT-E identifiers are not aliased to unrelated products.

## Image review

All 869 `e(N).png` assets in `javanweb/imagesatlas` were visually screened in nine indexed contact sheets. Only 25 conservative family-level matches are enabled in `catalogueImages.json`. Each whitelist entry identifies the family, filename and review scope. These are **family examples**, not verification of a specific size, manufacturer or catalogue part number; that distinction is displayed on the detail page. No match was inferred from the old product name or the image sequence number.

The other 1,358 families have an empty images array. In particular, brand/profile-specific belts have no guessed photograph. Missing or failed images render a neutral empty-image state rather than another product's photo. Do not restore the old modulo/default-to-e(1) image fallback.

To add a confirmed family image, update the explicit whitelist with the correct family ID and name. SKU-specific images require a separate SKU-level mapping; do not imply a family picture verifies all its dimensions.

## Reproduce and verify

```sh
python scripts/import-product-workbook.py /path/to/catalogue.xlsx
node --import tsx scripts/verify-catalogue.mjs
npm run lint
npm run build
```

The importer reads the workbook without changing it and rejects unparsed SKU lines, duplicate SKUs and mismatched row totals. The verification checks every imported family and SKU, hierarchy totals, exact source descriptions, search, image whitelist, empty-image rendering and variant selection. The existing inquiry/backend persistence behavior is unchanged.
