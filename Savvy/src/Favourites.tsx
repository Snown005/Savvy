import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';
import { addCart } from './script';

type Favorite = {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  image: string;
};

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    loadFavorites();
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Помилка завантаження улюблених:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/favorites/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadFavorites();
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
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

  if (favorites.length === 0) {
    return (
      <main className="px-2 grow mt-[78px] pb-[60px]">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Улюблене</h1>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-10 text-center">
            <p className="text-gray-500 text-lg mb-4">У вас ще немає улюблених товарів</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Перейти до покупок
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-2 grow mt-[78px] pb-[60px]">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Улюблене</h1>

        <div className="flex flex-wrap gap-[20px] justify-center md:justify-start">
          {favorites.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 w-[280px] rounded-lg shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              {/* Heart button */}
              <button
                onClick={() => removeFavorite(item.product_id)}
                className="absolute top-3 right-3 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center text-red-500 text-2xl hover:bg-red-50 hover:text-red-700 transition shadow-md"
              >
                ♥
              </button>

              <div 
                onClick={() => navigate(`/product/${item.product_id}`)}
                className="cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-[200px] bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.product_name} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = './office-581131_1280.jpg';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-[48px]">
                    {item.product_name}
                  </h3>
                  <span className="text-2xl font-bold text-orange-600 block mb-3">
                    {Number(item.price).toFixed(2)} грн
                  </span>
                </div>
              </div>

              <div className="px-3 pb-3">
                <button
                  onClick={() => addCart(item.product_name, Number(item.price), item.product_id)}
                  className="w-full bg-orange-500 text-white rounded-lg py-2 font-semibold hover:bg-orange-600 transition-colors"
                >
                  Додати до кошика
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};