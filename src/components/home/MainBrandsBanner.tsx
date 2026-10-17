import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { STORE_ASSETS } from "../../assets/images";

export const MainBrandsBanner: React.FC = () => {
  // Subcategories for FORZA (Ordered Left-to-Right matching reference image)
  const forzaCategories = [
    {
      id: "belts",
      title: "تسمه‌ها",
      image: STORE_ASSETS.forzaSubBelt || STORE_ASSETS.products.forzaBelt,
      link: "/category/industrial-belts",
    },
    {
      id: "bearings",
      title: "بلبرینگ‌ها",
      image: STORE_ASSETS.forzaSubBearing || STORE_ASSETS.products.bearing,
      link: "/category/power-transmission",
    },
    {
      id: "couplings",
      title: "کوپلینگ‌ها",
      image:
        STORE_ASSETS.forzaSubCoupling || STORE_ASSETS.categories.transmission,
      link: "/category/power-transmission",
    },
    {
      id: "fittings",
      title: "اتصالات صنعتی",
      image:
        STORE_ASSETS.forzaSubFittings || STORE_ASSETS.products.ceramicParts,
      link: "/category/production-fittings",
    },
  ];

  // Subcategories for SWR (Ordered Left-to-Right matching reference image)
  const swrCategories = [
    {
      id: "valves",
      title: "شیرآلات",
      image: STORE_ASSETS.swrSubValve || STORE_ASSETS.products.valve,
      link: "/category/industrial-valves",
    },
    {
      id: "elbows",
      title: "اتصالات",
      image: STORE_ASSETS.swrSubElbow || STORE_ASSETS.products.ceramicParts,
      link: "/category/production-fittings",
    },
    {
      id: "pipes",
      title: "لوله‌ها",
      image: STORE_ASSETS.swrSubPipes || STORE_ASSETS.products.pipes,
      link: "/category/pipes-flanges",
    },
    {
      id: "flanges",
      title: "فلنج‌ها",
      image: STORE_ASSETS.swrSubFlanges || STORE_ASSETS.products.flange,
      link: "/category/pipes-flanges",
    },
  ];

  return (
    <section
      className="home-brands-refined"
      aria-labelledby="home-brands-title"
    >
      <div className="store-section-heading">
        <div>
          <span className="store-eyebrow">از برند تا قطعه</span>
          <h2 id="home-brands-title">برندهای معتبر، انتخاب‌های روشن</h2>
        </div>
        <Link to="/products">
          تمام محصولات
          <ArrowRight size={16} />
        </Link>
      </div>
      <div className="home-brand-pair">
        {[
          {
            name: "FORZA",
            image: STORE_ASSETS.forzaSubBelt,
            items: forzaCategories,
          },
          {
            name: "SWR",
            image: STORE_ASSETS.swrSubValve,
            items: swrCategories,
          },
        ].map((brand) => (
          <article key={brand.name}>
            <div className="home-brand-heading">
              <div>
                <strong>{brand.name}</strong>
                <p>{brand.items.map((i) => i.title).join(" · ")}</p>
                <Link to={`/products?q=${brand.name}`}>
                  مشاهده محصولات
                  <ArrowRight size={15} />
                </Link>
              </div>
              <img src={brand.image} alt="" loading="lazy" />
            </div>
            <div className="home-brand-categories">
              {brand.items.map((item) => (
                <Link key={item.id} to={item.link}>
                  <img src={item.image} alt="" loading="lazy" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
