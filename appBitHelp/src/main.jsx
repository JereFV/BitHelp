import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { RouterProvider } from "react-router";
import { Assignments } from "./components/Tickets/Assignments";

const rutas=createBrowserRouter(
  [
    {
      element: <App />,
      children:[
        {
          path:'/', //Cargado inicial del aplicativo, sin una ruta definida.
          element: <Home />
        },
        {
          path:'/home',
          element: <Home />
        },
        {
          path:'/asignations',
          element: <Assignments />
        },
      ]
    }
  ]
)

createRoot(document.getElementById("root")).render(
  <StrictMode> 
  <RouterProvider router={rutas} /> 
</StrictMode>, 
);
