function CategoryFilter({ categories, activeCategory, onChange }) {
  return (
    <div className="category-filter" aria-label="Knowledge base categories">
      {categories.map((category) => (
        <button
          className={category === activeCategory ? "active" : ""}
          key={category}
          onClick={() => onChange(category)}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
