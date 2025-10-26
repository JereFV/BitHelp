import React, { Component, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import { differenceInHours, differenceInMinutes} from 'date-fns';
//import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/AssignmentsCalendar.scss";
import TicketService from "../../services/TicketService";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Chip, Box, Typography } from "@mui/material";
//import { useTheme } from "@mui/material/styles";

export function Assignments() 
{
  //Región cultural a utilizar.
  const locales = {
    'es': es,
  }

  //Formateador de fecha según la cultura definida
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  })

  //Configura el valor de las etiquetas mostradas en los botones del calendario.
  const messages = {
    week: "Semana",
    work_week: "Semana de trabajo",
    day: "Día",
    month: "Mes",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    agenda: "Agenda",

    showMore: (total) => `+${total} más`,
  };

  //const theme = useTheme();

  //Controla el renderizado del calendario al cambiar el estado de los tiquetes a mostrar.
  const [tickets, setTickets] = useState([]);

  //**ASIGNACIÓN TEMPORAL DE USUARIO EN SESIÓN PARA PRUEBAS*/

  localStorage.setItem('userSession', JSON.stringify({idRole: 2, idUser: 1}))

  useEffect(() => {
    //Agregar eventos al calendario a partir de la obtención de tiquetes para el técnico en sesión.
    TicketService.getTicketsByRolUser(JSON.parse(localStorage.getItem('userSession')))
      .then((response) => {
        //Arreglo auxiliar para almacenar los eventos a mostrar en el calendar.
        const eventsCalendar = response.data.map(ticket => 
        {
          /*Asigna como fecha de inicio el momento en que el tiquete haya sido asignado al técnico, filtrando el historial del tiquete por el id
          del técnico y el estado "Asignado".(2)*/ 
          const fechaInicio = new Date(ticket.historialTiquete.find((movement) => movement.idUsuario == ticket.idTecnicoAsignado && movement.idEstado == 2).fecha);
          //Calcula las horas restantes para la resolución del tiquete.
          const horasRestantes = differenceInHours(new Date(ticket.slaResolucion), new Date())

          //Crea la estructura de evento esperada por el calendar para el tiquete en iteración.
          return {
              idTicket: ticket.idTiquete,
              ticketTitle: ticket.titulo,
              categorie: ticket.categoria.nombre,
              status: ticket.estadoTiquete.nombre,
              remainingTime: horasRestantes,
              start: fechaInicio,
              end: new Date(ticket.slaResolucion),
              title: `#${ticket.idTiquete} ${ticket.titulo}`,
          };       
        });

        //Finalmente, vuelve a renderizar el calendario a partir del arreglo auxiliar de eventos.
        setTickets(eventsCalendar);
      })
      .catch((error) => {      
        console.log(error);      
      });
  }, []);

  return (
    <div
      className=""
      // style={{       
      //   '--rbc-today-bg': theme.palette.action.selected,
      //   '--rbc-toolbar-bg': theme.palette.background.default,
      //   '--rbc-toolbar-text': theme.palette.text.primary,
      //   '--rbc-button-bg': theme.palette.background.paper,
      //   '--rbc-button-text': theme.palette.text.primary,
      //   '--rbc-button-border': theme.palette.divider,
      //   '--rbc-button-hover-bg': theme.palette.primary.main,
      //   '--rbc-button-hover-text': theme.palette.primary.contrastText,
      //   '--rbc-button-active-bg': theme.palette.primary.main,
      //   '--rbc-button-active-text': theme.palette.primary.contrastText,
      //   '--rbc-header-bg': theme.palette.background.default,
      //   '--rbc-header-text': theme.palette.text.primary,
      // }}
    >
      <Calendar
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="week"
        events={tickets}
        style={{ height: "85vh" }}
        messages={messages}       
        min={new Date(1900, 1, 1, 6, 0, 0)}
        culture="es"
        views={["week", "day", "agenda"]}
        components={{
          event: CustomEvent,
        }}      
        timeslots={1}
      />
    </div>
  );
}

//Renderiza un componente visual personalizado para mostrar con cada uno de los eventos del calendario.
function CustomEvent({ event }) {
  //const { title, categoria, estado, tiempoRestante, idticket } = event.extendedProps || {};
  
  return (
    <Box
      sx={{
        backgroundColor: "var(--rbc-event-bg)",
        color: "var(--rbc-event-color)",
        padding: "6px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        fontSize: "0.85rem",
        boxShadow: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 0.5 }}>
        <ConfirmationNumberIcon size={12} /> #{event.idTicket}: {event.ticketTitle}
      </Typography>

      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <LocalOfferIcon size={11} /> {event.categorie}
      </Typography>

      <Chip
        label={event.status}
        size="small"
        sx={{
          mt: 0.5,
          alignSelf: "start",
          fontSize: "0.7rem",
          backgroundColor:
            event.status === "Asignado"
              ? "#f57c00"
              : event.status === "En Proceso"
              ? "#1976d2"
              : "#2e7d32",
          color: "white",
        }}
      />

      <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
        <WatchLaterIcon size={10} /> {event.remainingTime} h restantes
      </Typography>
    </Box>
  );
}
 

