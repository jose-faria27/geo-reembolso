import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Formulario from "./pages/Formulario";
import Solicitacoes from "./pages/Solicitacoes";
import Gestao from "./pages/Gestao";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formulario" element={<Formulario />} />
        <Route path="/solicitacoes" element={<Solicitacoes />} />
        <Route path="/gestao" element={<Gestao />} />
      </Routes>
    </Router>
  );
}

export default App;