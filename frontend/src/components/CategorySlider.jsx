import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
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
    <div className="category_slider_container">
      <button className="arrow_slider_btn" onClick={scrollLeft}>
        <ChevronLeft />
      </button>
      <div className="category_slider" ref={scrollContainerRef}>
        {categories.map((category, index) => (
          <div
            key={index}
            className={`category_child ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </div>
        ))}
      </div>
      <button className="arrow_slider_btn" onClick={scrollRight}>
        <ChevronRight />
      </button>
    </div>
  );
}
