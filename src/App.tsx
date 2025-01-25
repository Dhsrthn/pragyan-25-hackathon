import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import Dashboard from "./pages/dashboard"
import Map from "./pages/map"
import Header from "./components/header/header"

function App() {

  return (
    <>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
