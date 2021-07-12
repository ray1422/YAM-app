import {
  BrowserRouter, Switch, Route,
} from "react-router-dom";
import 'styles/general.css';
import Home from 'pages/Home/index';
import Room from "pages/Room";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/room/:id/:name">
          <Room />
        </Route>
        <Route path="/:name">
          <Home />
        </Route>
        <Route path="/">
          <Home />
        </Route>
        {/* <Route path="/">
          Not Found
        </Route> */}
      </Switch>
    </BrowserRouter>
  );
}

export default App;
