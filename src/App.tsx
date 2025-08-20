
import { Routes, Route } from "react-router-dom"
import Homepage from "./components/home/Homepage"
import Login from "./components/auth/login/Login"

function App() {

  return (
   <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App
