import "./App.css";

export default function App() {
  console.log(import.meta.env.VITE_SOME_KEY) // "123"
  console.log(import.meta.env.DB_PASSWORD) // undefined
  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      TEST
    </div>
  );
}
