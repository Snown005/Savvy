// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
// import { jwtDecode } from 'jwt-decode';
// import { AuthModal } from './AuthModal';

// // Types
// interface User {
//   name: string;
//   email: string;
//   picture: string | null;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (credential: string) => void;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// // Context
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Google Client ID (замініть на свій з Google Cloud Console)
// const GOOGLE_CLIENT_ID = '158478219664-80g9fs4mrs8sheh7vsushf1l28rcotli.apps.googleusercontent.com';

// // Provider компонент
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);

//   // Завантажити користувача з localStorage
//   useEffect(() => {
//     const savedUser = localStorage.getItem('user');
//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//   }, []);

//   const login = (credential: string) => {
//     try {
//       const decoded: any = jwtDecode(credential);
//       const userData: User = {
//         name: decoded.name,
//         email: decoded.email,
//         picture: decoded.picture
//       };
      
//       // Зберегти Google користувача в БД
//       saveGoogleUser(userData);
      
//       setUser(userData);
//       localStorage.setItem('user', JSON.stringify(userData));
//     } catch (error) {
//       console.error('Помилка декодування токена:', error);
//     }
//   };

//   const saveGoogleUser = async (userData: User) => {
//     try {
//       console.log('Збереження Google користувача:', userData);
      
//       const response = await fetch('http://localhost:3001/api/auth/google', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: userData.email,
//           name: userData.name,
//           picture: userData.picture
//         })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Отримано токен:', data);
//         localStorage.setItem('token', data.token);
//       } else {
//         console.error('Помилка відповіді:', response.status);
//       }
//     } catch (error) {
//       console.error('Помилка збереження Google користувача:', error);
//     }
//   };

//   const logout = () => {
//     googleLogout();
//     setUser(null);
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//   };

//   return (
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
//         {children}
//       </AuthContext.Provider>
//     </GoogleOAuthProvider>
//   );
// };

// // Hook для використання auth
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// // Компонент кнопки логіну/логауту
// export const AuthButton: React.FC = () => {
//   const { user, login, logout } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   if (user) {
//     return (
//       <div className="relative">
//         {/* Аватар */}
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="flex items-center gap-2 hover:opacity-80 transition"
//         >
//           <img 
//             src={user.picture || 'src/Generic-avatar.svg'} 
//             alt={user.name}
//             className="w-10 h-10 rounded-full border-2 border-orange-500 cursor-pointer"
//           />
//         </button>

//         {/* Dropdown меню */}
//         {isOpen && (
//           <>
//             {/* Backdrop для закриття при кліку поза меню */}
//             <div 
//               className="fixed inset-0 z-10" 
//               onClick={() => setIsOpen(false)}
//             />
            
//             {/* Саме меню */}
//             <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
//               <div className="p-4 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <img 
//                     src={user.picture || 'src/Generic-avatar.svg'} 
//                     alt={user.name}
//                     className="w-12 h-12 rounded-full"
//                   />
//                   <div>
//                     <p className="font-semibold text-gray-800">{user.name}</p>
//                     <p className="text-sm text-gray-500">{user.email}</p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="p-2">
//                 <button
//                   onClick={() => {
//                     logout();
//                     setIsOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded transition font-medium"
//                 >
//                   Вийти
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     );
//   }

//   return (
//     <>
//       <button
//         onClick={() => setShowModal(true)}
//         className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
//       >
//         Увійти
//       </button>
      
//       <AuthModal 
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         onGoogleSuccess={login}
//       />
//     </>
//   );
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthModal } from './AuthModal';

// Types
interface User {
  name: string;
  email: string;
  picture: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google Client ID (замініть на свій з Google Cloud Console)
const GOOGLE_CLIENT_ID = '158478219664-80g9fs4mrs8sheh7vsushf1l28rcotli.apps.googleusercontent.com';

// Provider компонент
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Завантажити користувача з localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (credential: string) => {
    try {
      const decoded: any = jwtDecode(credential);
      const userData: User = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture || 'src/Generic-avatar.svg'  // Заглушка якщо немає фото
      };
      
      // Зберегти Google користувача в БД
      await saveGoogleUser(userData);
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Помилка декодування токена:', error);
    }
  };

  const saveGoogleUser = async (userData: User) => {
    try {
      console.log('Збереження Google користувача:', userData);
      
      const response = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          picture: userData.picture
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Отримано токен:', data);
        localStorage.setItem('token', data.token);
      } else {
        console.error('Помилка відповіді:', response.status);
      }
    } catch (error) {
      console.error('Помилка збереження Google користувача:', error);
    }
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

// Hook для використання auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Компонент кнопки логіну/логауту
export const AuthButton: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (user) {
    return (
      <div className="relative">
        {/* Аватар */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <img 
            src={user.picture || 'src/Generic-avatar.svg'} 
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-orange-500 cursor-pointer"
          />
        </button>

        {/* Dropdown меню */}
        {isOpen && (
          <>
            {/* Backdrop для закриття при кліку поза меню */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Саме меню */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.picture || './Generic-avatar.svg'} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded transition font-medium"
                >
                  Вийти
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
      >
        Увійти
      </button>
      
      <AuthModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onGoogleSuccess={async (credential) => await login(credential)}
      />
    </>
  );
};