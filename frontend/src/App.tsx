import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Test from './pages/Test'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Payment from './pages/Payment'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/test/:courseId" element={<Test />} />
      <Route path="/about" element={<About />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/payment" element={<Payment />} />
    </Routes>
  )
}