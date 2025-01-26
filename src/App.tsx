import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Map from "./pages/map";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import Header from "./components/header/header";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Header />
      <Toaster position="bottom-right" />
      <MantineProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<Map />} />
          </Routes>
        </Router>
      </MantineProvider>
    </>
  );
}

export default App;
