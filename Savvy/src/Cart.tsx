import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';

type CartItem = {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  user_id: number;
  total: number;
  status: string;
};

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    loadCart();
  }, [isAuthenticated]);

  const loadCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setItems(data.items);
      }
    } catch (error) {
      console.error('Помилка завантаження кошика:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadCart();
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
    }
  };

  const checkout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Замовлення оформлено успішно!');
        navigate('/');
      }
    } catch (error) {
      console.error('Помилка оформлення:', error);
      alert('Помилка оформлення замовлення');
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

  if (items.length === 0) {
    return (
      <main className="px-2 grow mt-[78px] pb-[60px]">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Кошик</h1>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-10 text-center">
            <p className="text-gray-500 text-lg mb-4">Ваш кошик порожній</p>
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
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Кошик</h1>

        {/* Items */}
        <div className="bg-white border border-gray-300 rounded-lg mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product_name}</h3>
                <p className="text-gray-600">Кількість: {item.quantity}</p>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-bold text-xl text-orange-600">
                  {(Number(item.price) * item.quantity).toFixed(2)} грн
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold">Всього:</span>
            <span className="text-3xl font-bold text-orange-600">
              {Number(order?.total || 0).toFixed(2)} грн
            </span>
          </div>
          <button
            onClick={checkout}
            className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition"
          >
            Оформити замовлення
          </button>
        </div>
      </div>
    </main>
  );
};