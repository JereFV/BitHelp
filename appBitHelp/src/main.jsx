import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { RouterProvider } from "react-router";
import { Assignments } from "./components/Tickets/Assignments";
import { CategoriesDataGridWithModal } from "./components/Categories/Categories";
import TechnicianList from "./components/Technician/TechnicianList";
import TechnicianDetail from "./components/Technician/TechnicianDetail"; 
import TicketsList from "./components/Tickets/TicketsList";

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
        {
          path:'/categories',
          element: <CategoriesDataGridWithModal/>
        },
        {
          path:'/techniciansList',
          element: <TechnicianList/>
        },
        {
          path:'/techniciansDetails',
          element: <TechnicianDetail/>
        },
        {
          path:'/ticketsList',
          element: <TicketsList/>
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
