import './index.css'
import './shared.css'
import { useState } from 'react'
import Header from './Header/Header'
import AdminBooks from './Pages/AdminBooks/AdminBooks'
import About from './Pages/About/About'
import Books from './Pages/Books/Books'
import Login from './Pages/Login/Login'
import Register from './Pages/Register/Register'
import MyDonations from './Pages/MyDonations/MyDonations'
import MyReservations from './Pages/MyReservations/MyReservations'
import Toast from './Toast/Toast'
import { auth } from './api'

function App() {
  const [page, setPage] = useState('Books')
  const [user, setUser] = useState(auth.getUser())
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message) => setToastMessage(message)

  const handleLogout = () => {
    auth.logout()
    setUser(null)
    setPage('Books')
  }

  const handleLoggedIn = (loggedInUser) => {
    setUser(loggedInUser)
    setPage('Books')
  }

  return (
    <>
      <Header setPage={setPage} currentPage={page} user={user} onLogout={handleLogout} />
      
      {page === 'Books' && <Books setPage={setPage} showToast={showToast} isAdmin={user?.role === 'admin'} />}      
      {page === 'AdminBooks' && user?.role === 'admin' && <AdminBooks />}
      {page === 'About' && <About />}
      {page === 'Login' && <Login setPage={setPage} onLoggedIn={handleLoggedIn} />}
      {page === 'Register' && <Register setPage={setPage} onLoggedIn={handleLoggedIn} />}
      {page === 'MyReservations' && <MyReservations />}
      {page === 'MyDonations' && <MyDonations />}
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  )
}

export default App