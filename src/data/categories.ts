import { Category } from '../types';
import { getProductImageUrl } from '../assets/imagesproducts';
import { USER_PRODUCTS } from './userProducts';

export interface EnhancedCategory extends Category {
  image?: string;
  topModels?: string[];
  brands?: string[];
  featuredBadge?: string;
}

// Compute dynamic counts based on subcategories in USER_PRODUCTS
const countsBySubcategory: Record<string, number> = {};
USER_PRODUCTS.forEach(p => {
  if (p.subcategory) {
    countsBySubcategory[p.subcategory] = (countsBySubcategory[p.subcategory] || 0) + 1;
  }
});

const sumCounts = (subs: string[]) => {
  return subs.reduce((acc, sub) => acc + (countsBySubcategory[sub] || 0), 0);
};

export const CATEGORIES: EnhancedCategory[] = [
  // ۱. تسمه‌ها و انتقال نیرو
  {
    id: 1,
    slug: 'belts-power-transmission',
    name: 'تسمه‌ها و انتقال نیرو',
    nameEn: 'Belts & Power Transmission',
    description: 'انواع تسمه‌های صنعتی، تایمینگ، پلی‌یورتان و انتقال نیرو برای تجهیزات و ماشین‌آلات',
    subcategories: [
      'انواع تسمه انتقال نیرو و مکانیکی',
      'تسمه تایم و تسمه‌های دندانه‌دار',
      'تسمه‌های پلی‌یورتان',
      'انواع تسمه جوشی',
      'نوار گریپ سبز پشت پله استر',
      'تسمه‌های پاک‌کن و محصولات مرتبط'
    ],
    topModels: ['1000 0 1', 'B105', 'SPB 2500', '50AT10', '8M*1120'],
    brands: ['فورزا (FORZA)', 'SWR آلمان', 'MEGADYNE', 'BANDO'],
    featuredBadge: 'تسمه‌های انتقال نیرو و تایمینگ',
    icon: 'Cpu',
    count: sumCounts([
      'انواع تسمه انتقال نیرو و مکانیکی',
      'تسمه تایم و تسمه‌های دندانه‌دار',
      'تسمه‌های پلی‌یورتان',
      'انواع تسمه جوشی',
      'نوار گریپ سبز پشت پله استر',
      'تسمه‌های پاک‌کن و محصولات مرتبط',
      'تسمه V-Belt ساده و دنده‌ای',
      'تسمه تایمینگ صنعتی',
      'تسمه جوشی پلی‌یورتان'
    ]) || 185,
    image: getProductImageUrl('e(001).png'),
  },

  // ۲. پروفیل، ریل و ساپورت‌های صنعتی
  {
    id: 2,
    slug: 'profiles-rails-supports',
    name: 'پروفیل، ریل و ساپورت‌های صنعتی',
    nameEn: 'Profiles, Rails & Industrial Supports',
    description: 'پروفیل‌های آلومینیوم، ریل‌های زیرتسمه، ساپورت‌های خطوط و گایدهای هدایت',
    subcategories: [
      'پروفیل‌های آلومینیوم',
      'ریل زیر تسمه‌ای',
      'قطعات ابتدایی و انتهایی ریل',
      'ساپورت‌های نگهدارنده خط انتقال',
      'ساپورت‌های نگهدارنده نوار و تسمه',
      'گاید تک‌لبه و دو‌لبه'
    ],
    topModels: ['1000 1 1', '1000 1 2', '1000 2 1', '1000 5 1'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'هدایت خطوط کانوایر و شاسی گالوانیزه',
    icon: 'Package',
    count: sumCounts([
      'پروفیل‌های آلومینیوم',
      'ریل زیر تسمه‌ای',
      'قطعات ابتدایی و انتهایی ریل',
      'ساپورت‌های نگهدارنده خط انتقال',
      'ساپورت‌های نگهدارنده نوار و تسمه',
      'گاید تک‌لبه و دو‌لبه',
      'پروفیل‌های خطوط تولید و کانوایر',
      'ریل و شاسی هدایت تسمه',
      'ساپورت و پایه‌های خط لعاب'
    ]) || 240,
    image: getProductImageUrl('e(026).png'),
  },

  // ۳. رولر، چرخ و قطعات گردان
  {
    id: 3,
    slug: 'rollers-wheels-gears',
    name: 'رولر، چرخ و قطعات گردان',
    nameEn: 'Rollers, Wheels & Rotating Parts',
    description: 'انواع رولرها، چرخ‌های پلی‌یورتان، چرخ‌دنده‌ها، رول‌های گردان و چرخ‌دنده‌های مدولار',
    subcategories: [
      'انواع رولر',
      'رولر و روکش رولر',
      'بوش، پین و فنر سر رولر',
      'چرخ با روکش پلی‌یورتان',
      'چرخ‌دنده و رول گردان',
      'چرخ‌دنده پالت‌آیزر',
      'چرخ‌دنده مدولار'
    ],
    topModels: ['1000 17 1', '1000 17 2', '1000 16 1', '1000 66 1'],
    brands: ['فورزا (FORZA)', 'SWR آلمان'],
    featuredBadge: 'چرخ‌های پلی‌یورتان و دنده‌های مدولار',
    icon: 'Layers',
    count: sumCounts([
      'انواع رولر',
      'رولر و روکش رولر',
      'بوش، پین و فنر سر رولر',
      'چرخ با روکش پلی‌یورتان',
      'چرخ‌دنده و رول گردان',
      'چرخ‌دنده پالت‌آیزر',
      'چرخ‌دنده مدولار',
      'چرخ‌ها و هرزگردهای پلی‌یورتان',
      'بوش‌های سر رولیک'
    ]) || 195,
    image: getProductImageUrl('e(102).png'),
  },

  // ۴. قطعات لاستیکی، پلی‌یورتان و مکنده
  {
    id: 4,
    slug: 'rubber-pu-suction',
    name: 'قطعات لاستیکی، پلی‌یورتان و مکنده',
    nameEn: 'Rubber, Polyurethane & Suction Parts',
    description: 'لاستیک‌های مکنده استکر، لاستیک پمپ‌های دیافراگمی و پیستونی، کوپلینگ و نوارهای لاستیکی',
    subcategories: [
      'لاستیک‌های مکنده',
      'لاستیک استکر',
      'لاستیک پمپ دیافراگمی',
      'لاستیک پمپ پیستونی',
      'لاستیک پلی‌یورتان پمپ',
      'لاستیک اینکوپ',
      'کوپلینگ و لاستیک کوپلینگ',
      'قطعات و نوارهای لاستیکی'
    ],
    topModels: ['1000 18 1', '1000 18 2', '1000 13 1', '1000 21 1'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'وکیوم استکر کاشی و دیافراگم ضداسید',
    icon: 'Shield',
    count: sumCounts([
      'لاستیک‌های مکنده',
      'لاستیک استکر',
      'لاستیک پمپ دیافراگمی',
      'لاستیک پمپ پیستونی',
      'لاستیک پلی‌یورتان پمپ',
      'لاستیک اینکوپ',
      'کوپلینگ و لاستیک کوپلینگ',
      'قطعات و نوارهای لاستیکی',
      'لاستیک‌های وکیوم و مکنده',
      'قطعات پمپ دیافراگمی'
    ]) || 165,
    image: getProductImageUrl('e(345).png'),
  },

  // ۵. برس‌های صنعتی
  {
    id: 5,
    slug: 'industrial-brushes',
    name: 'برس‌های صنعتی',
    nameEn: 'Industrial Brushes',
    description: 'انواع برس مویی و برس خشک جهت گردگیری، تمیزکاری و آماده‌سازی سطوح خطوط تولید',
    subcategories: [
      'برس مویی',
      'برس خشک'
    ],
    topModels: ['1000 7 1', '1000 7 2', '1000 7 3'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'تمیزکاری و گردگیری خطوط کاشی و سرامیک',
    icon: 'Grid',
    count: sumCounts([
      'برس مویی',
      'برس خشک',
      'برس و تمیزکننده‌های خطوط کاشی'
    ]) || 48,
    image: getProductImageUrl('e(098).png'),
  },

  // ۶. شیلنگ و کانال‌های انتقال
  {
    id: 6,
    slug: 'hoses-channels',
    name: 'شیلنگ و کانال‌های انتقال',
    nameEn: 'Hoses & Transfer Channels',
    description: 'انواع کانال خطی، شیلنگ‌های انتقال مواد صنعتی و شیلنگ‌های خرطومی تقویت‌شده',
    subcategories: [
      'انواع کانال خطی',
      'شیلنگ‌های انتقال مواد',
      'شیلنگ‌های خرطومی و تقویت‌شده'
    ],
    topModels: ['HOSE-PU-50', 'HOSE-PVC-75', 'CANAL-100'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'انتقال سیالات، مواد گرانول و پودر',
    icon: 'Flame',
    count: sumCounts([
      'انواع کانال خطی',
      'شیلنگ‌های انتقال مواد',
      'شیلنگ‌های خرطومی و تقویت‌شده'
    ]) || 55,
    image: getProductImageUrl('e(220).png'),
  },

  // ۷. نوارهای درزگیر، فوم و محصولات نسوز
  {
    id: 7,
    slug: 'seals-foam-refractory',
    name: 'نوارهای درزگیر، فوم و محصولات نسوز',
    nameEn: 'Sealing Strips, Foam & Refractory Products',
    description: 'نوارهای درزگیر و اسفنجی، اسفنج‌های سیلیکونی، پارچه‌های نسوز و نوارهای سنگی حرارتی',
    subcategories: [
      'نوارهای درزگیر',
      'نوارهای اسفنجی',
      'انواع اسفنج سیلیکونی و معمولی',
      'پارچه‌های نسوز',
      'انواع نوار سنگی'
    ],
    topModels: ['1000 19 1', 'SILICONE-PAD', 'REFRACTORY-CLOTH'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'عایق‌بندی حرارتی و مقاومت به دمای بالا',
    icon: 'Shield',
    count: sumCounts([
      'نوارهای درزگیر',
      'نوارهای اسفنجی',
      'انواع اسفنج سیلیکونی و معمولی',
      'پارچه‌های نسوز',
      'انواع نوار سنگی'
    ]) || 62,
    image: getProductImageUrl('e(169).png'),
  },

  // ۸. قطعات تخصصی استکر و خطوط انتقال
  {
    id: 8,
    slug: 'stacker-conveyor-parts',
    name: 'قطعات تخصصی استکر و خطوط انتقال',
    nameEn: 'Specialized Stacker & Conveyor Parts',
    description: 'قطعات پایه و نگهدارنده، تیغ و پارویی استکر، تیغ خاک‌پرس، تسمه‌پاک‌کن و ضربه‌گیرها',
    subcategories: [
      'قطعات پایه و نگهدارنده',
      'تیغ و پارویی استکر',
      'تیغ خاک‌پرس',
      'تسمه پاک‌کن',
      'قطعات ضربه‌زن و ضربه‌گیر',
      'قطعات حفاظ و هدایت خط'
    ],
    topModels: ['1000 4 1', '1000 18 2', '1000 19 2', '1000 39 1'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'تجهیزات تخصصی استکر و خطوط کاشی',
    icon: 'Wrench',
    count: sumCounts([
      'قطعات پایه و نگهدارنده',
      'تیغ و پارویی استکر',
      'تیغ خاک‌پرس',
      'تسمه پاک‌کن',
      'قطعات ضربه‌زن و ضربه‌گیر',
      'قطعات حفاظ و هدایت خط',
      'قطعات خط لعاب و چاپ',
      'تسمه پاک کن خطوط لعاب'
    ]) || 130,
    image: getProductImageUrl('e(253).png'),
  },

  // ۹. قطعات پلیمری و تفلونی
  {
    id: 9,
    slug: 'polymer-teflon-parts',
    name: 'قطعات پلیمری و تفلونی',
    nameEn: 'Polymer & Teflon Engineering Parts',
    description: 'پولی‌های تفلونی، قطعات پلاستیکی مهندسی، بوش‌ها و پلیمرهای ضدسایش ماشین‌کاری‌شده',
    subcategories: [
      'پولی تفلون',
      'قطعات تفلونی',
      'قطعات پلاستیکی مهندسی',
      'بوش‌ها و قطعات پلیمری'
    ],
    topModels: ['1000 9 1', '1000 9 2', 'POM-BUSHING-30'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'تفلون ضدسایش POM و پلیمرهای مهندسی',
    icon: 'Package',
    count: sumCounts([
      'پولی تفلون',
      'قطعات تفلونی',
      'قطعات پلاستیکی مهندسی',
      'بوش‌ها و قطعات پلیمری',
      'فولی و هرزگرد تفلونی'
    ]) || 110,
    image: getProductImageUrl('e(102).png'),
  },

  // ۱۰. قطعات پمپ، شیر و تجهیزات مکانیکی
  {
    id: 10,
    slug: 'pumps-valves-mechanical',
    name: 'قطعات پمپ، شیر و تجهیزات مکانیکی',
    nameEn: 'Pumps, Valves & Mechanical Equipment Parts',
    description: 'قطعات پمپ و آب‌بندی، دریچه ساکشن، نازل شعله‌پخش‌کن، پروانه‌های همزن و پایه‌های تنظیم‌کننده',
    subcategories: [
      'قطعات پمپ و آب‌بندی',
      'دریچه ساکشن',
      'نازل شعله‌پخش‌کن',
      'پروانه‌های همزن',
      'قطعات کوپلینگ',
      'گلوله و زیرگلوله‌ای',
      'ضربهگیر و ضربه‌زن',
      'پایه تنظیم‌کننده و پیچ فلکه‌ای',
      'قطعات حفاظ موتور'
    ],
    topModels: ['1000 12 1', '1000 21 1', '1000 11 1', '1000 14 1'],
    brands: ['فورزا (FORZA)', 'اطلس صنعت'],
    featuredBadge: 'پروانه‌های استیل، دیافراگم و تجهیزات مکانیکی',
    icon: 'Cpu',
    count: sumCounts([
      'قطعات پمپ و آب‌بندی',
      'دریچه ساکشن',
      'نازل شعله‌پخش‌کن',
      'پروانه‌های همزن',
      'قطعات کوپلینگ',
      'گلوله و زیرگلوله‌ای',
      'ضربهگیر و ضربه‌زن',
      'پایه تنظیم‌کننده و پیچ فلکه‌ای',
      'قطعات حفاظ موتور',
      'پروانه و همزن‌های لعاب',
      'قطعات پمپ دیافراگمی',
      'پایه‌های رگلاژ',
      'اهرم و بازوهای نگهدارنده'
    ]) || 145,
    image: getProductImageUrl('e(220).png'),
  },

  // -------------------------------------------------------------
  // Aliases for Backward Compatibility with existing URLs / queries
  // -------------------------------------------------------------
  {
    id: 11,
    slug: 'power-transmission',
    name: 'تسمه‌ها و انتقال نیرو',
    nameEn: 'Belts & Power Transmission',
    description: 'انواع تسمه‌ها و قطعات انتقال نیرو',
    subcategories: ['انواع تسمه انتقال نیرو و مکانیکی', 'تسمه تایم و تسمه‌های دندانه‌دار'],
    topModels: ['1000 0 1'],
    brands: ['فورزا (FORZA)'],
    icon: 'Cpu',
    count: 185,
    image: getProductImageUrl('e(001).png'),
  },
  {
    id: 12,
    slug: 'industrial-belts',
    name: 'تسمه‌ها و انتقال نیرو',
    nameEn: 'Belts & Power Transmission',
    description: 'تسمه‌های صنعتی',
    subcategories: ['انواع تسمه انتقال نیرو و مکانیکی'],
    topModels: ['1000 0 1'],
    brands: ['فورزا (FORZA)'],
    icon: 'Cpu',
    count: 185,
    image: getProductImageUrl('e(001).png'),
  },
  {
    id: 13,
    slug: 'ceramic-tiles',
    name: 'قطعات تخصصی استکر و خطوط انتقال',
    nameEn: 'Stacker & Conveyor Parts',
    description: 'قطعات خطوط انتقال',
    subcategories: ['قطعات پایه و نگهدارنده'],
    topModels: ['1000 4 1'],
    brands: ['فورزا (FORZA)'],
    icon: 'Wrench',
    count: 130,
    image: getProductImageUrl('e(026).png'),
  }
];

// Primary categories list (10 categories)
export const PRIMARY_CATALOG_CATEGORIES = CATEGORIES.filter(c => c.id <= 10);
