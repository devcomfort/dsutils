import { Router, Route } from "@solidjs/router";

import "./app.css";
import { Main } from "./pages";

function App() {
  return (
    <Router>
      <Route path={"/"} component={Main}></Route>
    </Router>
  );
}

export default App;
