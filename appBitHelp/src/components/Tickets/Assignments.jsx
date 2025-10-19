import React, { Component } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
//import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/AssignmentsCalendar.scss";
import moment from 'moment';
import { useTheme } from "@mui/material/styles";

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
      {/* <Typography
          //component="h1"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
          fontFamily={"sans-serif"}
          marginBottom={5}
        >   
          Calendario Semanal de Asignaciones
        </Typography> */}

      <Calendar
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="week"
        events={events}
        style={{ height: "85vh" }}
        messages={messages}
        culture={"es"}
        min={new Date(1900, 1, 1, 6, 0, 0)}
        //views={["week"]}
      />
    </div>
  );
}
 

