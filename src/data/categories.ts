import type { Category, Product } from '../types';
import { USER_PRODUCTS, categorySlugFor } from './userProducts';
import source from './catalogueSource.json';

export interface CategoryNode { name: string; children?: CategoryNode[]; }
export interface EnhancedCategory extends Category {
  children: CategoryNode[]; image?: string; topModels?: string[]; brands?: string[]; featuredBadge?: string;
}
// Only columns A, B and C belong in navigation. Family names and SKU names never enter this tree.
const definitions: EnhancedCategory[] = [];
for (const family of source) {
  let category = definitions.find(c => c.name === family.categoryName);
  if (!category) {
    category = { id: definitions.length + 1, name: family.categoryName, slug: categorySlugFor(family.categoryName),
      nameEn: '', icon: 'Package', description: '', children: [], subcategories: [], count: 0 };
    definitions.push(category);
  }
  let submenu = category.children.find(n => n.name === family.submenu);
  if (!submenu) { submenu = { name: family.submenu, children: [] }; category.children.push(submenu); }
  if (!submenu.children!.some(n => n.name === family.technicalType)) submenu.children!.push({ name: family.technicalType });
}
export function flattenCategoryNodes(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap(node => [node, ...flattenCategoryNodes(node.children || [])]);
}
const legacyNames: Record<string, string> = {
  'belts-power-transmission': 'تسمه و انتقال نیرو', 'industrial-belts': 'تسمه و انتقال نیرو',
  'power-transmission': 'تسمه و انتقال نیرو', 'belts-timing': 'تسمه و انتقال نیرو', 'v-belts': 'تسمه و انتقال نیرو', 'timing-belts': 'تسمه و انتقال نیرو',
  'conveyors-industrial-chains': 'نوار و تسمه نقاله', 'chains-sprockets': 'زنجیر و چرخ‌زنجیر',
  'mechanical-motion-parts': 'قطعات مکانیکی', 'bearings-bushings': 'بلبرینگ و یاتاقان', 'bearings': 'بلبرینگ و یاتاقان',
  'wheels-rollers-guides': 'چرخ و رولر', 'rollers-wheels-gears': 'چرخ و رولر',
  'rubber-seals-dampers': 'آب‌بندی و قطعات لاستیکی', 'rubber-pu-suction': 'آب‌بندی و قطعات لاستیکی',
  'polymers-industrial-sheets': 'مواد و ورق صنعتی', 'polymer-teflon-parts': 'مواد و ورق صنعتی',
  'pumps-fluids-pneumatics': 'قطعات پمپ و سیالات', 'pumps-valves-mechanical': 'قطعات پمپ و سیالات', 'impellers-pumps': 'قطعات پمپ و سیالات',
  'production-ceramic-equipment': 'تجهیزات خطوط کاشی و سرامیک', 'ceramic-tiles': 'تجهیزات خطوط کاشی و سرامیک', 'kiln-roller-pins': 'تجهیزات خطوط کاشی و سرامیک', 'stacker-conveyor-parts': 'تجهیزات خطوط کاشی و سرامیک',
  'brushes-filtration-tools': 'برس و ابزار پرداخت', 'industrial-brushes': 'برس و ابزار پرداخت', 'glaze-brushes': 'برس و ابزار پرداخت',
  'industrial-fasteners-accessories': 'اتصالات و نگهدارنده', 'supports-brackets': 'اتصالات و نگهدارنده',
  'pulleys-idlers': 'پولی و انتقال نیرو', 'couplings-elastomers': 'انتقال قدرت مکانیکی',
  'profiles-rails-supports': 'ریل و تجهیزات هدایت', 'profiles-rails': 'ریل و تجهیزات هدایت',
  'hoses-channels': 'شیلنگ و اتصالات', 'vacuum-cleaners': 'تجهیزات وکیوم', 'seals-foam-refractory': 'آب‌بندی و درزگیری',
};
export const CATEGORY_ALIASES = Object.fromEntries(Object.entries(legacyNames).map(([slug, name]) => [slug, categorySlugFor(name)]));
export const resolveCategorySlug = (slug: string) => CATEGORY_ALIASES[slug] || slug;
export function matchesCatalogCategory(product: Product, slug: string, selection = 'all'): boolean {
  return product.categorySlug === resolveCategorySlug(slug) &&
    (selection === 'all' || product.submenu === selection || product.subcategory === selection);
}
export const CATEGORIES = definitions.map(category => ({
  ...category, count: USER_PRODUCTS.filter(p => p.categorySlug === category.slug).length,
  description: category.children.map(n => n.name).join('، '),
  subcategories: category.children.map(n => n.name),
  image: USER_PRODUCTS.find(p => p.categorySlug === category.slug && p.images.length)?.images[0],
}));
export const PRIMARY_CATALOG_CATEGORIES = CATEGORIES;
export const findCatalogCategory = (slug: string) => CATEGORIES.find(category => category.slug === resolveCategorySlug(slug));
