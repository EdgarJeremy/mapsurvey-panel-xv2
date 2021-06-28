import Login from "./pages/Login";
import Panel from "./pages/Panel";
import Register from "./pages/Register";

const routes = [
    { component: Login, path: '/', exact: true },
    { component: Register, path: '/register' },
    { component: Panel, path: '/panel' }
];
export default routes;