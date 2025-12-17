// script.ts
export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  discount?: number;
};

export type CartItem = {
  name: string;
  price: number;
};

// Кошик (тепер просто масив в пам'яті)
export const cart: CartItem[] = [];

// API
const API_BASE = 'https://dummyjson.com';

// Маппінг категорій
const categoryMap: Record<string, string> = {
  "Компи": "laptops",
  "Ноутбуки": "laptops",
  "Смартфони": "smartphones",
  "Планшети": "tablets",
  "Аксесуари": "mobile-accessories"
};

// Конвертувати API категорію в українську
function getCategoryName(apiCategory: string): string {
  const names: Record<string, string> = {
    'smartphones': 'Смартфони',
    'laptops': 'Ноутбуки',
    'tablets': 'Планшети',
    'mobile-accessories': 'Аксесуари'
  };
  return names[apiCategory] || 'Електроніка';
}

// Конвертувати API продукт в наш формат
function convertProduct(p: any, categoryOverride?: string): Product {
  return {
    id: p.id,
    name: p.title,
    category: categoryOverride || getCategoryName(p.category),
    price: Math.round(p.price * 40), // $ -> грн
    image: p.thumbnail,
    description: p.description,
    rating: p.rating || 0,
    reviewCount: p.reviews?.length || 0,
    stock: p.stock || 0,
    discount: p.discountPercentage || 0
  };
}

// Масив продуктів (тепер завантажується з API)
export let products: Product[] = [];

// Завантажити всі продукти
export async function loadAllProducts(): Promise<Product[]> {
  try {
    const categories = ['smartphones', 'laptops', 'tablets', 'mobile-accessories'];
    const responses = await Promise.all(
      categories.map(cat => 
        fetch(`${API_BASE}/products/category/${cat}?limit=0`).then(r => r.json())
      )
    );
    
    products = responses.flatMap(r => r.products.map((p: any) => convertProduct(p)));
    return products;
  } catch (error) {
    console.error('Помилка завантаження продуктів:', error);
    return [];
  }
}

// Завантажити продукти за категорією
async function loadProductsByCategory(category: string): Promise<Product[]> {
  try {
    const apiCategory = categoryMap[category];
    if (!apiCategory) {
      return loadAllProducts();
    }
    
    const response = await fetch(`${API_BASE}/products/category/${apiCategory}?limit=0`);
    const data = await response.json();
    
    return data.products.map((p: any) => convertProduct(p, category));
  } catch (error) {
    console.error('Помилка завантаження категорії:', error);
    return [];
  }
}

// Пошук продуктів
async function searchProducts(query: string): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    const electronics = ['smartphones', 'laptops', 'tablets', 'mobile-accessories'];
    const filtered = data.products.filter((p: any) => electronics.includes(p.category));
    
    return filtered.map((p: any) => convertProduct(p));
  } catch (error) {
    console.error('Помилка пошуку:', error);
    return [];
  }
}

// Додати до кошика
export async function addCart(name: string, price: number, productId: number): Promise<void> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Якщо не залогінений - просто alert
    alert(`${name} додано до кошика!`);
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        product_name: name,
        price: price,
        quantity: 1
      })
    });

    if (response.ok) {
      alert(`${name} додано до кошика!`);
    } else {
      alert('Помилка додавання до кошика');
    }
  } catch (error) {
    console.error('Помилка:', error);
    alert('Помилка додавання до кошика');
  }
}

// Фільтрація
export async function filterItems(search: string, category: string = ""): Promise<Product[]> {
  // Якщо є пошук - використовуємо API пошуку
  if (search.trim()) {
    const results = await searchProducts(search);
    // Якщо є ще й категорія - додатково фільтруємо
    if (category) {
      return results.filter(p => p.category === category);
    }
    return results;
  }
  
  // Якщо тільки категорія - завантажуємо за категорією
  if (category) {
    return loadProductsByCategory(category);
  }
  
  // Якщо нічого - всі продукти
  return loadAllProducts();
}

// Слайдер
export function startSlider(): void {
  const slides = document.querySelectorAll<HTMLImageElement>(".slide");
  if (!slides.length) return;
  let currentIndex = 0;
  setInterval(() => {
    slides[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add("active");
  }, 3000);
}