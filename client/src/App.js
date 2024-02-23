import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Join from "./components/Join/Join";
import Game from "./components/Game/Game";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Join />} exact></Route>
      <Route path="/game" element={<Game />}></Route>
    </Routes>
  </Router>
);

export default App;
