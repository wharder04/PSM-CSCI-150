import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import ForgotPassword from './pages/ForgotPassword.jsx'
import SetPassword from './pages/SetPassword.jsx'
import Verfication from './pages/Verification.jsx'


export default function App() {
  return (

    <div>
      <Routes>
        <Route path="/" element={<ForgotPassword />} />
        <Route path="/verify" element={<Verfication />} />
        <Route path="/reset" element={<SetPassword />} />
      </Routes>
    </div>
  )
}

