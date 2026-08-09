import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Fine Arts',
    count: '320 Products',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    link: '/shop',
    categoryState: 'Fine Arts',
    color: 'from-orange-400 to-pink-500'
  },
  {
    name: 'Stationery',
    count: '450 Products',
    img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    link: '/shop',
    categoryState: 'Stationery',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    name: 'Paper & Canvas',
    count: '150 Products',
    img: 'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?auto=format&fit=crop&w=400&q=80',
    link: '/shop',
    categoryState: 'Paper & Canvas',
    color: 'from-green-400 to-emerald-500'
  },
  {
    name: 'Notebooks',
    count: '210 Products',
    img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80',
    link: '/shop',
    categoryState: 'Notebooks',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    name: 'Accessories',
    count: '95 Products',
    img: 'https://images.unsplash.com/photo-1522881118552-6d1ff8f8dc05?auto=format&fit=crop&w=400&q=80',
    link: '/shop',
    categoryState: 'Accessories',
    color: 'from-purple-400 to-pink-500'
  }
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
        className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-6 md:gap-10 lg:gap-16 px-margin-mobile md:px-0 pb-12 pt-6 hide-scrollbar snap-x snap-mandatory"
      >
        {categories.map((cat, index) => {
          // Stagger sizes: Even items are big, Odd items are small and pushed down slightly
          const isBig = index % 2 === 0;
          
          return (
            <div key={index} className={`snap-center shrink-0 perspective-1000 flex justify-center items-center ${isBig ? 'w-[160px] h-[220px] md:w-[220px] md:h-[280px]' : 'w-[130px] h-[190px] md:w-[180px] md:h-[240px] mt-8 md:mt-12'}`}>
              <motion.div 
                initial={{ scale: 0.85, opacity: 0.5, rotateX: 50, rotateZ: -25, y: 20 }}
                whileInView={{ scale: 1.1, opacity: 1, rotateX: 10, rotateZ: 0, y: -10, zIndex: 40 }}
                viewport={{ margin: "0px -25% 0px -25%" }}
                whileHover={{ rotateX: 0, rotateZ: 0, scale: 1.2, y: -25, zIndex: 50 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className="w-full h-full preserve-3d cursor-pointer will-change-transform"
              >
                <Link to={cat.link} state={{ mainCategory: cat.categoryState }} className="flex flex-col items-center group relative w-full h-full preserve-3d">
                  
                  {/* Glowing shadow behind image (optimized with radial gradient instead of blur) */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full rounded-2xl bg-gradient-to-tr ${cat.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${isBig ? 'h-[140px] md:h-[180px]' : 'h-[110px] md:h-[150px]'}`} style={{ transform: 'translateZ(-50px) scale(1.5)', backgroundImage: `radial-gradient(circle, var(--tw-gradient-from) 0%, transparent 70%)` }}></div>

                  <div className={`relative z-10 rounded-2xl overflow-hidden mb-4 border-[2px] border-white/60 shadow-glass glass-panel group-hover:shadow-antigravity transition-all duration-500 ease-out mx-auto ${isBig ? 'w-[140px] h-[140px] md:w-[180px] md:h-[180px]' : 'w-[110px] h-[110px] md:w-[150px] md:h-[150px]'}`}>
                    <img 
                      src={cat.img} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500"></div>
                  </div>

                  <div className="preserve-3d text-center" style={{ transform: 'translateZ(30px)' }}>
                    <h3 className={`font-bold text-secondary group-hover:text-primary transition-colors tracking-tight shadow-sm ${isBig ? 'text-[18px] md:text-[20px]' : 'text-[16px] md:text-[18px]'}`}>{cat.name}</h3>
                    <p className="text-[12px] text-gray-500 font-medium mt-1 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 shadow-sm group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors inline-block">{cat.count}</p>
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
