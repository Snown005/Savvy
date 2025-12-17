import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadAllProducts, filterItems, addCart } from "./script";
import type { Product } from "./script";

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Усі");

  useEffect(() => {
    loadAllProducts().then(products => {
      setFiltered(products);
      setLoading(false);
    });
  }, []);

  async function handleFilter(category: string = "") {
    setLoading(true);
    const result = await filterItems(search, category);
    setFiltered(result);
    setActiveCategory(category || "Усі");
    setLoading(false);
  }

  async function handleLoadAll() {
    setLoading(true);
    const result = await loadAllProducts();
    setFiltered(result);
    setSearch("");
    setActiveCategory("Усі");
    setLoading(false);
  }

  return (
    <main className="px-15 grow mt-[78px] pb-[60px]">
      <div className="container">
        {/* Filter bar */}
        <div className="flex flex-col items-center">
          <ul className="flex flex-wrap justify-center gap-3 sm:gap-[100px] mt-3 cursor-pointer list-none">
            {["Усі", "Компи", "Ноутбуки", "Смартфони", "Планшети", "Аксесуари"].map(cat => (
              <li
                key={cat}
                onClick={() => cat === "Усі" ? handleLoadAll() : handleFilter(cat)}
                className={`px-2 py-1 rounded transition 
                  text-sm sm:text-base
                  hover:bg-orange-700/50 
                  ${activeCategory === cat ? "bg-orange-700/50 text-white" : ""}`}
              >
                {cat}
              </li>
            ))}
          </ul>

          {/* Search bar */}
          <div className="flex justify-center mt-[30px] w-full max-w-[700px]">
            <div className="relative flex w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                className="pl-10 pr-24 py-2 w-full border-2 border-gray-300 rounded-l-lg rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition placeholder:text-gray-400"
                type="text"
                placeholder="Пошук товарів..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
              />
              <button
                type="button"
                onClick={() => handleFilter()}
                className="absolute right-0 top-0 bottom-0 px-4 bg-orange-500 text-white rounded-r-lg shadow hover:bg-orange-700 transition"
              >
                Шукати
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center mt-10">
            <p>Завантаження...</p>
          </div>
        )}

        {/* Product list */}
        {!loading && (
          <div className="flex flex-wrap gap-[20px] mt-[45px] mx-[40px]">
            {filtered.length === 0 ? (
              <p className="text-center w-full text-gray-500">Продукти не знайдені</p>
            ) : (
              filtered.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => navigate(`/product/${product.id}`)}
                  // Змінено: використовуємо 'flex flex-col' щоб вміст автоматично посувався
                  className="bg-white border border-gray-200 w-[280px] rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col"
                >
                  {/* Image Container */}
                  {/* Змінено: h-[200px] на h-[250px] */}
                  <div className="relative h-[250px] bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = './office-581131_1280.jpg';
                      }}
                    />
                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {/* Додано 'flex flex-col flex-grow' для автоматичного розподілу простору */}
                  <div className="p-3 flex flex-col flex-grow">
                    {/* Title */}
                    {/* Змінено: Прибрано фіксовану висоту, залишено line-clamp-2 для обмеження, але вміст тепер динамічний */}
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2"> 
                      {product.name}
                    </h3>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-sm">★</span>
                        <span className="text-sm text-gray-700 ml-1">
                          {product.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <span className="mr-1">💬</span>
                        <span>{product.reviewCount || 0}</span>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {product.stock > 0 ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <span className="mr-1">✓</span>
                          <span>В наявності</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 text-sm">
                          <span className="mr-1">✗</span>
                          <span>Немає в наявності</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-3 mt-auto"> {/* Додано mt-auto для притискання до низу, якщо назва коротка */}
                      <span className="text-2xl font-bold text-orange-600">
                        {product.price} грн
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addCart(product.name, product.price, product.id);
                      }}
                      className="w-full bg-orange-500 text-white rounded-lg py-2 font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Додати до кошика
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};