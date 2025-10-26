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
//import { useTheme } from "@mui/material/styles";

export function Assignments() {

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

  useEffect(() => {
    //Agregar eventos al calendario a partir de la obtención de tiquetes para el técnico en sesión.
    TicketService.getTicketsByRolUser(localStorage.getItem('Usuario'))
      .then((response) => {
        //Arreglo auxiliar para almacenar los eventos a mostrar en el calendar.
        const eventsCalendar = response.map(ticket => 
        {
          /*Asigna como fecha de inicio el momento en que el tiquete haya sido asignado al técnico, filtrando el historial del tiquete por el id
          del técnico y el estado "Asignado".(2)*/ 
          const fechaInicio = ticket.historialTiquete.filter((movement) => movement.idUsuario == ticket.idTecnicoAsignado && movement.idEstado == 2)[0].fecha;
          //Calcula las horas restantes para la resolución del tiquete.
          const horasRestantes = differenceInHours(new Date(), fechaInicio)

          //Crea la estructura de evento esperada por el calendar para el tiquete en iteración.
          return {           
            start: fechaInicio,
            end: ticket.slaResolucion,
            title: `Ticket #${ticket.idticket} - ${ticket.titulo}
            \nCategoría: ${ticket.categoria.nombre}
            \nEstado Actual: ${ticket.estadoTiquete.nombre}
            \nTiempo Restante: ${horasRestantes} horas` 
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
        //culture={"es"}
        min={new Date(1900, 1, 1, 6, 0, 0)}
        //views={["week"]}
      />
    </div>
  );
}
 

