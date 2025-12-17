// import express, { Request, Response } from 'express';
// import cors from 'cors';
// import { Pool } from 'pg';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// const app = express();
// const PORT = 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // PostgreSQL connection - ЗМІНІТЬ НА СВОЇ ДАНІ
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'Savvy',
//   password: 'lipidosugar1',  // ЗМІНІТЬ НА СВІЙ ПАРОЛЬ
//   port: 5432,
// });

// // JWT Secret - ЗМІНІТЬ В PRODUCTION
// const JWT_SECRET = 'dancingwithsavvykey';

// // Types
// interface RegisterRequest {
//   name: string;
//   email: string;
//   password: string;
// }

// interface LoginRequest {
//   email: string;
//   password: string;
// }

// // Тестове підключення до БД
// pool.connect()
//   .then(() => {
//     console.log('✅ Підключено до PostgreSQL');
//   })
//   .catch((err: Error) => {
//     console.error('❌ Помилка підключення до PostgreSQL:', err);
//   });

// // Реєстрація
// app.post('/api/auth/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
//   try {
//     const { name, email, password } = req.body;

//     // Валідація
//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'Всі поля обов\'язкові' });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ error: 'Пароль має бути не менше 6 символів' });
//     }

//     // Перевірка чи користувач існує
//     const existingUser = await pool.query(
//       'SELECT * FROM users WHERE email = $1',
//       [email]
//     );

//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ error: 'Користувач з таким email вже існує' });
//     }

//     // Хешувати пароль
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Створити користувача
//     const result = await pool.query(
//       'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, picture',
//       [name, email, hashedPassword]
//     );

//     const user = result.rows[0];

//     // Створити JWT токен
//     const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

//     res.json({
//       user: {
//         name: user.name,
//         email: user.email,
//         picture: user.picture
//       },
//       token
//     });
//   } catch (error) {
//     console.error('Помилка реєстрації:', error);
//     res.status(500).json({ error: 'Помилка сервера при реєстрації' });
//   }
// });

// // Логін
// app.post('/api/auth/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Валідація
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email і пароль обов\'язкові' });
//     }

//     // Знайти користувача
//     const result = await pool.query(
//       'SELECT * FROM users WHERE email = $1',
//       [email]
//     );

//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: 'Невірний email або пароль' });
//     }

//     const user = result.rows[0];

//     // Перевірити пароль
//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) {
//       return res.status(401).json({ error: 'Невірний email або пароль' });
//     }

//     // Створити JWT токен
//     const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

//     res.json({
//       user: {
//         name: user.name,
//         email: user.email,
//         picture: user.picture
//       },
//       token
//     });
//   } catch (error) {
//     console.error('Помилка логіну:', error);
//     res.status(500).json({ error: 'Помилка сервера при вході' });
//   }
// });

// // Google OAuth логін/реєстрація
// app.post('/api/auth/google', async (req: Request<{}, {}, { email: string; name: string; picture: string }>, res: Response) => {
//   try {
//     const { email, name, picture } = req.body;

//     // Перевірити чи користувач існує
//     let userResult = await pool.query(
//       'SELECT * FROM users WHERE email = $1',
//       [email]
//     );

//     let userId;

//     if (userResult.rows.length === 0) {
//       // Створити нового користувача (Google користувачі не мають паролю)
//       const newUser = await pool.query(
//         'INSERT INTO users (name, email, password, picture) VALUES ($1, $2, $3, $4) RETURNING id',
//         [name, email, 'google_oauth_user', picture]
//       );
//       userId = newUser.rows[0].id;
//     } else {
//       userId = userResult.rows[0].id;
      
//       // Оновити picture якщо змінилась
//       await pool.query(
//         'UPDATE users SET picture = $1 WHERE id = $2',
//         [picture, userId]
//       );
//     }

//     // Створити JWT токен
//     const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

//     res.json({
//       user: {
//         name,
//         email,
//         picture
//       },
//       token
//     });
//   } catch (error) {
//     console.error('Помилка Google OAuth:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Тестовий endpoint
// app.get('/', (req: Request, res: Response) => {
//   res.json({ message: 'Auth API Server is running' });
// });

// // ============= CART/ORDER ENDPOINTS =============

// // Middleware для перевірки JWT токена
// const authenticateToken = (req: any, res: Response, next: any) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ error: 'Токен не надано' });
//   }

//   jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
//     if (err) {
//       return res.status(403).json({ error: 'Невалідний токен' });
//     }
//     req.user = user;
//     next();
//   });
// };

// // Отримати активний кошик користувача
// app.get('/api/cart', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;

//     // Знайти або створити активний order
//     let orderResult = await pool.query(
//       'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
//       [userId, 'pending']
//     );

//     let order;
//     if (orderResult.rows.length === 0) {
//       // Створити новий order
//       const newOrder = await pool.query(
//         'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
//         [userId, 0, 'pending']
//       );
//       order = newOrder.rows[0];
//     } else {
//       order = orderResult.rows[0];
//     }

//     // Отримати items
//     const itemsResult = await pool.query(
//       'SELECT * FROM order_items WHERE order_id = $1',
//       [order.id]
//     );

//     res.json({
//       order,
//       items: itemsResult.rows
//     });
//   } catch (error) {
//     console.error('Помилка отримання кошика:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Додати товар до кошика
// app.post('/api/cart/add', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;
//     const { product_id, product_name, price, quantity = 1 } = req.body;

//     // Знайти або створити активний order
//     let orderResult = await pool.query(
//       'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
//       [userId, 'pending']
//     );

//     let orderId;
//     if (orderResult.rows.length === 0) {
//       const newOrder = await pool.query(
//         'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id',
//         [userId, 0, 'pending']
//       );
//       orderId = newOrder.rows[0].id;
//     } else {
//       orderId = orderResult.rows[0].id;
//     }

//     // Перевірити чи товар вже є в кошику
//     const existingItem = await pool.query(
//       'SELECT * FROM order_items WHERE order_id = $1 AND product_id = $2',
//       [orderId, product_id]
//     );

//     if (existingItem.rows.length > 0) {
//       // Оновити кількість
//       await pool.query(
//         'UPDATE order_items SET quantity = quantity + $1 WHERE order_id = $2 AND product_id = $3',
//         [quantity, orderId, product_id]
//       );
//     } else {
//       // Додати новий item
//       await pool.query(
//         'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES ($1, $2, $3, $4, $5)',
//         [orderId, product_id, product_name, price, quantity]
//       );
//     }

//     // Оновити total
//     const totalResult = await pool.query(
//       'SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1',
//       [orderId]
//     );
    
//     await pool.query(
//       'UPDATE orders SET total = $1 WHERE id = $2',
//       [totalResult.rows[0].total || 0, orderId]
//     );

//     res.json({ message: 'Товар додано до кошика' });
//   } catch (error) {
//     console.error('Помилка додавання до кошика:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Видалити товар з кошика
// app.delete('/api/cart/remove/:itemId', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;
//     const itemId = req.params.itemId;

//     // Видалити item
//     await pool.query('DELETE FROM order_items WHERE id = $1', [itemId]);

//     // Оновити total
//     const orderResult = await pool.query(
//       'SELECT id FROM orders WHERE user_id = $1 AND status = $2',
//       [userId, 'pending']
//     );

//     if (orderResult.rows.length > 0) {
//       const orderId = orderResult.rows[0].id;
//       const totalResult = await pool.query(
//         'SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1',
//         [orderId]
//       );
      
//       await pool.query(
//         'UPDATE orders SET total = $1 WHERE id = $2',
//         [totalResult.rows[0].total || 0, orderId]
//       );
//     }

//     res.json({ message: 'Товар видалено з кошика' });
//   } catch (error) {
//     console.error('Помилка видалення з кошика:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Оформити замовлення
// app.post('/api/cart/checkout', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;

//     // Знайти активний order
//     const orderResult = await pool.query(
//       'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
//       [userId, 'pending']
//     );

//     if (orderResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Кошик порожній' });
//     }

//     // Змінити status на 'completed'
//     await pool.query(
//       'UPDATE orders SET status = $1 WHERE id = $2',
//       ['completed', orderResult.rows[0].id]
//     );

//     res.json({ message: 'Замовлення оформлено успішно!' });
//   } catch (error) {
//     console.error('Помилка оформлення замовлення:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Отримати історію замовлень
// app.get('/api/orders/history', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;

//     // Отримати всі completed замовлення
//     const ordersResult = await pool.query(
//       'SELECT * FROM orders WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
//       [userId, 'completed']
//     );

//     // Для кожного замовлення отримати items
//     const ordersWithItems = await Promise.all(
//       ordersResult.rows.map(async (order) => {
//         const itemsResult = await pool.query(
//           'SELECT * FROM order_items WHERE order_id = $1',
//           [order.id]
//         );
//         return {
//           ...order,
//           items: itemsResult.rows
//         };
//       })
//     );

//     res.json(ordersWithItems);
//   } catch (error) {
//     console.error('Помилка отримання історії:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // ============= FAVORITES ENDPOINTS =============

// // Додати до улюблених
// app.post('/api/favorites/add', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;
//     const { product_id, product_name, price, image } = req.body;

//     // Перевірити чи вже є в улюблених
//     const existing = await pool.query(
//       'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2',
//       [userId, product_id]
//     );

//     if (existing.rows.length > 0) {
//       return res.status(400).json({ error: 'Вже в улюблених' });
//     }

//     // Додати
//     await pool.query(
//       'INSERT INTO favorites (user_id, product_id, product_name, price, image) VALUES ($1, $2, $3, $4, $5)',
//       [userId, product_id, product_name, price, image]
//     );

//     res.json({ message: 'Додано до улюблених' });
//   } catch (error) {
//     console.error('Помилка додавання до улюблених:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Видалити з улюблених
// app.delete('/api/favorites/remove/:productId', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;
//     const productId = req.params.productId;

//     await pool.query(
//       'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
//       [userId, productId]
//     );

//     res.json({ message: 'Видалено з улюблених' });
//   } catch (error) {
//     console.error('Помилка видалення з улюблених:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Отримати улюблені
// app.get('/api/favorites', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;

//     const result = await pool.query(
//       'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
//       [userId]
//     );

//     res.json(result.rows);
//   } catch (error) {
//     console.error('Помилка отримання улюблених:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Перевірити чи продукт в улюблених
// app.get('/api/favorites/check/:productId', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;
//     const productId = req.params.productId;

//     const result = await pool.query(
//       'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2',
//       [userId, productId]
//     );

//     res.json({ isFavorite: result.rows.length > 0 });
//   } catch (error) {
//     console.error('Помилка перевірки улюблених:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // ============= REVIEWS ENDPOINTS =============

// // Додати відгук
// app.post('/api/reviews/add', authenticateToken, async (req: any, res: Response) => {
//   try {
//     const userId = req.user.userId;
//     const { product_id, text, rating } = req.body;

//     if (!text || !rating || !product_id) {
//       return res.status(400).json({ error: 'Всі поля обов\'язкові' });
//     }

//     if (rating < 1 || rating > 5) {
//       return res.status(400).json({ error: 'Рейтинг має бути від 1 до 5' });
//     }

//     // Перевірити чи користувач вже залишив відгук на цей продукт
//     const existingReview = await pool.query(
//       'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
//       [userId, product_id]
//     );

//     if (existingReview.rows.length > 0) {
//       return res.status(400).json({ error: 'Ви вже залишили відгук на цей продукт' });
//     }

//     // Додати відгук
//     const result = await pool.query(
//       'INSERT INTO reviews (user_id, product_id, text, rating) VALUES ($1, $2, $3, $4) RETURNING *',
//       [userId, product_id, text, rating]
//     );

//     res.json({ message: 'Відгук додано успішно', review: result.rows[0] });
//   } catch (error) {
//     console.error('Помилка додавання відгуку:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// // Отримати відгуки для продукту
// app.get('/api/reviews/:productId', async (req: Request, res: Response) => {
//   try {
//     const productId = req.params.productId;

//     const result = await pool.query(
//       `SELECT r.*, u.name as user_name, u.picture as user_picture 
//        FROM reviews r 
//        JOIN users u ON r.user_id = u.id 
//        WHERE r.product_id = $1 
//        ORDER BY r.created_at DESC`,
//       [productId]
//     );

//     res.json(result.rows);
//   } catch (error) {
//     console.error('Помилка отримання відгуків:', error);
//     res.status(500).json({ error: 'Помилка сервера' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Auth сервер запущено на http://localhost:${PORT}`);
// });

import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://savvy.onrender.com', 'https://yourdomain.com']
    : ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// PostgreSQL connection - ЗМІНІТЬ НА СВОЇ ДАНІ
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Savvy',
  password: 'lipidosugar1',  // ЗМІНІТЬ НА СВІЙ ПАРОЛЬ
  port: 5432,
});

// JWT Secret - ЗМІНІТЬ В PRODUCTION
const JWT_SECRET = 'dancingwithsavvykey';

// Types
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Тестове підключення до БД
pool.connect()
  .then(() => {
    console.log('✅ Підключено до PostgreSQL');
  })
  .catch((err: Error) => {
    console.error('❌ Помилка підключення до PostgreSQL:', err);
  });

// Реєстрація
app.post('/api/auth/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Валідація
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Всі поля обов\'язкові' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль має бути не менше 6 символів' });
    }

    // Перевірка чи користувач існує
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Користувач з таким email вже існує' });
    }

    // Хешувати пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створити користувача
    const result = await pool.query(
      'INSERT INTO users (name, email, password, picture) VALUES ($1, $2, $3, $4) RETURNING id, name, email, picture',
      [name, email, hashedPassword, 'src/Generic-avatar.svg']
    );

    const user = result.rows[0];

    // Створити JWT токен
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture
      },
      token
    });
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    res.status(500).json({ error: 'Помилка сервера при реєстрації' });
  }
});

// Логін
app.post('/api/auth/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ error: 'Email і пароль обов\'язкові' });
    }

    // Знайти користувача
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const user = result.rows[0];

    // Перевірити пароль
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    // Створити JWT токен
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture
      },
      token
    });
  } catch (error) {
    console.error('Помилка логіну:', error);
    res.status(500).json({ error: 'Помилка сервера при вході' });
  }
});

// Google OAuth логін/реєстрація
app.post('/api/auth/google', async (req: Request<{}, {}, { email: string; name: string; picture: string }>, res: Response) => {
  try {
    const { email, name, picture } = req.body;

    // Перевірити чи користувач існує
    let userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let userId;
    const defaultPicture = picture || './Generic-avatar.svg';

    if (userResult.rows.length === 0) {
      // Створити нового користувача (Google користувачі не мають паролю)
      const newUser = await pool.query(
        'INSERT INTO users (name, email, password, picture) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, 'google_oauth_user', defaultPicture]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
      
      // Оновити picture якщо змінилась
      await pool.query(
        'UPDATE users SET picture = $1 WHERE id = $2',
        [defaultPicture, userId]
      );
    }

    // Створити JWT токен
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        name,
        email,
        picture: defaultPicture
      },
      token
    });
  } catch (error) {
    console.error('Помилка Google OAuth:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Тестовий endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Auth API Server is running' });
});

// ============= CART/ORDER ENDPOINTS =============

// Middleware для перевірки JWT токена
const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен не надано' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Невалідний токен' });
    }
    req.user = user;
    next();
  });
};

// Отримати активний кошик користувача
app.get('/api/cart', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    // Знайти або створити активний order
    let orderResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    let order;
    if (orderResult.rows.length === 0) {
      // Створити новий order
      const newOrder = await pool.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, 0, 'pending']
      );
      order = newOrder.rows[0];
    } else {
      order = orderResult.rows[0];
    }

    // Отримати items
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    res.json({
      order,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Помилка отримання кошика:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Додати товар до кошика
app.post('/api/cart/add', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { product_id, product_name, price, quantity = 1 } = req.body;

    // Знайти або створити активний order
    let orderResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    let orderId;
    if (orderResult.rows.length === 0) {
      const newOrder = await pool.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id',
        [userId, 0, 'pending']
      );
      orderId = newOrder.rows[0].id;
    } else {
      orderId = orderResult.rows[0].id;
    }

    // Перевірити чи товар вже є в кошику
    const existingItem = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 AND product_id = $2',
      [orderId, product_id]
    );

    if (existingItem.rows.length > 0) {
      // Оновити кількість
      await pool.query(
        'UPDATE order_items SET quantity = quantity + $1 WHERE order_id = $2 AND product_id = $3',
        [quantity, orderId, product_id]
      );
    } else {
      // Додати новий item
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES ($1, $2, $3, $4, $5)',
        [orderId, product_id, product_name, price, quantity]
      );
    }

    // Оновити total
    const totalResult = await pool.query(
      'SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1',
      [orderId]
    );
    
    await pool.query(
      'UPDATE orders SET total = $1 WHERE id = $2',
      [totalResult.rows[0].total || 0, orderId]
    );

    res.json({ message: 'Товар додано до кошика' });
  } catch (error) {
    console.error('Помилка додавання до кошика:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Видалити товар з кошика
app.delete('/api/cart/remove/:itemId', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const itemId = req.params.itemId;

    // Видалити item
    await pool.query('DELETE FROM order_items WHERE id = $1', [itemId]);

    // Оновити total
    const orderResult = await pool.query(
      'SELECT id FROM orders WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    if (orderResult.rows.length > 0) {
      const orderId = orderResult.rows[0].id;
      const totalResult = await pool.query(
        'SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1',
        [orderId]
      );
      
      await pool.query(
        'UPDATE orders SET total = $1 WHERE id = $2',
        [totalResult.rows[0].total || 0, orderId]
      );
    }

    res.json({ message: 'Товар видалено з кошика' });
  } catch (error) {
    console.error('Помилка видалення з кошика:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Оформити замовлення
app.post('/api/cart/checkout', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    // Знайти активний order
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Кошик порожній' });
    }

    // Змінити status на 'completed'
    await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      ['completed', orderResult.rows[0].id]
    );

    res.json({ message: 'Замовлення оформлено успішно!' });
  } catch (error) {
    console.error('Помилка оформлення замовлення:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримати історію замовлень
app.get('/api/orders/history', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    // Отримати всі completed замовлення
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
      [userId, 'completed']
    );

    // Для кожного замовлення отримати items
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Помилка отримання історії:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// ============= FAVORITES ENDPOINTS =============

// Додати до улюблених
app.post('/api/favorites/add', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { product_id, product_name, price, image } = req.body;

    // Перевірити чи вже є в улюблених
    const existing = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Вже в улюблених' });
    }

    // Додати
    await pool.query(
      'INSERT INTO favorites (user_id, product_id, product_name, price, image) VALUES ($1, $2, $3, $4, $5)',
      [userId, product_id, product_name, price, image]
    );

    res.json({ message: 'Додано до улюблених' });
  } catch (error) {
    console.error('Помилка додавання до улюблених:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Видалити з улюблених
app.delete('/api/favorites/remove/:productId', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.productId;

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({ message: 'Видалено з улюблених' });
  } catch (error) {
    console.error('Помилка видалення з улюблених:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримати улюблені
app.get('/api/favorites', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Помилка отримання улюблених:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Перевірити чи продукт в улюблених
app.get('/api/favorites/check/:productId', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.productId;

    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Помилка перевірки улюблених:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// ============= REVIEWS ENDPOINTS =============

// Додати відгук
app.post('/api/reviews/add', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { product_id, text, rating } = req.body;

    if (!text || !rating || !product_id) {
      return res.status(400).json({ error: 'Всі поля обов\'язкові' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Рейтинг має бути від 1 до 5' });
    }

    // Перевірити чи користувач вже залишив відгук на цей продукт
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Ви вже залишили відгук на цей продукт' });
    }

    // Додати відгук
    const result = await pool.query(
      'INSERT INTO reviews (user_id, product_id, text, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, product_id, text, rating]
    );

    res.json({ message: 'Відгук додано успішно', review: result.rows[0] });
  } catch (error) {
    console.error('Помилка додавання відгуку:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримати відгуки для продукту
app.get('/api/reviews/:productId', async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.picture as user_picture 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Помилка отримання відгуків:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Auth сервер запущено на http://localhost:${PORT}`);
});