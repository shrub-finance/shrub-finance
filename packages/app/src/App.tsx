import OptionsView from "./pages/OptionsView";
import PositionsView from "./pages/PositionsView";
import TopNav from "./components/TopNav";
import { Router } from "@reach/router";
import HomeView from "./pages/HomeView";

function App() {
  return (
    <div className="App">
      <TopNav />
      <Router>
        <HomeView path="/" />
        <PositionsView path="positions" />
        <OptionsView path="options" />
      </Router>
    </div>
  );
}

export default App;
