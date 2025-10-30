import { Routes, Route, Link, useNavigate } from 'react-router-dom'

function Home()    { return <h1>Home</h1> }
function About()   { return <h1>About</h1> }
function Contact() { return <h1>Contact</h1> }

export default function App() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {/* Link-based navigation */}
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>

        {/* Button-based navigation */}
        <button onClick={() => navigate('/')}>Go Home</button>
        <button onClick={() => navigate('/about')}>Go About</button>
        <button onClick={() => navigate('/contact')}>Go Contact</button>
      </nav>

      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
      </Routes>
    </div>
  )
}

