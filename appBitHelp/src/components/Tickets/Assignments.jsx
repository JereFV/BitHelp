import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import { differenceInHours} from 'date-fns';
//import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/AssignmentsCalendar.scss";
import TicketService from "../../services/TicketService";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Chip, Box, Typography, IconButton, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Alert from '@mui/material/Alert';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTheme } from "@mui/material/styles";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';

//Validación de propiedades.
CustomEvent.propTypes = {
  event: PropTypes.object,
};

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
    noEventsInRange: (
      <Alert severity="info" sx={{fontSize: "1rem", fontWeight: "bold"}}>
        No existen tiquetes registrados para la semana seleccionada.
      </Alert>
    )
  };

  //Controla el renderizado del calendario al cambiar el estado de los tiquetes a mostrar.
  const [tickets, setTickets] = useState([]);

  //Constante para el manejo de la fecha seleccionada en el objeto calendar, a partir del inicio de la semana en visualización.
  const [date, setDate] = useState(new Date(startOfWeek(new Date(), {weekStartsOn: 1})));

  //Constante de navegación, actualizando la fecha en el calendario según la semana seleccionada.
  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);

  //**ASIGNACIÓN TEMPORAL DE USUARIO EN SESIÓN PARA PRUEBAS*/

  localStorage.setItem('userSession', JSON.stringify({idRol: 2, idUsuario: 1}))

  useEffect(() => {
    //Agregar eventos al calendario a partir de la obtención de tiquetes para el técnico en sesión.
    TicketService.getTicketsByRolUser(JSON.parse(localStorage.getItem('userSession')))
      .then((response) => {
        //Arreglo auxiliar para almacenar los eventos a mostrar en el calendar.
        const eventsCalendar = response.data.map(ticket => 
        {
          /*Asigna como fecha de inicio el momento en que el tiquete haya sido asignado al técnico, filtrando el historial del tiquete por el id
          del técnico y el estado "Asignado".(2)*/ 
          //const fechaInicio = new Date(ticket.historialTiquete.find((movement) => movement.usuario.idUsuario == ticket.idTecnicoAsignado && movement.idEstado == 2).fecha);
          //Calcula las horas restantes para la resolución del tiquete.
          //const horasRestantes = differenceInHours(new Date(ticket.slaResolucion), new Date())

          //Crea la estructura de evento esperada por el calendar para el tiquete en iteración.
          return {
              idTicket: ticket.id,
              ticketTitle: ticket.titulo,
              categorie: ticket.categoria,
              status: ticket.estado,
              remainingTime: ticket.tiempoRestante,
              start: new Date(ticket.fechaAsignacion),
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
        defaultView="agenda"        
        events={tickets}
        style={{ height: "85vh" }}
        messages={messages}       
        min={new Date(1900, 1, 1, 6, 0, 0)}
        culture="es"
        views={["agenda"]}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar,
           
        }}      
        timeslots={1}
        length={7}  
        date={date}
        onNavigate={onNavigate}
      />
    </div>
  );
}

//Renderiza un componente visual personalizado para mostrar cada uno de los eventos del calendario.
function CustomEvent({ event }) {
  //const { title, categoria, estado, tiempoRestante, idticket } = event.extendedProps || {};
  const theme = useTheme();

  // Asignación de colores para los chips de ESTADO
  const getStateColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'error';
      case 'Asignado':
        return 'warning';
      case 'En Proceso':
        return 'info';
      case 'Resuelto':
        return 'success';
      case 'Cerrado':
        return 'default';
      default:
        return 'default';
    }
  };

  //Almacena el color a mostrar en el chip del estado.
  const stateColor = getStateColor(event.status);
  
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.action.default,       
        padding: "6px 10px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        fontSize: "0.85rem",
        boxShadow: 1,
      }}
    >      
      <Box sx={{ display: "flex", flexDirection: "column", minWidth: "24.5rem"}}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 0.5,                        
            whiteSpace: "nowrap",
            marginBottom: "0.8rem"           
          }}
        >
          <ConfirmationNumberIcon fontSize="small" color="primary" /> #{event.idTicket}: {event.ticketTitle}
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,                  
          }}
        >
          <LocalOfferIcon fontSize="small" color="primary"/> {event.categorie}
        </Typography>
      </Box>

      <Box display={"flex"} >
          <Chip
            icon={<NotificationsIcon color={stateColor == "default" ? theme.palette.mode === "dark" ? "black" : "white" : theme.palette[stateColor].main}/>}
            label={event.status}
            size="medium"
            sx={{
              fontSize: "0.8rem",
              //El color es definido según el estado del tiquete.
              backgroundColor: stateColor == "default" ? theme.palette.mode === "light" ? "black" : "white" : alpha(theme.palette[stateColor].main, 0.15),
              color:  stateColor == "default" ? theme.palette.mode === "dark" ? "black" : "white" : theme.palette[stateColor].main,
              marginRight: "1.5rem",
              minWidth: "6rem"       
            }}          
          />

          <Chip
            icon={<WatchLaterIcon color="white"/>}
            label={`${event.remainingTime}h restantes`}
            size="medium"
            sx={{
              fontSize: "0.8rem",
              color: "white",
              backgroundColor: "#1976d2"                        
            }}            
          />
      </Box>
       
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,          
        }}
      >       
        <Tooltip title="Ver detalle" >
          <IconButton
            size="medium"
            to={`/ticket/${event.idTicket}`}
            component={Link}
            sx={{
              color: "var(--rbc-event-color)",
              "&:hover": { color: "#1976d2" },
            }}
          >
            <InfoOutlinedIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function CustomToolbar({ date, onNavigate }) {

  //Constantes que definen el intervalo de fechas semanal seleccionado
  const start = new Date(startOfWeek(date, {weekStartsOn: 1}));
  const end = new Date(date);

  //Se configura el intervalo de fechas de lunes a domingo de la semana seleccionada.
  start.setDate(start.getDate());
  end.setDate(start.getDate() + 6);

  //Formato definido para la construcción del label de fechas según selección.
  const format = (date) =>
    date.toLocaleDateString("es-CR", {
      day: "numeric",
      month: "long",
    });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingY: 1,
        paddingX: 2,
        backgroundColor: "transparent",
        marginBottom: "1.5rem"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1}}>
        {/* Botón Anterior */}
        <IconButton  onClick={() => onNavigate("PREV")}>
          <SkipPreviousIcon fontSize="large" color="primary"/>       
        </IconButton >

        {/* <CalendarMonthIcon fontSize="medium" color="primary" /> */}
        <Typography variant="h5" sx={{ fontWeight: "600", borderRadius: "4px" }}>
          Semana del {format(start)} al {format(end)}
        </Typography>

        {/* Botón Siguiente */}
        <IconButton  onClick={() => onNavigate("NEXT")}>
          <SkipNextIcon fontSize="large" color="primary"/>       
        </IconButton >
      </Box>     
    </Box>
  );
}

 

