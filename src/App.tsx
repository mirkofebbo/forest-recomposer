import "./App.css";
import Recomposer from "./components/Recomposer";
import { fragments } from "./data/seed";

export default function App() {
  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Forest Video Recomposer</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.8 }}>
          Decompose + recompose YouTube forest videos by non-cinematic logics.
        </p>
      </header>

      <Recomposer fragments={fragments} />

      <footer style={{ marginTop: 16, opacity: 0.7, fontSize: 12 }}>
        Tip: click a fragment card to jump; use “Mode” to change ordering.
      </footer>
    </div>
  );
}
