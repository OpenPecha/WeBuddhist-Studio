
import { Routes, Route, useLocation } from "react-router-dom"
import Homepage from "./components/home/Homepage"
import Login from "./components/auth/login/Login"
import Navbar from "./components/ui/navbar/Navbar"
import Signup from "./components/auth/signup/Signup"

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="flex flex-col h-screen w-full p-2">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  )
}

export default App
