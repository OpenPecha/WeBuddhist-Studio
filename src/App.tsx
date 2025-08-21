
import { Routes, Route, useLocation } from "react-router-dom"
import Login from "./components/auth/login/Login"
import Navbar from "./components/ui/molecules/nav-bar/Navbar"
import Signup from "./components/auth/signup/Signup"
import Dashboard from "./components/routes/dashboard/Dashboard"
import Createplan from "./components/routes/create-plan/Createplan"
import Analytics from "./components/routes/analytics/Analytics"

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="flex flex-col h-screen w-full p-2">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Dashboard />}/>
        <Route path="/create-plan" element={<Createplan />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  )
}

export default App
