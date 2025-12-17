import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

export const Footer: React.FC = () => (
  <div className="fixed bottom-0 left-0 right-0 w-full bg-gray-800 border-t border-orange-500">
    <nav className="flex justify-center px-2 py-2 sm:py-0">
      {/* Десктоп: усі пункти */}
      <ul className="hidden sm:flex gap-[100px] text-base list-none">
        <li className="hover:bg-orange-700 rounded transition px-2 py-1">
          <Link to="/" className="text-white no-underline px-2 py-1 block">
            Головна
          </Link>
        </li>
        <li className="hover:bg-orange-700 rounded transition px-2 py-1">
          <Link to="/products" className="text-white no-underline px-2 py-1 block">
            Каталог
          </Link>
        </li>
        <li className="hover:bg-orange-700 rounded transition px-2 py-1">
          <Link to="/orders" className="text-white no-underline px-2 py-1 block">
            Історія 
          </Link>
        </li>
        <li className="hover:bg-orange-700 rounded transition px-2 py-1">
          <Link to="/info" className="text-white no-underline px-2 py-1 block">
            Інформація
          </Link>
        </li>
        <li className="hover:bg-orange-700 rounded transition px-2 py-1">
          <Link to="/help" className="text-white no-underline px-2 py-1 block">
            Допомога
          </Link>
        </li>
      </ul>

      {/* Мобільний: тільки основні пункти, компактніші */}
      <ul className="flex sm:hidden flex-wrap justify-center gap-12 text-sm list-none">
        <li>
          <Link to="/" className="text-white no-underline px-1 py-0.5 block hover:bg-orange-700 rounded transition">
            Головна
          </Link>
        </li>
        <li>
          <Link to="/products" className="text-white no-underline px-1 py-0.5 block hover:bg-orange-700 rounded transition">
            Каталог
          </Link>
        </li>
        <li>
          <Link to="/orders" className="text-white no-underline px-1 py-0.5 block hover:bg-orange-700 rounded transition">
            Історія
          </Link>
        </li>
        {/* Інформація та Допомога приховані на мобільному, вони у бургері */}
      </ul>
    </nav>
  </div>
);
