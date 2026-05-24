import { Routes, Route } from 'react-router-dom'
import Keycloak from 'keycloak-js'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Test from './pages/Test'
import About from './pages/About'

interface Props {
  keycloak: Keycloak
}

export default function App({ keycloak }: Props) {
  return (
    <Routes>
      <Route path="/" element={<Home keycloak={keycloak} />} />
      <Route path="/courses" element={<Courses keycloak={keycloak} />} />
      <Route path="/test/:courseId" element={<Test keycloak={keycloak} />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}