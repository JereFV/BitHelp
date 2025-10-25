import React, { Component, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
//import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/AssignmentsCalendar.scss";
import moment from 'moment';
import TicketService from "../../services/TicketService";
import { formToJSON } from "axios";
//import { useTheme } from "@mui/material/styles";

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

export function Assignments() {
  
  //const theme = useTheme();

  //Constante auxiliar para manejar el arreglo de tickets.
  const [tickets, setTickets] = useState([]);

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

  const events = [
    {
      start: moment("2025-10-15T09:00:00").toDate(),
      end: moment("2025-10-15T13:00:00").toDate(),
      title:
        "Ticket #1 - Error al iniciar sesión. \n" +
        "Categoria: Inicio Sesion \n" +
        "Estado Actual: Pendiente \n" +
        "Tiempo Restante: 20 horas \n",
    },
    {
      start: moment("2025-10-15T12:30:00").toDate(),
      end: moment("2025-10-15T16:30:00").toDate(),
      title:
        "Ticket #2 - Error al iniciar sesión. \n" +
        "Categoria: Inicio Sesion \n" +
        "Estado Actual: Pendiente \n" +
        "Tiempo Restante: 20 horas \n",
    },
    {
      start: moment("2025-10-15T16:30:00").toDate(),
      end: moment("2025-10-16T16:30:00").toDate(),
      title:
        "Ticket #3 - Error al iniciar sesión. \n" +
        "Categoria: Inicio Sesion \n" +
        "Estado Actual: Pendiente \n" +
        "Tiempo Restante: 20 horas \n",
    },
  ];

  useEffect(() => {

    TicketService.getTicketsByRolUser(localStorage.getItem('Usuario'))
      .then((response) => {
        let eventsCalendar = [];

        response.forEach(ticket => {
          
          let event = {
            /*Asigna como fecha de inicio el momento en que el tiquete haya sido asignado al técnico, filtrando el historial del tiquete por el id
            del técnico y el estado "Asignado".(2)*/  
            start: ticket.historialTiquete.filter((movement) => movement.idUsuario == ticket.idTecnicoAsignado && movement.idEstado == 2)[0].fecha,
            end: ticket.Resolucion,
            title: `Ticket #${ticket.idticket} - ${ticket.titulo}
            \n Categoría: ${ticket.categoria.nombre}
            \n Estado Actual: ` 
          }
        });
      })
      .catch((error) => {
        if (error instanceof SyntaxError) {
          setError(error);
          console.log(error);
          setLoaded(false);
          throw new Error('Respuesta no válida del servidor');
        }
      });
  });

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
        events={events}
        style={{ height: "85vh" }}
        messages={messages}
        //culture={"es"}
        min={new Date(1900, 1, 1, 6, 0, 0)}
        //views={["week"]}
      />
    </div>
  );
}
 

