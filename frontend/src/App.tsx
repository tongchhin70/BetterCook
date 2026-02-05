import Navbar from "./Navbar";
import "./navbar.css";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/recipes" element={<h1>Recipes</h1>} />
        <Route path="/favorites" element={<h1>Favorites</h1>} />
        <Route path="/about" element={<h1>About</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
