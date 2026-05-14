import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/teste")({
  component: TestePage,
});

function TestePage() {
  async function testar() {
    console.log("testando supabase...");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(5);

    console.log("DATA:", data);
    console.log("ERROR:", error);
    alert(error ? error.message : "Conectou! Veja o console.");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Teste Supabase</h1>
      <button onClick={testar}>Testar conexão</button>
    </div>
  );
}