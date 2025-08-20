
import { Routes, Route } from "react-router-dom"
import Homepage from "./components/home/Homepage"
import Login from "./components/auth/login/Login"
import Navbar from "./components/ui/navbar/Navbar"

function App() {

  return (
    <div className="flex flex-col h-screen w-full p-2">
    <Navbar />
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
</div>
  )
}

export default App
