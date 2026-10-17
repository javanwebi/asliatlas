import type { Category, Product } from '../types';
import { getProductImageUrl } from '../assets/imagesproducts';
import { USER_PRODUCTS } from './userProducts';

export interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}
export interface EnhancedCategory extends Category {
  children: CategoryNode[];
  image?: string;
  topModels?: string[];
  brands?: string[];
  featuredBadge?: string;
}
const leaves = (names: string): CategoryNode[] => names.split('|').map(name => ({ name }));
const group = (name: string, names: string): CategoryNode => ({ name, children: leaves(names) });

// Shared taxonomy for desktop, mobile, category pages and product filters.
const definitions = [
  {
    slug: 'belts-power-transmission', name: 'تسمه و انتقال نیرو', nameEn: 'Belts & Power Transmission', icon: 'Cpu', image: 'e(001).png',
    children: [
      group('تسمه V شکل (کلاسیک)', 'تسمه A|تسمه B|تسمه C|تسمه D|تسمه E|تسمه Z|تسمه M'),
      group('تسمه پروفیل باریک', 'تسمه SPA|تسمه SPB|تسمه SPC|تسمه XPA|تسمه XPB|تسمه XPC'),
      { name: 'تسمه تایمینگ', children: [group('تایمینگ اینچی', 'XL|L|H'), group('تایمینگ متریک', 'T5|T10'), group('تایمینگ AT', 'AT5|AT10|AT20')] },
      group('تسمه چندشیاری', 'PJ|PK|PL'),
      group('تسمه‌های صنعتی خاص', 'تسمه روکش‌دار|تسمه سیم‌دار|تسمه گریپ‌دار|تسمه ضدسایش'),
      group('متعلقات انتقال نیرو', 'پولی صنعتی|پولی تایمینگ|کوپلینگ'),
    ],
  },
  {
    slug: 'conveyors-industrial-chains', name: 'نوار نقاله و زنجیر صنعتی', nameEn: 'Conveyors & Industrial Chains', icon: 'Link', image: 'e(220).png',
    children: [
      group('نوار نقاله', 'نوار نقاله PVC|نوار نقاله PU|نوار نقاله لاستیکی|نوار نقاله صنعتی خاص'),
      group('نوارهای صنعتی', 'نوار سیلیکونی|نوار گریپ|نوار ضدسایش'),
      group('زنجیر صنعتی', 'زنجیر انتقال نیرو|زنجیر انتقال مواد|زنجیر صنعتی خاص'),
      group('تجهیزات نقاله', 'رولر نقاله|غلتک صنعتی|قطعات نقاله'),
    ],
  },
  {
    slug: 'mechanical-motion-parts', name: 'قطعات مکانیکی و حرکتی', nameEn: 'Mechanical & Motion Parts', icon: 'Cpu', image: 'e(102).png',
    children: [
      group('بلبرینگ و یاتاقان', 'بلبرینگ صنعتی|رولبرینگ|یاتاقان'),
      group('شفت و محور', 'شفت صنعتی|محور انتقال نیرو|میله صنعتی'),
      group('بوش و توپی', 'بوش صنعتی|توپی صنعتی'),
      group('چرخ‌دنده', 'چرخ‌دنده صنعتی|چرخ‌دنده انتقال نیرو'),
      group('قطعات مکانیکی', 'فنر|خار|پین|صفحه صنعتی|ساپورت'),
    ],
  },
  {
    slug: 'wheels-rollers-guides', name: 'چرخ، رولر و تجهیزات هدایت', nameEn: 'Wheels, Rollers & Guides', icon: 'Layers', image: 'e(102).png',
    children: [
      group('چرخ صنعتی', 'چرخ پلی‌یورتان|چرخ لاستیکی|چرخ استاکر|چرخ صنعتی خاص'),
      group('رولر و غلتک', 'رولر صنعتی|غلتک روکش‌دار|غلتک انتقال مواد'),
      group('ریل صنعتی', 'ریل هدایت|سر ریل|پایه ریل'),
      group('تجهیزات هدایت', 'گاید صنعتی|راهنمای دستگاه'),
    ],
  },
  {
    slug: 'rubber-seals-dampers', name: 'لاستیک، آب‌بندی و ضربه‌گیر', nameEn: 'Rubber, Seals & Dampers', icon: 'Shield', image: 'e(345).png',
    children: [
      group('لاستیک صنعتی', 'لاستیک بالمیل|لاستیک دیافراگم|لاستیک فلنج|لاستیک کوپلینگ'),
      group('تجهیزات آب‌بندی', 'اورینگ|واشر|پکینگ|کاسه‌نمد|درزگیر صنعتی'),
      group('ضربه‌گیر صنعتی', 'ضربه‌گیر لاستیکی|ضربه‌گیر پلی‌یورتان|ضربه‌گیر استاکر|ضربه‌گیر دستگاه'),
      group('قطعات لاستیکی', 'ضربه‌زن|نوار لاستیکی|قطعات لاستیکی سفارشی'),
    ],
  },
  {
    slug: 'polymers-industrial-sheets', name: 'مواد پلیمری و ورق صنعتی', nameEn: 'Polymers & Industrial Sheets', icon: 'Package', image: 'e(169).png',
    children: [
      group('ورق‌های پلیمری', 'ورق تفلون|ورق پلی‌یورتان|ورق پلی‌آمید|ورق پلاستیک صنعتی'),
      group('ورق‌های صنعتی', 'ورق فلزی|ورق ضدسایش|ورق صنعتی خاص'),
      group('مواد پلیمری', 'زلامید|پلی‌یورتان|تفلون'),
      group('فوم و منسوجات صنعتی', 'ابر صنعتی|فوم صنعتی|اسفنج صنعتی|پارچه صنعتی'),
    ],
  },
  {
    slug: 'pumps-fluids-pneumatics', name: 'پمپ، سیالات و پنوماتیک', nameEn: 'Pumps, Fluids & Pneumatics', icon: 'Flame', image: 'e(220).png',
    children: [
      group('قطعات پمپ', 'قطعات یدکی پمپ|پروانه پمپ|قطعات پمپ صنعتی'),
      group('شیلنگ و لوله', 'شیلنگ صنعتی|شیلنگ PVC|لوله صنعتی|مجرای انتقال سیالات'),
      group('تجهیزات پنوماتیک', 'سیلندر صنعتی|سیلندر پنوماتیک|قطعات پنوماتیک'),
      group('تجهیزات وکیوم', 'مکنده صنعتی|قطعات وکیوم'),
    ],
  },
  {
    slug: 'production-ceramic-equipment', name: 'تجهیزات خطوط تولید و کاشی و سرامیک', nameEn: 'Production Lines & Ceramic Equipment', icon: 'Wrench', image: 'e(253).png',
    children: [
      group('تجهیزات کوره', 'قطعات کوره|متعلقات کوره'),
      group('تجهیزات استاکر', 'قطعات استاکر|ضربه‌گیر استاکر|چرخ استاکر'),
      group('تجهیزات چاپ و دکور', 'قطعات دستگاه چاپ|قطعات دستگاه دکور'),
      group('قطعات ماشین‌آلات', 'راهنمای دستگاه|قطعات خطوط کاشی|قالب صنعتی|پوسته صنعتی|محافظ دستگاه'),
      group('قطعات سفارشی', 'قطعات ساخته‌شده|قطعات خاص ماشین‌آلات'),
    ],
  },
  {
    slug: 'brushes-filtration-tools', name: 'برس، فیلتراسیون و ابزار صنعتی', nameEn: 'Brushes, Filtration & Tools', icon: 'Grid', image: 'e(098).png',
    children: [
      group('برس صنعتی', 'برس استوانه‌ای|برس نواری|برس کف|برس ساب|برس لبه‌گیر'),
      group('فیلتراسیون صنعتی', 'توری صنعتی|فیلتر صنعتی|توری فیلتر'),
      group('ابزار برش', 'تیغه صنعتی|ابزار برش صنعتی'),
      group('ابزار و ملزومات', 'اسپاتول|ماژیک صنعتی'),
    ],
  },
  {
    slug: 'industrial-fasteners-accessories', name: 'اتصالات و ملزومات صنعتی', nameEn: 'Industrial Fasteners & Accessories', icon: 'Package', image: 'e(026).png',
    children: [
      group('پیچ و مهره', 'پیچ صنعتی|مهره صنعتی'),
      group('بست و اتصالات', 'بست صنعتی|بست U شکل|اتصالات صنعتی'),
      group('پایه و نگهدارنده', 'پایه صنعتی|براکت|نگهدارنده صنعتی'),
      group('تجهیزات الکتریکی', 'ترانس صنعتی|قطعات الکتریکی'),
    ],
  },
];

export const flattenCategoryNodes = (nodes: CategoryNode[]): CategoryNode[] =>
  nodes.flatMap(node => [node, ...flattenCategoryNodes(node.children || [])]);

const normalize = (value: string) => value.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\u200c\u200f]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
// Compatibility vocabulary uses existing catalogue labels; source product records stay intact.
const vocabulary: Record<string, string[]> = {
  'تسمه V شکل (کلاسیک)': ['تسمه V-Belt ساده و دنده‌ای', 'انواع تسمه انتقال نیرو و مکانیکی'],
  'تسمه تایمینگ': ['تسمه تایمینگ صنعتی', 'تسمه تایم و تسمه‌های دندانه‌دار'],
  'تسمه‌های صنعتی خاص': ['تسمه جوشی پلی‌یورتان', 'انواع تسمه جوشی', 'تسمه‌های پلی‌یورتان', 'تسمه پاک کن خطوط لعاب'],
  'پولی صنعتی': ['پولی', 'فولی'], 'کوپلینگ': ['کوپلینگ و اتصالات', 'بوش و اتصالات الاستومری'],
  'نوار نقاله': ['نوار نقاله', 'کانوایر'], 'نوار گریپ': ['نوار گریپ سبز پشت پله استر'],
  'زنجیر صنعتی': ['زنجیر'], 'تجهیزات نقاله': ['قطعات نقاله'],
  'بلبرینگ صنعتی': ['بلبرینگ', 'بلبرینگ‌های شیار عمیق'], 'یاتاقان': ['پایه یاتاقان و هوزینگ'],
  'شفت صنعتی': ['شفت'], 'بوش صنعتی': ['بوش', 'بوش‌های سر رولیک'], 'توپی صنعتی': ['توپی'],
  'چرخ‌دنده': ['چرخ دنده', 'چرخ‌دنده مدولار', 'چرخ‌دنده پالت‌آیزر'],
  'صفحه صنعتی': ['صفحه'], 'ساپورت': ['ساپورت و پایه‌های خط لعاب'],
  'چرخ پلی‌یورتان': ['چرخ با روکش پلی‌یورتان', 'چرخ‌ها و هرزگردهای پلی‌یورتان'],
  'چرخ استاکر': ['چرخ استکر'], 'رولر صنعتی': ['رولر', 'رولیک', 'انواع رولر'],
  'غلتک روکش‌دار': ['رولر و روکش رولر'], 'ریل صنعتی': ['ریل', 'ریل و شاسی هدایت تسمه', 'ریل زیر تسمه‌ای'],
  'گاید صنعتی': ['گاید', 'گاید تک‌لبه و دو‌لبه'],
  'لاستیک دیافراگم': ['لاستیک پمپ دیافراگمی'], 'ضربه‌گیر صنعتی': ['ضربهگیر', 'ضربه گیر'],
  'ضربه‌گیر استاکر': ['ضربهگیر استکر', 'ضربه گیر استکر'], 'ضربه‌زن': ['ضربه زن'],
  'کاسه‌نمد': ['کاسه نمد'], 'درزگیر صنعتی': ['درزگیر', 'نوارهای درزگیر'],
  'پلی‌یورتان': ['پلی یورتان'], 'اسفنج صنعتی': ['اسفنج', 'انواع اسفنج سیلیکونی و معمولی'],
  'فوم صنعتی': ['فوم'], 'ابر صنعتی': ['ابر'], 'پارچه صنعتی': ['پارچه', 'پارچه‌های نسوز'],
  'قطعات پمپ': ['پمپ', 'پروانه و همزن‌های لعاب', 'قطعات پمپ دیافراگمی'],
  'شیلنگ صنعتی': ['شیلنگ'], 'لوله صنعتی': ['لوله'], 'سیلندر صنعتی': ['سیلندر'],
  'مکنده صنعتی': ['مکنده', 'لاستیک‌های وکیوم و مکنده'], 'قطعات وکیوم': ['وکیوم'],
  'تجهیزات کوره': ['کوره', 'قطعات کوره رولری'], 'تجهیزات استاکر': ['استاکر', 'استکر'],
  'تجهیزات چاپ و دکور': ['چاپ', 'دکور', 'قطعات خط لعاب و چاپ'],
  'برس صنعتی': ['برس', 'برس مویی', 'برس خشک', 'برس و تمیزکننده‌های خطوط کاشی'],
  'توری صنعتی': ['توری'], 'فیلتر صنعتی': ['فیلتر'], 'تیغه صنعتی': ['تیغه', 'تیغ خاک‌پرس'],
  'پیچ صنعتی': ['پیچ'], 'مهره صنعتی': ['مهره'], 'بست صنعتی': ['بست'],
  'بست U شکل': ['بست U'], 'پایه صنعتی': ['پایه', 'پایه‌های رگلاژ'],
  'نگهدارنده صنعتی': ['نگهدارنده'], 'ترانس صنعتی': ['ترانس'],
};
const nodeMatchesProduct = (product: Product, node: CategoryNode): boolean => {
  const sub = normalize(product.subcategory || '');
  const name = normalize(product.name || '');
  const label = normalize(node.name);
  const profile = node.name.match(/^(?:تسمه )?([A-Z]+\d*)$/)?.[1];
  let direct: boolean;
  if (profile) {
    direct = sub === label || /تسمه|تایم|timing/.test(name) && new RegExp(`(?:^|[^a-z0-9])${profile.toLowerCase()}(?=\\d|[^a-z]|$)`).test(name);
  } else {
    direct = sub === label || name.includes(label) || (vocabulary[node.name] || []).some(term => {
      const normalized = normalize(term);
      return sub === normalized || name.includes(normalized);
    });
  }
  return direct || (node.children || []).some(child => nodeMatchesProduct(product, child));
};

export const CATEGORY_ALIASES: Record<string, string> = {
  'chains-sprockets': 'conveyors-industrial-chains',
  'power-transmission': 'belts-power-transmission', 'industrial-belts': 'belts-power-transmission',
  'belts-timing': 'belts-power-transmission', 'v-belts': 'belts-power-transmission', 'timing-belts': 'belts-power-transmission',
  'pulleys-idlers': 'belts-power-transmission', 'couplings-elastomers': 'belts-power-transmission',
  'profiles-rails-supports': 'wheels-rollers-guides', 'profiles-rails': 'wheels-rollers-guides',
  'rollers-wheels-gears': 'wheels-rollers-guides', 'rubber-pu-suction': 'rubber-seals-dampers',
  'industrial-brushes': 'brushes-filtration-tools', 'glaze-brushes': 'brushes-filtration-tools',
  'hoses-channels': 'pumps-fluids-pneumatics', 'pumps-valves-mechanical': 'pumps-fluids-pneumatics',
  'impellers-pumps': 'pumps-fluids-pneumatics', 'vacuum-cleaners': 'pumps-fluids-pneumatics',
  'seals-foam-refractory': 'rubber-seals-dampers', 'polymer-teflon-parts': 'polymers-industrial-sheets',
  'stacker-conveyor-parts': 'production-ceramic-equipment', 'ceramic-tiles': 'production-ceramic-equipment',
  'kiln-roller-pins': 'production-ceramic-equipment', 'bearings-bushings': 'mechanical-motion-parts',
  'bearings': 'mechanical-motion-parts', 'supports-brackets': 'industrial-fasteners-accessories',
};
export const resolveCategorySlug = (slug: string) => CATEGORY_ALIASES[slug] || slug;

export function matchesCatalogCategory(product: Product, slug: string, selection = 'all'): boolean {
  const category = definitions.find(c => c.slug === resolveCategorySlug(slug));
  if (!category) return selection === 'all' ? product.categorySlug === slug : product.subcategory === selection;
  if (selection !== 'all') {
    const node = flattenCategoryNodes(category.children).find(n => n.name === selection);
    return node ? nodeMatchesProduct(product, node) : product.subcategory === selection;
  }
  return product.categorySlug === category.slug || category.children.some(node => nodeMatchesProduct(product, node));
}

export const CATEGORIES: EnhancedCategory[] = definitions.map((definition, index) => ({
  ...definition,
  id: index + 1,
  description: definition.children.map(node => node.name).join('، '),
  subcategories: definition.children.map(node => node.name),
  image: getProductImageUrl(definition.image),
  count: USER_PRODUCTS.filter(product => matchesCatalogCategory(product, definition.slug)).length,
}));
export const PRIMARY_CATALOG_CATEGORIES = CATEGORIES;
export const findCatalogCategory = (slug: string) => CATEGORIES.find(category => category.slug === resolveCategorySlug(slug));
