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
        <Route exact path="/room/:id">
          <Room />
        </Route>
        <Route path="/room">
          Room ID Required
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/">
          Not Found
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
