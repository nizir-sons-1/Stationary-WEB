import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategoryCounts } from '../hooks/useSupabase';
import { groupCategories, PAPER_AND_CANVAS } from '../data/categories';
import { fallbackOnError, thumb, thumbSrcSet } from '../lib/images';
import { categoryPath } from '../lib/site';

/*
 * The five departments, in the order the homepage shows them.
 *
 * The product counts used to be typed in by hand ("320 Products", "450
 * Products") and had drifted a long way from the actual catalogue, and one of
 * the stock photos had since been taken down at the source — the Accessories
 * card was rendering a broken image on the homepage. Both now come from the
 * same data the shop uses: the tally is real, and the picture is a product
 * that department genuinely stocks.
 */
const DEPARTMENT_CARDS = [
  { name: 'Fine Arts', color: 'from-orange-400 to-pink-500' },
  { name: 'Stationery', color: 'from-blue-400 to-indigo-500' },
  {
    name: PAPER_AND_CANVAS,
    color: 'from-green-400 to-emerald-500',
    // The flagship keeps its commissioned photograph.
    img: 'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?auto=format&fit=crop&w=400&q=80',
  },
  { name: 'Notebooks', color: 'from-yellow-400 to-orange-500' },
  { name: 'Accessories', color: 'from-purple-400 to-pink-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Removed unused itemVariants

const CategoryCards = () => {
  const { counts, images, loading } = useCategoryCounts();

  const categories = useMemo(() => {
    const byDept = groupCategories(counts, images);
    return DEPARTMENT_CARDS.map((dept) => {
      const cards = byDept[dept.name] || [];
      const products = cards.reduce((sum, c) => sum + c.count, 0);
      return {
        ...dept,
        img: dept.img || cards.find((c) => c.image)?.image || null,
        count: loading ? ' ' : products > 0 ? `${products} Products` : 'Coming Soon',
      };
    });
  }, [counts, images, loading]);

  return (
    <section className="py-8 md:py-12 px-0 md:px-gutter max-w-container-max mx-auto bg-white font-sans text-center overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-6 px-margin-mobile md:px-0"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
          <p className="text-primary text-[12px] font-bold uppercase tracking-widest">Our Collections</p>
        </div>
        <h2 className="text-[36px] md:text-[48px] font-black text-secondary tracking-tight">
          Shop By <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-serif italic font-medium">Category</span>
        </h2>
      </motion.div>

      {/* Horizontal Scroll on Mobile, Flex wrap on Desktop */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-6 md:gap-10 lg:gap-16 px-margin-mobile md:px-0 pb-12 pt-6 hide-scrollbar scroll-row-x snap-x snap-mandatory"
      >
        {categories.map((cat, index) => {
          // Stagger sizes: Even items are big, Odd items are small and pushed down slightly
          const isBig = index % 2 === 0;
          
          return (
            <div key={cat.name} className={`snap-center shrink-0 perspective-1000 flex justify-center items-center ${isBig ? 'w-[160px] h-[220px] md:w-[220px] md:h-[280px]' : 'w-[130px] h-[190px] md:w-[180px] md:h-[240px] mt-8 md:mt-12'}`}>
              <motion.div 
                initial={{ scale: 0.85, opacity: 0.5, rotateX: 50, rotateZ: -25, y: 20 }}
                whileInView={{ scale: 1.1, opacity: 1, rotateX: 10, rotateZ: 0, y: -10, zIndex: 40 }}
                viewport={{ margin: "0px -25% 0px -25%" }}
                whileHover={{ rotateX: 0, rotateZ: 0, scale: 1.2, y: -25, zIndex: 50 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className="w-full h-full preserve-3d cursor-pointer will-change-transform"
              >
                <Link to={categoryPath(cat.name)} className="flex flex-col items-center group relative w-full h-full preserve-3d">
                  
                  {/* Glowing shadow behind image (optimized with radial gradient instead of blur) */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full rounded-2xl bg-gradient-to-tr ${cat.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${isBig ? 'h-[140px] md:h-[180px]' : 'h-[110px] md:h-[150px]'}`} style={{ transform: 'translateZ(-50px) scale(1.5)', backgroundImage: `radial-gradient(circle, var(--tw-gradient-from) 0%, transparent 70%)` }}></div>

                  <div className={`relative z-10 rounded-2xl overflow-hidden mb-4 border-[2px] border-white/60 shadow-glass glass-panel group-hover:shadow-antigravity transition-all duration-500 ease-out mx-auto ${isBig ? 'w-[140px] h-[140px] md:w-[180px] md:h-[180px]' : 'w-[110px] h-[110px] md:w-[150px] md:h-[150px]'}`}>
                    {/* Until the tally lands there is no photo to show; the tile
                        keeps its glass surface rather than flashing a broken one. */}
                    {cat.img && (
                      <img
                        src={thumb(cat.img, 360)}
                        srcSet={thumbSrcSet(cat.img, [180, 240, 360, 480])}
                        sizes="(min-width: 768px) 180px, 140px"
                        alt={cat.name}
                        width={180}
                        height={180}
                        loading="lazy"
                        decoding="async"
                        onError={fallbackOnError}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      />
                    )}
                    <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500"></div>
                  </div>

                  <div className="preserve-3d text-center" style={{ transform: 'translateZ(30px)' }}>
                    <h3 className={`font-bold text-secondary group-hover:text-primary transition-colors tracking-tight shadow-sm ${isBig ? 'text-[18px] md:text-[20px]' : 'text-[16px] md:text-[18px]'}`}>{cat.name}</h3>
                    {/* No blur: these pills ride on cards that spring on
                        rotateX/scale as you scroll, so the backdrop was being
                        re-blurred on every frame of every card's animation. */}
                    <p className="text-[12px] text-gray-500 font-medium mt-1 bg-white px-3 py-1 rounded-full border border-white/50 shadow-sm group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors inline-block">{cat.count}</p>
                  </div>
                </Link>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

    </section>
  );
};

export default CategoryCards;
