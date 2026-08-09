import './index.css'
import { useState } from 'react'
import Header from './Header/Header'
import About from './Pages/About/About'
import Books from './Pages/Books/Books'
import Login from './Pages/Login/Login'
import Register from './Pages/Register/Register'
import MyDonations from './Pages/MyDonations/MyDonations'
import { auth } from './api'

function App() {
  const [page, setPage] = useState('Books')
  const [user, setUser] = useState(auth.getUser())

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
      {page === 'Books' && <Books setPage={setPage} />}
      {page === 'About' && <About />}
      {page === 'Login' && <Login setPage={setPage} onLoggedIn={handleLoggedIn} />}
      {page === 'Register' && <Register setPage={setPage} onLoggedIn={handleLoggedIn} />}
      {page === 'MyDonations' && <MyDonations />}
    </>
  )
}

export default App