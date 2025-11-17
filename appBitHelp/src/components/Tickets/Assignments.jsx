import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
//import { differenceInHours} from 'date-fns';
//import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/AssignmentsCalendar.scss";
import TicketService from "../../services/TicketService";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Chip, Box, Typography, IconButton, Tooltip } from "@mui/material";
import Alert from '@mui/material/Alert';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useColorScheme, useTheme } from "@mui/material/styles";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import CheckIcon from '@mui/icons-material/Check';

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
    date: "Fecha",
    time: "Horario",
    event: "Tiquete",
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

  //Obtiene el tema y el esquema de colores para ajustar los colores de los componentes.
  const colorScheme = useColorScheme();
  const theme = useTheme();

  //**ASIGNACIÓN TEMPORAL DE USUARIO EN SESIÓN PARA PRUEBAS*/

  //localStorage.setItem('userSession', JSON.stringify({idRol: 2, idUsuario: 1}))

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

    <Box
      sx={{
        "& .rbc-header": {
          backgroundColor: 
            colorScheme.mode === "dark"
              ? theme.colorSchemes.dark.palette.background.paper
              : theme.colorSchemes.light.palette.background.paper,          
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
        "& .rbc-agenda-table": {
          backgroundColor:
            colorScheme.mode === "dark"
              ? theme.colorSchemes.dark.palette.background.paper
              : theme.colorSchemes.light.palette.background.paper,         
        },             
      }}
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
    </Box>
  );
}

//Renderiza un componente visual personalizado para mostrar cada uno de los eventos del calendario.
function CustomEvent({ event }) {
  //const { title, categoria, estado, tiempoRestante, idticket } = event.extendedProps || {};
  const theme = useTheme();
  const colorScheme = useColorScheme();

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
        padding: "8px 8px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: {
          xs: "column",
          sm: "column",
          md: "column",       
          lg: "row",
        },
        alignItems: {
          xs: "flex-start",
          lg: "center",
        },
        justifyContent: {
          xs: "flex-start",
          lg: "space-between",
        },
        gap: {
          xs: 1.2,
          md: 1.5,
        },
        fontSize: "0.85rem",
        boxShadow: 1,
        transition: "all 0.25s ease-in-out",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: {
            xs: "1 1 100%",
            lg: "1 1 50%",
          },
          minWidth: 0,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mb: 0.5,
            marginBottom: "0.5rem",
            fontSize: { xs: "0.9rem", md: "1rem" }, 
            maxWidth: {
              xs: "8rem",
              sm: "100%",
              md: "100%",
              lg: "100%" }          
          }}
        >
          <ConfirmationNumberIcon fontSize="small" color="primary" /> #
          {event.idTicket} : {event.ticketTitle}
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: { xs: "0.8rem", md: "0.9rem" },
          }}
        >
          <LocalOfferIcon fontSize="small" color="primary" /> {event.categorie}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "flex-start", md: "center" },
          alignItems: "center",
          textAlign: "center",         
          //flexBasis: { md: "7rem", lg: "8rem" },
          flexGrow: 1,
          flexShrink: 0,          
        }}
      >
        <Chip
          icon={
            <NotificationsIcon
              color={
                stateColor === "default"
                  ? colorScheme.mode === "dark"
                    ? "black"
                    : "white"
                  : theme.palette[stateColor].main
              }
            />
          }
          label={event.status}
          size="medium"
          sx={{
            fontSize: "0.8rem",
            backgroundColor:
              stateColor === "default"
                ? colorScheme.mode === "light"
                  ? "black"
                  : "white"
                : alpha(theme.palette[stateColor].main, 0.15),
            color:
              stateColor === "default"
                ? colorScheme.mode === "dark"
                  ? "black"
                  : "white"
                : theme.palette[stateColor].main,
            justifyContent: "center",
            fontWeight: "bold",
            minWidth: { xs: "100%", sm: "6rem", lg: "7rem" },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "flex-start", md: "center" },
          alignItems: "center",         
          //flexBasis: { md: "7rem", lg: "8.5rem" },
          flexGrow: 1,
          flexShrink: 0,        
        }}
      >
        <Chip
          icon={
            event.status === "Resuelto" || event.status === "Cerrado" ? (
              <CheckIcon color="white" />
            ) : (
              <WatchLaterIcon color="white" />
            )
          }
          label={
            event.status === "Resuelto" || event.status === "Cerrado"
              ? "Completado"
              : `${event.remainingTime}h restantes`
          }
          size="medium"
          sx={{
            fontSize: "0.8rem",
            color: "white",
            backgroundColor:
              event.status === "Resuelto" || event.status === "Cerrado"
                ? theme.palette.success.main
                : theme.palette.primary.main,
            minWidth: { xs: "100%", sm: "7rem", lg: "9rem" },
            justifyContent: "center",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "flex-end", lg: "flex-start" },
          flex: {
            xs: "1 1 100%",
            lg: "0 0 auto",
          },
          mt: { xs: 0.5, lg: 0 },
        }}
      >
        <Tooltip title="Ver detalle">
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

 

