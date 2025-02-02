import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./views/home/home";
// import { Game } from "./views/game/game";

function App() {
  return (
    <Router>
      <div className='container mt-5'>
        <Switch>
          <Route exact path='/' component={Home} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
