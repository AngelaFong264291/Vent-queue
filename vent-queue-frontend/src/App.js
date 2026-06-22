import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import OwnerDashboard from "./pages/OwnerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/queue/:shopId" element={<CustomerPage />} />
        <Route path="/dashboard/:shopId" element={<OwnerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}