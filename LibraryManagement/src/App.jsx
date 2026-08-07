import './index.css'
import Header from './Header/Header'
import About from './Pages/About/About'
import {useState} from 'react'
import Books from './Pages/Books/Books'
import Contact from './Pages/Contact/Contact'

function App() {
const [page, setPage] = useState('Books')

  return (
    <>
      <Header setPage={setPage}/>
      {page === 'Books' && <Books />}
      {page === 'About' && <About />}
      {page === 'Contact' && <Contact />}
      
    </>
  )
}

export default App