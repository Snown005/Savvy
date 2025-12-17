import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addCart } from "./script";

type ProductCardProps = {
  id: number;
  title: string;
  price: number;
  img: string;
  rating?: number; // Додано для сумісності з новим дизайном
  discount?: number; // Додано для сумісності з новим дизайном
  stock?: number; // Додано для сумісності з новим дизайном
  reviewCount?: number; // Додано для сумісності з новим дизайном
  onClick: () => void;
};

// --- ОНОВЛЕНИЙ КОМПОНЕНТ ProductCard ---
const ProductCard: React.FC<ProductCardProps> = ({ 
  id, 
  title, 
  price, 
  img, 
  rating = 0, // Встановлюємо значення за замовчуванням
  discount = 0,
  stock = 1,
  reviewCount = 0,
  onClick 
}) => (
  // Картка: flex-col для вертикального розташування, hover-ефекти переміщено
  <div 
    key={id} 
    onClick={onClick}
    className="bg-white border border-gray-200 w-[280px] rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col"
  >
    {/* Image Container */}
    <div className="relative h-[250px] bg-gray-50 flex items-center justify-center overflow-hidden">
      <img 
        src={img} 
        alt={title} 
        // Зменшено hover-ефект для зображення, оскільки він вже є на картці
        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          e.currentTarget.src = './office-581131_1280.jpg'; // Запасне зображення
        }}
      />
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
          -{discount}%
        </div>
      )}
    </div>

    {/* Content */}
    {/* flex-grow для заповнення простору та притискання кнопки вниз */}
    <div className="p-3 flex flex-col flex-grow">
      {/* Title */}
      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
        {title}
      </h3>

      {/* Rating & Reviews */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-sm text-gray-700 ml-1">
            {rating.toFixed(1)}
          </span>
        </div>
        <span className="text-gray-400">•</span>
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-1">💬</span>
          <span>{reviewCount}</span>
        </div>
      </div>

      {/* Stock Status */}
      <div className="mb-3">
        {stock > 0 ? (
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
      {/* mt-auto для притискання до нижнього краю */}
      <div className="mb-3 mt-auto">
        <span className="text-2xl font-bold text-orange-600">
          {price} грн
        </span>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          addCart(title, price, id);
        }}
        className="w-full bg-orange-500 text-white rounded-lg py-2 font-semibold hover:bg-orange-600 transition-colors"
      >
        Додати до кошика
      </button>
    </div>
  </div>
);

// --- КОМПОНЕНТ Main ---
export const Main: React.FC = () => {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // ... (Ваші побажання та логіка слайдера залишилися без змін)
  const wishes = [
    "Ранкової свіжості та бадьорості! Бажаємо тобі дня, повного енергії та успіху.",
    "Нехай сьогоднішній день принесе тобі лише приємні сюрпризи.",
    "Бажаємо гармонії та спокою у кожній миті.",
    "Нехай удача супроводжує тебе у всіх справах.",
    "Бажаємо натхнення та нових ідей.",
    "Нехай усмішка не сходить з твого обличчя.",
    "Бажаємо тепла і затишку протягом дня.",
    "Нехай кожна хвилина буде наповнена радістю.",
    "Бажаємо тобі сил і впевненості у власних діях.",
    "Нехай сьогоднішній день стане кроком до мрії.",
    "Бажаємо щирих зустрічей і добрих людей поруч.",
    "Нехай сьогодні буде легким і продуктивним.",
    "Бажаємо гарного настрою та позитивних думок.",
    "Нехай цей день подарує тобі нові можливості.",
    "Бажаємо тобі щастя у кожній дрібниці."
  ];

  const [wish, setWish] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * wishes.length);
    setWish(wishes[randomIndex]);
  }, []);

  const images = [
    "src/Copilot_20251207_225430.png",
    "src/Copilot_20251207_225502.png",
  ];

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    async function loadTopProducts() {
      try {
        const categories = ['smartphones', 'laptops', 'tablets', 'mobile-accessories'];
        const responses = await Promise.all(
          categories.map(cat => 
            fetch(`https://dummyjson.com/products/category/${cat}?limit=0`).then(r => r.json())
          )
        );
        
        const allProducts = responses.flatMap(r => r.products);
        const sorted = allProducts
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 9);
        
        setTopProducts(sorted);
        setLoading(false);
      } catch (error) {
        console.error('Помилка завантаження продуктів:', error);
        setLoading(false);
      }
    }
    
    loadTopProducts();
  }, []);

  return (
    <main className="px-2 grow mt-[78px] pb-[60px] z-0">
      {/* Десктоп: побажання і реклама поруч */}
      <section className="hidden sm:flex z-0">
        <div className="flex flex-col ml-10 mt-5 h-[180px] w-[400px] rounded bg-orange-500/20 border border-black shadow-md">
          <div className="overflow-scroll p-2 text-[17px]">
            <h3>Побажання на сьогодні</h3>
            <hr className="mb-1" />
            <p>{wish}</p>
          </div>
        </div>
        <div className="ml-[150px] mt-5 h-[180px] w-[750px] rounded shadow-md overflow-hidden flex items-center justify-center bg-white relative">
          <img
            src={images[activeIndex]}
            alt={`photo${activeIndex + 1}`}
            className="w-full h-full object-contain transition-opacity duration-500 ease-in-out"
          />
          <button onClick={prevImage} className="absolute left-2 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-900 active:bg-gray-950">←</button>
          <button onClick={nextImage} className="absolute right-2 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-900 active:bg-gray-950">→</button>
        </div>
      </section>

      {/* Телефон: побажання зверху, реклама під ним */}
      <section className="flex flex-col sm:hidden z-0 items-center">
        <div className="mt-4 h-[120px] w-[90%] max-w-[350px] rounded bg-orange-500/20 border border-black shadow-md">
          <div className="overflow-scroll p-2 text-[15px]">
            <h3>Побажання на сьогодні</h3>
            <hr className="mb-1" />
            <p>{wish}</p>
          </div>
        </div>
        <div className="mt-4 h-[150px] w-[90%] max-w-[400px] rounded shadow-md overflow-hidden flex items-center justify-center bg-white relative">
          <img
            src={images[activeIndex]}
            alt={`photo${activeIndex + 1}`}
            className="w-full h-full object-contain transition-opacity duration-500 ease-in-out"
          />
          <button onClick={prevImage} className="absolute left-2 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-900 active:bg-gray-950">←</button>
          <button onClick={nextImage} className="absolute right-2 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-900 active:bg-gray-950">→</button>
        </div>
      </section>

      {/* Топ пропозиції */}
      <section className="sm:ml-20 px-2 sm:px-0">
        <h2 className="flex justify-center mt-10 text-xl font-semibold">Топ пропозиції</h2>
        {loading ? (
          <div className="text-center mt-10">
            <p>Завантаження...</p>
          </div>
        ) : (
          <div className="flex gap-[30px] flex-wrap mt-[35px] justify-center sm:justify-start">
            {topProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                // Використовуємо дані з API, які були доступні в попередньому запиті, 
                // якщо вони існують, інакше встановлюємо 0/1 для коректного відображення
                price={Math.round(product.price * 40)}
                img={product.thumbnail}
                rating={product.rating}
                discount={product.discountPercentage ? Math.round(product.discountPercentage) : 0}
                stock={product.stock}
                reviewCount={product.reviews ? product.reviews.length : 0} // Припускаємо, що reviews може бути масивом
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </section> 
    </main>
  );
};