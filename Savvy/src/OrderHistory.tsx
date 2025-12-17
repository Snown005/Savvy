import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';

type OrderItem = {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  total: number;
  created_at: string;
  items: OrderItem[];
};

export const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/orders/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Помилка завантаження історії:', error);
    } finally {
      setLoading(false);
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

  if (orders.length === 0) {
    return (
      <main className="px-2 grow mt-[78px] pb-[60px]">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Історія замовлень</h1>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-10 text-center">
            <p className="text-gray-500 text-lg mb-4">У вас ще немає замовлень</p>
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
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Історія замовлень</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Замовлення #{order.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Всього:</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Number(order.total).toFixed(2)} грн
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Кількість: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-orange-600">
                      {(Number(item.price) * item.quantity).toFixed(2)} грн
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};