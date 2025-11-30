import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { motion } from "framer-motion";
import "./CategorySlider.css";

export default function CategorySlider({ onCategoryChange, selectedCategory }) {
  const scrollContainerRef = useRef(null);
  const scrollAmount = 200;

  const categories = [
    "All",
    "Artificial Intelligence",
    "Cyber Security",
    "Networking",
    "Cloud Engineering",
    "Software Development",
    "Dev Ops",
    "Machine Learning",
    "Virtual Reality",
    "Augmented Reality",
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryClick = (category) => {
    onCategoryChange(category);
  };

  return (
    <motion.div
      className="category_slider_container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.button
        className="arrow_slider_btn"
        onClick={scrollLeft}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft />
      </motion.button>
      <div className="category_slider" ref={scrollContainerRef}>
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className={`category_child ${selectedCategory === category ? "active" : ""
              }`}
            onClick={() => handleCategoryClick(category)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {category}
          </motion.div>
        ))}
      </div>
      <motion.button
        className="arrow_slider_btn"
        onClick={scrollRight}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight />
      </motion.button>
    </motion.div>
  );
}