import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { RouterProvider } from "react-router";
import { Assignments } from "./components/Tickets/Assignments";
import { CategoriesDataGridWithModal } from "./components/Categories/Categories";
import { TechniciansDataGridWithModal } from "./components/Technicians/Technicians";
import TicketsList from "./components/Tickets/TicketsList";
import UserProvider from './components/User/UserProvider';
import { TicketDetail } from "./components/Tickets/TicketDetail";
import { CreateTicket } from "./components/Tickets/CreateTicket";
import UserMaintenance from "./components/User/UserMaintenance.jsx";
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
              path:'createTicket',
              element: <CreateTicket/>
            }            
          ]
        },   
        {
          path:'categories',
          element: <CategoriesDataGridWithModal/>
        },
        {
          path:'technician',
          element: <TechniciansDataGridWithModal/>
        },
        {
          // CLAVE: assignments es relativo a 'tickets', resultando en '/tickets/assignments'
          path:'ticket/:id',
          element: <TicketDetail/>
        },
        {
          path:'users',
          element: <UserMaintenance/>
        }

      ]
    }
  ]
)

createRoot(document.getElementById("root")).render(
  <StrictMode> 
    <UserProvider >
        <RouterProvider router={rutas} /> 
    </UserProvider>
  
</StrictMode>, 
);
