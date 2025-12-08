import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/Home/Home";
import  Dashboard  from "./components/Dashboards/Dashboard";
import { RouterProvider } from "react-router";
import { Assignments } from "./components/Tickets/Assignments";
import { CategoriesDataGridWithModal } from "./components/Categories/Categories";
import { TechniciansDataGridWithModal } from "./components/Technicians/Technicians";
import TicketsList from "./components/Tickets/TicketsList";
import UserProvider from './components/User/UserProvider';
import { TicketDetail } from "./components/Tickets/TicketDetail";
import { CreateTicket } from "./components/Tickets/CreateTicket";
import UserMaintenance from "./components/User/UserMaintenance.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login/Login";
import ChatBot from "./components/ChatBot/ChatBotContainer";
import { CssBaseline } from "@mui/material";
import { botTheme } from "./themes/theme";
import { AppProvider } from "@toolpad/core";
import './Utilities/handleChatBotWarnings';

const rutas = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/home',
        element: <Home />
      },
      {
        path: 'tickets',
        children: [
          {
            path: 'ticketsList',
            element: <TicketsList />
          },
          {
            path: 'assignments',
            element: <Assignments />
          },
          {
            path: 'createTicket',
            element: <CreateTicket />
          }
        ]
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'categories',
        element: <CategoriesDataGridWithModal />
      },
      {
        path: 'technician',
        element: <TechniciansDataGridWithModal />
      },
      {
        path: 'ticket/:id',
        element: <TicketDetail />
      },
      {
        path: 'users',
        element: <UserMaintenance />
      }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <StrictMode>
      <NotificationProvider>
        <UserProvider>
          <RouterProvider router={rutas} />
        </UserProvider>
      </NotificationProvider>
    </StrictMode>

    {/*ChatBot renderizado fuera del strict mode para evitar duplicación de opciones. (Producto de la antiguedad de la librería)*/}
    <AppProvider theme={botTheme}>
      <CssBaseline enableColorScheme />
      <ChatBot />
    </AppProvider>
  </AuthProvider>
);