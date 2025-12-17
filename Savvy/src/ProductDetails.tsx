import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Filter } from "bad-words";
import { addCart } from "./script";

type ProductDetail = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  discountPercentage: number;
};

type Review = {
  id: number;
  user_id: number;
  product_id: number;
  text: string;
  rating: number;
  created_at: string;
  user_name: string;
  user_picture: string | null;
};

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showModerationError, setShowModerationError] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`https://dummyjson.com/products/${id}`);
        const data = await response.json();
        setProduct(data);
        setLoading(false);
        
        const token = localStorage.getItem('token');
        if (token) {
          checkFavorite();
        }

        loadReviews();
      } catch (error) {
        console.error('Помилка завантаження продукту:', error);
        setLoading(false);
      }
    }
    
    loadProduct();
  }, [id]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Помилка завантаження відгуків:', error);
    }
  };

  const checkFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/favorites/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Помилка перевірки улюблених:', error);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Увійдіть щоб додати до улюблених');
      return;
    }

    if (!product) return;

    try {
      if (isFavorite) {
        const response = await fetch(`http://localhost:3001/api/favorites/remove/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsFavorite(false);
          alert('Видалено з улюблених');
        }
      } else {
        const response = await fetch('http://localhost:3001/api/favorites/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: product.id,
            product_name: product.title,
            price: Math.round(product.price * 40),
            image: product.thumbnail
          })
        });

        if (response.ok) {
          setIsFavorite(true);
          alert('Додано до улюблених');
        }
      }
    } catch (error) {
      console.error('Помилка:', error);
      alert('Помилка при роботі з улюбленими');
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Увійдіть щоб залишити відгук');
      return;
    }

    if (!product) return;
    
    setIsSubmitting(true);
    
    try {
      const filter = new Filter();
      const badWordsList = [
        'хуй', 'блять', 'їбати', 'сука', 'пизда', 'гівно', 
        'мудак', 'жопа', 'єбать', 'нах', 'підар', 'залупа'
      ];
      filter.addWords(...badWordsList);

      if (filter.isProfane(comment)) {
        setShowModerationError(true);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/reviews/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          text: comment,
          rating: rating
        })
      });

      if (response.ok) {
        setComment("");
        setRating(5);
        loadReviews();
      } else {
        const data = await response.json();
        alert(`❌ ${data.error || 'Помилка додавання відгуку'}`);
      }
    } catch (error) {
      console.error('Помилка відправки відгуку:', error);
      alert('Помилка при відправці відгуку');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="px-2 grow mt-[78px] pb-[60px]">
        <div className="container mx-auto text-center mt-10">
          <p>Завантаження...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="px-2 grow mt-[78px] pb-[60px]">
        <div className="container mx-auto text-center mt-10">
          <p>Продукт не знайдено</p>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 bg-orange-500 text-white rounded px-4 py-2 hover:bg-orange-700"
          >
            Повернутись до каталогу
          </button>
        </div>
      </main>
    );
  }

  const priceInUah = Math.round(product.price * 40);
  const oldPrice = Math.round(priceInUah / (1 - product.discountPercentage / 100));

  return (
    <main className="px-2 grow mt-[78px] pb-[60px]">
      <div className="container mx-auto max-w-6xl">
        <button 
          onClick={() => navigate(-1)}
          className="mt-5 mb-5 text-orange-500 hover:text-orange-700"
        >
          ← Назад
        </button>

        <div className="flex gap-10">
          <div className="w-1/2">
            <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-4">
              <img 
                src={product.images[selectedImage]} 
                alt={product.title}
                className="w-full h-[400px] object-contain"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded cursor-pointer p-1 ${
                    selectedImage === index ? 'border-orange-500' : 'border-gray-300'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.title} ${index + 1}`}
                    className="w-20 h-20 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500">/ 5.0</span>
            </div>

            <div className="mb-6">
              {product.discountPercentage > 0 && (
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-400 line-through text-lg">{oldPrice} грн</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                </div>
              )}
              <span className="text-4xl font-bold text-red-600">{priceInUah} грн</span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Опис:</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="mb-6 space-y-2">
              <p><span className="font-semibold">Бренд:</span> {product.brand}</p>
              <p><span className="font-semibold">Категорія:</span> {product.category}</p>
              <p>
                <span className="font-semibold">Наявність:</span>{' '}
                {product.stock > 0 ? (
                  <span className="text-green-600">В наявності ({product.stock} шт.)</span>
                ) : (
                  <span className="text-red-600">Немає в наявності</span>
                )}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => addCart(product.title, priceInUah, product.id)}
                disabled={product.stock === 0}
                className={`flex-1 py-3 rounded text-white font-semibold transition ${
                  product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-700'
                }`}
              >
                Додати до кошика
              </button>
              <button
                onClick={toggleFavorite}
                className={`px-6 py-3 border-2 rounded font-semibold transition text-2xl ${
                  isFavorite
                    ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                    : 'border-orange-500 text-orange-500 hover:bg-orange-50'
                }`}
              >
                ♥
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <h2 className="text-2xl font-bold mb-6">Залишити відгук</h2>
          
          <div className="bg-gray-50 p-6 rounded border border-gray-300 mb-8">
            <div className="mb-4">
              <label className="block font-semibold mb-2">Ваша оцінка:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition ${
                      star <= rating ? 'text-yellow-500' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-gray-600 self-center">{rating} / 5</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Ваш відгук:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Напишіть свій відгук про продукт..."
                className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:border-orange-500"
                rows={5}
              />
            </div>

            <button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || isSubmitting}
              className={`px-6 py-2 rounded font-semibold transition ${
                comment.trim() && !isSubmitting
                  ? 'bg-orange-500 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Перевірка...' : 'Відправити відгук'}
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-6">Відгуки ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Поки що немає відгуків. Будьте першим!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={review.user_picture || 'src/Generic-avatar.svg'} 
                      alt={review.user_name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{review.user_name}</h4>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        {/* <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('uk-UA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span> */}
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModerationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 transform transition-all">
            <div className="flex items-center border-b pb-3 mb-4">
              <span className="text-red-500 text-3xl mr-3">🚫</span>
              <h3 className="text-xl font-bold text-gray-800">Контент заблоковано</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              Ваш відгук містить неприйнятний контент або лайливі слова, які заборонені нашою політикою модерації.
            </p>
            
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6">
              <li>Будь ласка, видаліть нецензурну лексику.</li>
              <li>Переконайтеся, що ваш коментар є конструктивним та ввічливим.</li>
            </ul>

            <div className="text-right">
              <button
                onClick={() => setShowModerationError(false)}
                className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};