import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthButton } from './Auth';

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Блокування скролу при відкритому бургері
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
  }, [menuOpen]);

  return (
    <header className="fixed left-0 top-0 right-0 bg-gray-800 border-b-[3px] border-orange-500 shadow-md z-50">
      <div className="max-w-[1920px] px-4 sm:px-10 py-2 flex items-center justify-between">
        
        {/* Ліва частина */}
        <div className="flex items-center">
          {/* Десктоп: логотип + SAVVY */}
          <div className="hidden sm:flex items-center">
            <img className="h-[45px] w-[34px] ml-2" src="src/Ellipse 1.svg" alt="logo" />
            <div className="text-[30px] text-[aliceblue] font-serif ml-[15px] mr-[60px]">SAVVY</div>
          </div>

          {/* Мобільний: бургер + SAVVY */}
          <div className="flex sm:hidden items-center gap-5 ml-2">
            <button 
              aria-label="Відкрити меню"
              className="text-white text-2xl"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
            <div className="text-[24px] text-[aliceblue] font-serif">SAVVY</div>
          </div>

          {/* Кнопка: завжди видима */}
          <Link to="/products" className="ml-[12px] sm:ml-[50px]">
            <button className="bg-orange-500 text-white text-sm rounded px-[20px] ml-19 sm:ml-0 sm:px-[30px] py-[6px] transition hover:bg-orange-700">
              Перейти до товарів
            </button>
          </Link>
        </div>

        {/* Права частина (лише десктоп) */}
        <div className="hidden sm:flex items-center gap-[60px]">
          {/* Мова (десктопна кнопка) */}
          <button className="bg-white text-gray-600 rounded h-5 w-[45px]">Укр</button>

          {/* Іконки з твоїми розмірами */}
          <Link to="/compare" aria-label="Порівняння">
            <img src="src/scale.svg" alt="" className="h-[30px] w-[30px] cursor-pointer hover:opacity-80 transition" />
          </Link>
          <Link to="/notifications" aria-label="Сповіщення">
            <img src="src/bell.svg" alt="" className="h-[30px] w-[30px] cursor-pointer hover:opacity-80 transition" />
          </Link>
          <Link to="/favorites" aria-label="Обране">
            <img src="src/heart.svg" alt="" className="h-[30px] w-[30px] cursor-pointer hover:opacity-80 transition" />
          </Link>
          <Link to="/cart" aria-label="Кошик">
            <img src="src/Union.svg" alt="" className="h-[30px] w-[30px] cursor-pointer hover:opacity-80 transition" />
          </Link>

          {/* Кнопка автентифікації (десктоп) */}
          <AuthButton />
        </div>
      </div>

      {/* Мобільне меню + фон */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-[60] flex items-start">
          {/* Сам бургер */}
          <div className="w-[70%] h-[75%] bg-gray-700 text-white flex flex-col gap-4 p-4">
            {/* Мова */}
            <button className="flex items-center gap-2 mt-2">
              <span>🌐</span> Укр
            </button>

            {/* Іконки — мобільні, компактніші */}
            <Link to="/compare" className="flex items-center gap-2">
              <img src="src/scale.svg" alt="Порівняння" className="h-6 w-6" />
              <span>Порівняння</span>
            </Link>
            <Link to="/notifications" className="flex items-center gap-2">
              <img src="src/bell.svg" alt="Сповіщення" className="h-6 w-6" />
              <span>Сповіщення</span>
            </Link>
            <Link to="/favorites" className="flex items-center gap-2">
              <img src="src/heart.svg" alt="Обране" className="h-6 w-6" />
              <span>Обране</span>
            </Link>
            <Link to="/cart" className="flex items-center gap-2">
              <img src="src/Union.svg" alt="Кошик" className="h-6 w-6" />
              <span>Кошик</span>
            </Link>

            {/* Інформація та Допомога */}
            <Link to="/info" className="flex items-center gap-2">
              <span>ℹ️</span> Інформація
            </Link>
            <Link to="/help" className="flex items-center gap-2">
              <span>❓</span> Допомога
            </Link>

            {/* Увійти всередині бургеру */}
            <div className="mt-2">
              <AuthButton />
            </div>
          </div>

          {/* Напівпрозорий фон займає решту простору */}
          <div 
            className="flex-1 h-full bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
};
