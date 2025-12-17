import { Header } from './Header'
import { Footer } from './Footer'
import { Main } from './Content'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Products } from './Products'
//import { Info } from './Info'
import { ProductDetail } from './ProductDetails'
import { AuthProvider } from './Auth'  // Додати
import { Cart } from './Cart'
import { OrderHistory } from './OrderHistory'
import { Favorites } from './Favourites'
function Home() {
  return (
    <AuthProvider>  {/* Обернути все в AuthProvider */}
      <div className='home'>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} /> 
            <Route path="/orders" element={<OrderHistory />} />
<Route path="/favorites" element={<Favorites />} />
           { /*<Route path='/info' element={<Info/>}></Route>*/}
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </AuthProvider>
  )
}
export default Home

