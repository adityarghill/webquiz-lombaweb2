import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Dashboard, Auth } from "@/layouts";
import { supabase } from "./utils/supabase";

function App() {

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    const { data, error } = await supabase
      .from("todos")
      .select("*");

    console.log("Data:", data);
    console.log("Error:", error);
  }

  return (
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

export default App;