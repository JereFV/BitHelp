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
          path: 'tickets', // path es 'tickets' como padre
          children: [
            {
              // CLAVE: ticketsList ahora es relativo a 'tickets', resultando en '/tickets/ticketsList'
              path:'ticketsList', 
              element: <TicketsList/>
            }, 
            {
              // CLAVE: assignments es relativo a 'tickets', resultando en '/tickets/assignments'
              path:'assignments',
              element: <Assignments/>
            },
            {
              // CLAVE: assignments es relativo a 'tickets', resultando en '/tickets/assignments'
              path:'tickets',
              element: ""
            },

          ]
        },   
        {
          path:'categories',
          element: <CategoriesDataGridWithModal/>
        },
        {
          path:'technicianList',
          element: <TechnicianList/>
        },
        {
          path:'technician',
          children: [
              {
                path:'technicianList',
                element: <TechnicianList/>
              },
              {
                path:'technicianDetail',
                element: <TechnicianDetail/>
              }
          ]
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
