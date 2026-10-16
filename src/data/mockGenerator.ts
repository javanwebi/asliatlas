import { Product } from '../types';
import { CATEGORIES } from './categories';
import { BRANDS } from './brands';
import { USER_PRODUCTS } from './userProducts';

let cachedProducts: Product[] | null = null;
let cachedMap: Map<string, Product> | null = null;

/**
 * Returns all authentic catalog products mapped from /src/assets/imagesproducts/
 * (No fake or synthetic products).
 */
export function generateMockProducts(): Product[] {
  if (cachedProducts) return cachedProducts;

  cachedProducts = [...USER_PRODUCTS];
  cachedMap = new Map();

  for (const p of cachedProducts) {
    cachedMap.set(p.code, p);
    cachedMap.set(p.code.toLowerCase(), p);
    cachedMap.set(p.code.replace(/-/g, '').toLowerCase(), p);
  }

  return cachedProducts;
}

export function getAllProducts(): Product[] {
  return generateMockProducts();
}

export function getProductByCode(code: string): Product | undefined {
  if (!code) return undefined;
  if (!cachedMap) {
    generateMockProducts();
  }
  const clean = code.trim();
  return (
    cachedMap?.get(clean) ||
    cachedMap?.get(clean.toLowerCase()) ||
    cachedMap?.get(clean.replace(/-/g, '').toLowerCase()) ||
    cachedProducts?.find(
      p =>
        p.code.toLowerCase() === clean.toLowerCase() ||
        p.code.replace(/-/g, '').toLowerCase() === clean.replace(/-/g, '').toLowerCase()
    )
  );
}

export function getFeaturedProducts(limit: number = 12): Product[] {
  const all = generateMockProducts();
  const featured = all.filter(p => p.featured);
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }
  // If we need more to fill the shelf, pick one from each category
  const extra = all.filter(p => !p.featured);
  return [...featured, ...extra].slice(0, limit);
}

export function getBestSellingBelts(limit: number = 8): Product[] {
  const all = generateMockProducts();
  return all
    .filter(
      p =>
        p.categorySlug === 'industrial-belts' ||
        p.brand.includes('SWR') ||
        p.brand.includes('FORZA') ||
        p.subcategory.includes('تسمه')
    )
    .slice(0, limit);
}

export function getDemandedCeramicParts(limit: number = 8): Product[] {
  const all = generateMockProducts();
  return all.filter(p => p.categorySlug === 'ceramic-tiles').slice(0, limit);
}

export function getLatestProducts(limit: number = 8): Product[] {
  const all = generateMockProducts();
  return all.slice(0, limit);
}

export function getSimilarProducts(product: Product, limit: number = 6): Product[] {
  const all = generateMockProducts();
  // First attempt: same subcategory
  const sameSub = all.filter(
    p => p.code !== product.code && p.subcategory === product.subcategory
  );
  if (sameSub.length >= limit) {
    return sameSub.slice(0, limit);
  }
  // Next: same category
  const sameCat = all.filter(
    p =>
      p.code !== product.code &&
      p.subcategory !== product.subcategory &&
      p.categorySlug === product.categorySlug
  );
  return [...sameSub, ...sameCat].slice(0, limit);
}

export function getProductsByCategory(
  categorySlug: string,
  limit: number = 24,
  offset: number = 0
): { products: Product[]; total: number } {
  const all = generateMockProducts();
  let filtered: Product[];

  if (categorySlug === 'swr-forza-exclusive') {
    filtered = all.filter(
      p =>
        p.categorySlug === 'swr-forza-exclusive' ||
        p.brand.includes('SWR') ||
        p.brand.includes('FORZA')
    );
  } else if (categorySlug === 'belts-timing' || categorySlug === 'industrial-belts' || categorySlug === 'v-belts' || categorySlug === 'timing-belts') {
    const subs = ['تسمه V-Belt ساده و دنده‌ای', 'تسمه تایمینگ صنعتی', 'تسمه جوشی پلی‌یورتان'];
    filtered = all.filter(
      p =>
        subs.includes(p.subcategory) ||
        p.categorySlug === 'industrial-belts' ||
        p.name.includes('تسمه') ||
        p.name.includes('V-Belt')
    );
  } else if (categorySlug === 'profiles-rails') {
    const subs = ['پروفیل‌های خطوط تولید و کانوایر', 'ریل و شاسی هدایت تسمه'];
    filtered = all.filter(
      p => subs.includes(p.subcategory) || p.name.includes('پروفیل') || p.name.includes('ریل')
    );
  } else if (categorySlug === 'glaze-brushes') {
    const subs = ['قطعات خط لعاب و چاپ', 'برس و تمیزکننده‌های خطوط کاشی'];
    filtered = all.filter(
      p => subs.includes(p.subcategory) || p.name.includes('برس') || p.name.includes('لعاب')
    );
  } else if (categorySlug === 'pulleys-idlers') {
    const subs = ['فولی و هرزگرد تفلونی', 'چرخ‌ها و هرزگردهای پلی‌یورتان'];
    filtered = all.filter(
      p =>
        subs.includes(p.subcategory) ||
        p.categorySlug === 'pulleys-idlers' ||
        p.name.includes('فولی') ||
        p.name.includes('پولی') ||
        p.name.includes('چرخ')
    );
  } else if (categorySlug === 'supports-brackets') {
    const subs = ['ساپورت و پایه‌های خط لعاب', 'اهرم و بازوهای نگهدارنده', 'پایه‌های رگلاژ'];
    filtered = all.filter(
      p => subs.includes(p.subcategory) || p.name.includes('ساپورت') || p.name.includes('اهرم') || p.name.includes('پایه')
    );
  } else if (categorySlug === 'impellers-pumps') {
    const subs = ['پروانه و همزن‌های لعاب', 'قطعات پمپ دیافراگمی'];
    filtered = all.filter(
      p => subs.includes(p.subcategory) || p.name.includes('پروانه') || p.name.includes('پمپ') || p.name.includes('دیافراگم')
    );
  } else if (categorySlug === 'vacuum-cleaners') {
    const subs = ['لاستیک‌های وکیوم و مکنده', 'تسمه پاک کن خطوط لعاب'];
    filtered = all.filter(
      p => subs.includes(p.subcategory) || p.name.includes('مکنده') || p.name.includes('وکیوم') || p.name.includes('پاک کن')
    );
  } else if (categorySlug === 'bearings-bushings') {
    const subs = ['پایه یاتاقان و هوزینگ', 'بوش‌های سر رولیک', 'بلبرینگ‌های شیار عمیق'];
    filtered = all.filter(
      p =>
        subs.includes(p.subcategory) ||
        p.categorySlug === 'bearings-bushings' ||
        p.name.includes('بلبرینگ') ||
        p.name.includes('یاتاقان') ||
        p.name.includes('رولیک')
    );
  } else if (categorySlug === 'kiln-roller-pins') {
    const subs = ['قطعات کوره رولری', 'پین و واسطه‌های محرک'];
    filtered = all.filter(
      p => subs.includes(p.subcategory) || p.name.includes('کوره') || p.name.includes('پین')
    );
  } else if (categorySlug === 'couplings-elastomers' || categorySlug === 'power-transmission') {
    const subs = ['بوش و اتصالات الاستومری', 'کوپلینگ و اتصالات'];
    filtered = all.filter(
      p =>
        subs.includes(p.subcategory) ||
        p.categorySlug === 'power-transmission' ||
        p.name.includes('کوپلینگ') ||
        p.name.includes('الاستومر') ||
        p.name.includes('بوش')
    );
  } else if (categorySlug === 'ceramic-tiles') {
    filtered = all.filter(p => p.categorySlug === 'ceramic-tiles');
  } else {
    filtered = all.filter(p => p.categorySlug === categorySlug);
  }

  // If specific filter resulted in very few, gracefully fill with best matches
  if (filtered.length === 0) {
    filtered = all.slice(0, 24);
  }

  return {
    products: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

export function searchProducts(query: string, limit: number = 30): Product[] {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const all = generateMockProducts();

  return all
    .filter(
      p =>
        p.code.toLowerCase().includes(q) ||
        p.code.replace(/-/g, '').toLowerCase().includes(q.replace(/-/g, '')) ||
        p.name.toLowerCase().includes(q) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.technicalSpecs &&
          p.technicalSpecs.some(
            s => s.key.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
          ))
    )
    .slice(0, limit);
}

export function getInstantSearchResults(query: string) {
  if (!query || query.trim().length < 2) {
    return { products: [], categories: [], brands: [] };
  }
  const q = query.trim().toLowerCase();
  const allProducts = generateMockProducts();

  const products = allProducts
    .filter(
      p =>
        p.code.toLowerCase().includes(q) ||
        p.code.replace(/-/g, '').toLowerCase().includes(q.replace(/-/g, '')) ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    )
    .slice(0, 6);

  const matchedCategories = CATEGORIES.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      c.subcategories.some(s => s.toLowerCase().includes(q))
  ).slice(0, 4);

  const matchedBrands = BRANDS.filter(
    b =>
      b.name.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q)
  ).slice(0, 3);

  return {
    products,
    categories: matchedCategories,
    brands: matchedBrands,
  };
}
