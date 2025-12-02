import React, {useState, useEffect, useRef, useContext} from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CategoryIcon from '@mui/icons-material/Category';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import {Card, CardContent, Grid, IconButton, Divider, Box, Typography, Modal, Stack, useTheme, Button, FormControl, InputLabel, Select, FormHelperText, MenuItem} from "@mui/material";
import { Person, CalendarMonth, Image as ImageIcon, Close } from "@mui/icons-material";
import HistoryIcon from '@mui/icons-material/History';
import TicketService from "../../services/TicketService";
import { useParams } from 'react-router-dom';
import StarsIcon from '@mui/icons-material/Stars';
import Alert from '@mui/material/Alert';
import StarIcon from '@mui/icons-material/Star';
import Rating from '@mui/material/Rating';
import { getSLAStatus } from '../../Utilities/slaCalculations';
import CommentIcon from '@mui/icons-material/Comment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import { Controller, useForm } from "react-hook-form";
import ImagesSelector from './ImagesSelector';
import TicketStatusFlowService from '../../services/TicketStatusFlowService';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TicketImageService from '../../services/TicketImageService';
import { NotificationContext } from '../../context/NotificationContext';

//URL de imágenes de tiquetes guardadas.
const BASE_URL = import.meta.env.VITE_BASE_URL;

//Posibles estados del tiquete.
const ID_ASIGNED_STATE = "2";
const ID_INPROGRESS_STATE = "3";
const ID_RESOLVED_STATE = "4";
const ID_CLOSED_STATE = "5";
const ID_RETURNED_STATE = "6";

const ID_CLIENT_ROLE = "1";
const ID_TECHNICIAN_ROLE = "2";
const ID_ADMINISTRATOR_ROLE = "3";

//Validación de propiedades para el historial del tiquete
TicketHistory.propTypes = {
  movements: PropTypes.array
}

// Mapeo para obtener los colores del tema de Material UI
const getColorMap = (theme, severity) => {
    switch (severity) {
        case 'success':
            return {
                backgroundColor: '#E6F4EA', // Fondo verde muy claro
                iconColor: '#388E3C',        // Icono verde oscuro
                textColor: '#1B5E20',        // Texto verde muy oscuro
            };
        case 'error':
            return {
                backgroundColor: '#FDECEA',  // Fondo rojo muy claro
                iconColor: '#D32F2F',         // Icono rojo oscuro
                textColor: '#C62828',         // Texto rojo muy oscuro
            };
        case 'warning':
            return {
                backgroundColor: '#FFF8E1',
                iconColor: '#FFC107',
                textColor: '#FF6F00',
            };
        default:
            return {
                backgroundColor: '#E3F2FD',
                iconColor: '#1976D2',
                textColor: '#0D47A1',
            };
    }
};

export function TicketDetail() 
{
  const { refreshCount } = useContext(NotificationContext);

  //Variable que contiene los campos del formulario en un formato de llave -> valor.
  let formData = new FormData();

  //Referencia al contenido del modal.
  const modalContentRef = useRef(null);

  //Almacena los datos del usuario en sesión a partir de la información de localStorage.
  const userSession = JSON.parse(localStorage.getItem("userSession"));

  //Estilos definidos para el contenedor padre.
  const styleParentBox = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: {
      xs: "90%", // 90% width on extra-small screens
      sm: "80%", // 80% width on small screens
      md: "70%", // 70% width on medium screens
      lg: "60%", // 60% width on large screens
      xl: "50%", // 50% width on extra-large screens
    },
    maxHeight: "90vh",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    paddingBottom: 0,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    pr: 1,
  };

  const labelsTicketRating = {
    1: "Deficiente",
    2: "Malo",
    3: "Regular",
    4: "Bueno",
    5: "Excelente",
  };

  //Esquema de validación de los campos de entrada del formulario de nuevo movimiento.
  const newMovementSchema = yup.object({
    idNewState: yup
      .number()
      .typeError("El nuevo estado del tiquete es requerido."),
    comment: yup
      .string()
      .required("Es requerido que digite un comentario u observación.")
      .max(300, "El comentario debe tener un máximo de 300 caracteres."),
  });

  //Incializacióm del formulario junto con el valor predefinido de los campos.
  const {
    control,
    setValue,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      idTicket: "",
      idSessionUser: "",
      idNewState: "",
      comment: "",
    },
    // Asignación de validaciones haciendo uso del esquema de tiquetes yup.
    resolver: yupResolver(newMovementSchema),
  });

  //Obtiene el tema configurado.
  const theme = useTheme();

  //Constante para el manejo de navegación y ruteo.
  const navigate = useNavigate();

  //Obtiene los parámetros de enrutamiento contenidos en la dirección.
  const routeParams = useParams();

  //Constante auxiliar para controlar la apertura del modal.
  const [open, setOpen] = React.useState(true);

  //Función de cerrado del modal.
  const handleClose = () => {
    setOpen(false);

    //Redirrecionamiento a la pestaña de navegación anterior.
    navigate(-1);
  };

  //Constantes que almacenan el detalle del tiquete y sus movimientos.
  const [ticket, setTicket] = useState({});
  const [movements, setMovements] = useState([]);
  const [slaDetails, setSlaDetails] = useState({});

  //Almacena las imágenes adjuntas.
  const [images, setImages] = useState([]);

  //Estados seleccionables en un nuevo movimiento del tiquete.
  const [ticketStates, setTicketStates] = useState([]);

  //Controla el renderizado de las secciones de registro de nuevos movimientos y valoración del tiquete.
  const [displayNewMovSection, setDisplayNewMovSection] = useState(false);
  const [displayValorationSection, setDisplayValorationSection] = useState(false);

  //"Bandera" auxiliar de refrescamiento del modal utilizada como dependencia para el UseEffect.
  const [refresh, setRefresh] = useState(0);

  let slaRespuestaDisplay = null;
  let slaResolucionDisplay = null;

  if (slaDetails) {
    // Uso de la función importada  para calcular el estado de respuesta
    slaRespuestaDisplay = getSLAStatus(
      slaDetails.SLARespuestaLimite,
      slaDetails.FechaRespuestaReal,
      slaDetails.cumplimientoSlaRespuesta
    );

    // Uso de la función importada para calcular el estado de resolución
    slaResolucionDisplay = getSLAStatus(
      slaDetails.SLAResolucionLimite,
      slaDetails.FechaResolucionReal,
      slaDetails.cumplimientoSlaResolucion
    );
  }

  //Determina el renderizado de la sección de agregado de nuevos movimientos del tiquete a partir del estado del mismo y el rol del usuario en sesión.
  const validateDisplayNewMovSection = (idTicketState) => {
    //Variable auxiliar para determinar el llenado de valores en el control de "Nuevo Estado".
    let display = false;

    switch (idTicketState) {
      //Si el caso está asignado, en progreso o devuelto, renderiza únicamente para el técnico asignado al tiquete.
      case ID_ASIGNED_STATE:
      case ID_INPROGRESS_STATE:
      case ID_RETURNED_STATE:
        if (userSession.idRol == ID_TECHNICIAN_ROLE) {
          setDisplayNewMovSection(true);
          display = true;
        }
        else
          setDisplayNewMovSection(false);

        break;
      //Si el caso está resuelto, renderiza únicamente para el cliente que reportó el tiquete.
      case ID_RESOLVED_STATE:
        if (userSession.idRol == ID_CLIENT_ROLE || userSession.idRol == ID_ADMINISTRATOR_ROLE) {
          setDisplayNewMovSection(true);
          display = true;
        }
        else
          setDisplayNewMovSection(false);

        break;
      //Al cerrarse el tiquete, oculta la sección.
      case ID_CLOSED_STATE:
        setDisplayNewMovSection(false);
    }

    //Obtiene los estados seleccionables en un nuevo movimiento del tiquete al determinar la renderización del formulario.
    if (display) {
      TicketStatusFlowService.getStates(idTicketState)
        .then((response) => {
          setTicketStates(response.data);
        })
        .catch((error) => {
          console.error(error);
        });

      //Asigna el id del usuario en sesión al campo hidden del formulario.
      setValue("idSessionUser", userSession.idUsuario);
    }
  };

  //Evento submit del formulario de nuevo movimiento tiquete.
  const onSubmit = (DataForm) => {
    try 
    {
      //Valida que los campos del formulario cumplan con las especificaciones requeridas.
      if (newMovementSchema.isValid()) 
      {
        //Creación del nuevo movimiento en el historial de tiquetes.
        TicketService.updateTicket(DataForm)
          .then(() => {
            //Si hay imágenes adjuntas, las almacena en referencia al movimiento recién ingresado.
            if (images.length > 0) 
            {
              //Arma la estructura de entrada para el almacenamiento de imágenes.
              formData.append("idTicket", DataForm.idTicket);

              //Recorre cada una de las imágenes adjuntas para añadirlas en el arreglo.
              images.map((image) => (
                formData.append("files[]", image.file)
              ))
              
              //Almacenamiento de imágenes, una vez actualizado el tiquete.
              TicketImageService.uploadImages(formData)
                .then(() => {
                  //Refresca los datos del formulario actualizados y limpia el contenedor de imágenes adjuntas.
                  setImages([]);
                  setRefresh(i => i + 1); 
                })
                .catch((error) => {
                  console.error(error);
                  throw error;
                });
            }
            else
              //Refresca los datos del formulario actualizados, sin haber almacenado imágenes..
              setRefresh(i => i + 1);
            
            //Limpia los campos del formulario
            reset({idNewState: "", comment: ""});

            //Se posiciona al inicio del modal, dando un efecto de "recargado de página".
            modalContentRef.current.scrollTop  = 0;

            refreshCount(); // Actualiza el contador de notificaciones

            toast.success(
              `Se ha registrado correctamente el movimiento del tiquete.`,
              { duration: 4000 }
            );    
          })
          .catch((error) => {
            toast.error("Ha ocurrido un error al intentar registrar el movimiento del tiquete.");
            console.error(error);
          });
      }
    } 
    catch (error) {
      toast.error( "Ha ocurrido un error al intentar registrar el movimiento del tiquete.");
      console.error(error);
    }
  };

  //Evento error del formulario.
  const onError = (errors, e) => {
    toast.error("Ha ocurrido un error al intentar registrar el movimiento del tiquete.");
    console.log(errors, e);
  };

  useEffect(() => {
    const idTiquete = routeParams.id;

    //Obtiene el detalle del tiquete a partir del valor enviado.
    TicketService.getTicketById(idTiquete)
      .then((response) => {
        //Seteo del tiquete e historial de movimientos en las constantes de renderización.
        setTicket(response.data);
        setMovements(response.data.historialTiquete);

        //Variable auxiliar para obtener el estado del tiquete a partir de la respuesta de la petición.
        const idTicketState = response.data?.estadoTiquete?.idEstadoTiquete;

        //Invoca el renderizado del formulario de nuevo movimiento en tiquete
        validateDisplayNewMovSection(idTicketState);

        //Renderiza la sección de valoración del tiquete al estar en un estado cerrado.
        if (idTicketState == ID_CLOSED_STATE) 
          setDisplayValorationSection(true);

        //Almacena el código del tiquete en un elemento de tipo hidden.
        setValue("idTicket", response.data?.idTiquete);
      })
      .catch((error) => {
        toast.error(
          "Ha ocurrido un error al intentar obtener el detalle del tiquete."
        );
        console.error(error);
      });

    TicketService.getSlaDetailsById(idTiquete)
      .then((response) => {
        setSlaDetails(response.data); // Almacena los límites y fechas reales del backend
      })
      .catch((error) => {
        toast.error(
          "Ha ocurrido un error al intentar obtener los detalles de SLA del tiquete."
        );
        console.error("Error al obtener detalles de SLA:", error);
      });
  }, [routeParams.id, refresh]);

  return (
    <div>
      <Modal
        open={open}
        onClose={(reason) => {
          //Previene el cerrado del modal al clickear el backdrop autogenerado.
          if (reason === "backdropClick") return;

          handleClose;
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box ref={modalContentRef} sx={styleParentBox}>
          <Box sx={{ mb: 3, flexShrink: 0 }}>
            <Typography
              id="modal-modal-title"
              variant="h5"
              component="h2"
              sx={{
                fontSize: "2rem",
                textAlign: "center",
                //Sombra sútil para resaltar el texto
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              Tiquete N.° {ticket.idTiquete} - {ticket.titulo}
            </Typography>

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              marginBottom="2rem"
            >
              <Stack alignItems={"center"} direction={"row"}>
                <ConfirmationNumberIcon
                  fontSize="large"
                  color="primary"
                  style={{ marginRight: "1%" }}
                />
                Información General
              </Stack>
            </Typography>

            <TextField
              id="standard-basic"
              label="Descripción"
              value={ticket.descripcion ?? ""}
              fullWidth
              multiline
              maxRows={3}
              slotProps={{
                input: {
                  readOnly: true,
                  style: {
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                  },
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "start", marginRight: "8px" }}
                    >
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack direction="row" spacing="10%" paddingBottom="1.5rem">
              <TextField
                id="outlined-read-only-input"
                label="Usuario Solicitante"
                value={
                  ticket.usuarioSolicita
                    ? `${ticket.usuarioSolicita?.nombre} ${ticket.usuarioSolicita?.primerApellido} ${ticket.usuarioSolicita?.segundoApellido}`
                    : ""
                }
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimeField
                  label="Fecha de Creación"
                  value={
                    ticket.fechaCreacion ? dayjs(ticket.fechaCreacion) : null
                  }
                  readOnly={true}
                  format="DD/MM/YYYY hh:mm:ss a"
                  fullWidth
                  slotProps={{
                    textField: {
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="primary" />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Stack>

            <Stack direction="row" spacing="10%" paddingBottom="1.5rem">
              {/* Campo 1: ESTADO (Ocupa la mitad de la fila) */}
              <TextField
                id="outlined-read-only-input"
                label="Estado"
                fullWidth
                value={ticket.estadoTiquete?.nombre ?? ""}
                sx={{ flex: 1 }}
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <NotificationsIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Contenedor de Prioridad y Método de Asignación (Ocupa la otra mitad de la fila) */}
              <Stack
                direction="row"
                spacing={2}
                sx={{ flex: 1 }} // El flex: 1 asegura que este Stack ocupe el otro 50%
              >
                {/* Prioridad (Ocupa 25% del total, 50% de su contenedor padre) */}
                <TextField
                  id="outlined-read-only-input"
                  label="Prioridad"
                  fullWidth
                  value={ticket.prioridad?.nombre ?? ""}
                  sx={{ flex: 1 }} // Asegura 50% del Stack padre
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PriorityHighIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Método de Asignación (Ocupa 25% del total, 50% de su contenedor padre) */}
                <TextField
                  id="outlined-read-only-input-asignation-method"
                  label="Método de Asignación"
                  fullWidth
                  value={
                    ticket.metodoAsignacion
                      ? ticket.metodoAsignacion?.nombre
                      : "No asignado"
                  }
                  sx={{ flex: 1 }} // Asegura 50% del Stack padre
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <StarsIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            </Stack>

            <Stack direction="row" spacing="10%" paddingBottom="1.5rem">
              <TextField
                id="outlined-read-only-input"
                label="Técnico Asignado"
                fullWidth
                value={
                  ticket.tecnicoAsignado
                    ? `${ticket.tecnicoAsignado?.nombre} ${ticket.tecnicoAsignado?.primerApellido} ${ticket.tecnicoAsignado?.segundoApellido}`
                    : "Sin Asignar"
                }
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SupportAgentIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                id="outlined-read-only-input"
                label="Categoría"
                fullWidth
                value={ticket.categoria?.nombreCategoria ?? ""}
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              marginBottom="2rem"
            >
              <Stack alignItems={"center"} direction={"row"}>
                <AccessAlarmIcon
                  fontSize="large"
                  color="primary"
                  style={{ marginRight: "1%" }}
                />
                Métricas de SLA y Cumplimiento
              </Stack>
            </Typography>

            {slaDetails ? (
              <>
                {/*SLA Respuesta*/}
                <Stack
                  direction={{ md: "row" }}
                  spacing="10%"
                  paddingBottom={{ xs: "3.5rem", md: "1.5rem" }}
                >
                  <Stack
                    width={{ xs: "100%", sm: "50%" }}
                    paddingBottom={{ xs: "1.5rem", md: "0rem" }}
                    alignSelf={{ md: "center" }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimeField
                        label="SLA Respuesta Límite"
                        value={
                          slaDetails.SLARespuestaLimite
                            ? dayjs(slaDetails.SLARespuestaLimite)
                            : null
                        }
                        readOnly={true}
                        fullWidth
                        format="DD/MM/YYYY hh:mm:ss a"
                        slotProps={{
                          textField: {
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarIcon color="primary" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>

                  <Stack width={{ xs: "100%", sm: "50%" }}>
                    {/* Obtener colores basados en el estado (usando slaRespuestaDisplay.color) */}
                    {(() => {
                      const { backgroundColor, iconColor, textColor } =
                        getColorMap(theme, slaRespuestaDisplay.color);
                      return (
                        <Box
                          sx={{
                            backgroundColor: backgroundColor,
                            borderRadius: 2, // Bordes redondeados
                            p: 0.8, // Padding interno
                            display: "flex",
                            alignItems: "center",
                            textAlign: "left",
                            gap: 1, // Espacio entre ícono y texto
                          }}
                        >
                          {/* Ícono de Alarma */}
                          <AccessAlarmIcon
                            sx={{ color: iconColor }}
                            fontSize="large"
                          />

                          {/* Stack con el Contenido */}
                          <Stack sx={{ color: textColor }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              fontSize="1rem"
                            >
                              Estado: {slaRespuestaDisplay.estado}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              fontSize="0.9rem"
                            >
                              {slaRespuestaDisplay.tiempoRestante}
                            </Typography>
                            {slaDetails.FechaRespuestaReal && (
                              <Typography
                                variant="caption"
                                display="block"
                                fontSize="0.8rem"
                              >
                                Respondido:{" "}
                                {dayjs(slaDetails.FechaRespuestaReal).format(
                                  "DD/MM/YYYY hh:mm:ss a"
                                )}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      );
                    })()}
                  </Stack>
                </Stack>

                {/*SLA Resolución*/}
                <Stack direction={{ md: "row" }} spacing="10%">
                  <Stack
                    width={{ xs: "100%", sm: "50%" }}
                    paddingBottom={{ xs: "1.5rem", md: "0rem" }}
                    alignSelf={{ md: "center" }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimeField
                        label="SLA Resolución Límite"
                        value={
                          slaDetails.SLAResolucionLimite
                            ? dayjs(slaDetails.SLAResolucionLimite)
                            : null
                        }
                        readOnly={true}
                        // Aseguramos que se vean los segundos
                        format="DD/MM/YYYY hh:mm:ss a"
                        slotProps={{
                          textField: {
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarIcon color="primary" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>

                  <Stack width={{ xs: "100%", sm: "50%" }}>
                    {(() => {
                      const { backgroundColor, iconColor, textColor } =
                        getColorMap(theme, slaResolucionDisplay.color);
                      return (
                        <Box
                          sx={{
                            backgroundColor: backgroundColor,
                            borderRadius: 2,
                            p: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <AccessAlarmIcon
                            sx={{ color: iconColor }}
                            fontSize="large"
                          />

                          <Stack sx={{ color: textColor }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              fontSize="1rem"
                            >
                              Estado: {slaResolucionDisplay.estado}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              fontSize="0.9rem"
                            >
                              {slaResolucionDisplay.tiempoRestante}
                            </Typography>
                            {slaDetails.FechaResolucionReal && (
                              <Typography
                                variant="caption"
                                display="block"
                                fontSize="0.8rem"
                              >
                                Resuelto:{" "}
                                {dayjs(slaDetails.FechaResolucionReal).format(
                                  "DD/MM/YYYY hh:mm:ss a"
                                )}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      );
                    })()}
                  </Stack>
                </Stack>
              </>
            ) : (
              <Alert severity="info">Cargando métricas de SLA...</Alert>
            )}
          </Box>

          <TicketHistory movements={movements}></TicketHistory>

          {/*Nuevo Movimiento Tiquete (Flujo del Tiquete)*/}
          {/*Renderiza únicamente si el estado del tiquete no es Pendiente ni Cerrado.*/}
          {displayNewMovSection ? (
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <Box sx={{paddingBottom: "1.5rem"}}>
                <Divider sx={{ mb: 3 }} />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  marginBottom="2rem"
                >
                  <Stack alignItems={"center"} direction={"row"}>
                    <AddIcon
                      fontSize="large"
                      color="primary"
                      style={{ marginRight: "1%" }}
                    />
                    Nuevo Movimiento Tiquete
                  </Stack>
                </Typography>

                {/*Campos tipo hidden que son enviados durante el evento submit.*/}
                <input type="hidden" {...register("idTicket")} />
                <input type="hidden" {...register("idSessionUser")} />

                <Stack
                  width={{ sm: "50%", lg: "35%" }}
                  paddingBottom={"1.5rem"}
                >
                  <FormControl fullWidth>
                    <Controller
                      name="idNewState"
                      control={control}
                      render={({ field }) => (
                        <>
                          <InputLabel id="id">Nuevo Estado</InputLabel>
                          <Select
                            {...field}
                            labelId="idNewState"
                            value={field.value}
                            label="Nuevo Estado"
                            fullWidth
                            error={Boolean(errors.idNewState)}
                          >
                            {ticketStates &&
                              ticketStates.map((ticketState) => (
                                <MenuItem
                                  key={ticketState.idNuevoEstado}
                                  value={ticketState.idNuevoEstado}
                                >
                                  {ticketState.nombre}
                                </MenuItem>
                              ))}
                          </Select>
                          <FormHelperText error>
                            {errors.idNewState ? errors.idNewState.message : ""}
                          </FormHelperText>
                        </>
                      )}
                    />
                  </FormControl>
                </Stack>

                <Controller
                  name="comment"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="comment"
                      label="Comentario"
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={3}
                      sx={{ paddingBottom: "1.5rem" }}
                      error={Boolean(errors.comment)}
                      helperText={errors.comment ? errors.comment.message : ""}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{ alignSelf: "start", marginRight: "8px" }}
                            >
                              <CommentIcon color="primary" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                {/*Sección de imágenes adjuntas y botones de acción.*/}
                <ImagesSelector images={images} setImages={setImages}/>
              </Box>
            </form>
          ) : null}

          {/*Valoración Tiquete*/}
          {/*Renderiza únicamente si el estado del tiquete es cerrado.*/}
          {displayValorationSection ? (
            <Box marginBottom={"1.5rem"}>
              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                marginBottom="2rem"
              >
                <Stack alignItems={"center"} direction={"row"}>
                  <StarsIcon
                    fontSize="large"
                    color="primary"
                    style={{ marginRight: "1%" }}
                  />
                  Valoración del Tiquete
                </Stack>
              </Typography>

              {/*Si el tiquete ya ha sido calificado por el cliente muestra los valores registrados, de lo contrario muestra un mensaje informativo.*/}
              {ticket.valoracion ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    paddingBottom: "2rem",
                  }}
                >
                  <Rating
                    name="hover-feedback"
                    value={parseInt(ticket.valoracion ?? 0)} //ticket.valoracion}
                    //getLabelText={labelsTicketRating[ticket.valoracion]}
                    // onChange={(event, newValue) => {
                    //   setValue(newValue);
                    // }}
                    // onChangeActive={(event, newHover) => {
                    //   setHover(newHover);
                    // }}
                    emptyIcon={
                      <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                    }
                    readOnly
                    size="large"
                  />
                  {/* {value !== null && ( */}
                  <Box
                    sx={{
                      ml: 1,
                      fontSize: "1rem",
                      fontWeight: "bold",
                      alignSelf: "center",
                    }}
                  >
                    {labelsTicketRating[ticket.valoracion]}
                  </Box>
                  {/* )} */}
                </Box>

                <TextField
                  id="standard-basic"
                  label="Comentario Valoración"
                  value={ticket.comentarioValoracionServicio ?? ""}
                  fullWidth
                  multiline
                  slotProps={{
                    input: {
                      readOnly: true,
                      style: {
                        fontSize: "0.9rem",
                      },
                      startAdornment: (
                        <InputAdornment position="start">
                          <CommentIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
              ) : (
              <Alert severity="info">
                No existe valoración registrada para el tiquete seleccionado.
              </Alert>
            )}
            </Box>
          ) : null}

          <IconButton
            onClick={() => handleClose()}
            size="large"
            color="primary"
            sx={{
              position: "absolute",
              top: 5,
              right: 10,
              zIndex: 10,
            }}
          >
            <Close fontSize="large" />
          </IconButton>
        </Box>
      </Modal>
    </div>
  );
}

function TicketHistory({ movements }) {

  //Constante para controlar la imagen del historial seleccionada para ampliarla.
  const [selectedImage, setSelectedImage] = useState("");

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          marginBottom="2rem"
        >
          <Stack alignItems={"center"} direction={"row"}>
            <HistoryIcon
              fontSize="large"
              color="primary"
              style={{ marginRight: "1%" }}
            />
            Movimientos del Tiquete
          </Stack>
        </Typography>

        <Box sx={{ position: "relative", pl: 3, mt: 2 }}>
          {/* Contendedor del timeline*/}
          <Box
            sx={{
              position: "absolute",
              left: 12,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: "grey.300",
            }}
          />

          {movements?.map((mov, index) => (
            <Box key={index} sx={{ position: "relative", mb: 4 }}>
              {/* Elemento del timeline */}
              <Box
                sx={{
                  position: "absolute",
                  left: 7,
                  top: 22,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />

              <Card sx={{ ml: 4, boxShadow: 2 }}>
                <CardContent sx={{ pb: 2 }}>
                  {/* Grid principal o contenedor */}
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Grid
                      item
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.primary">
                        {`${mov.usuario?.nombre} ${mov.usuario?.primerApellido} ${mov.usuario?.segundoApellido}`}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <NotificationsIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color="text.primary"
                      >
                        {mov.estado?.nombre}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <CalendarMonth fontSize="small" color="action" />
                      <Typography variant="body2" color="text.primary">
                        {dayjs(mov.fecha).format("DD/MM/YYYY hh:mm:ss a")}
                      </Typography>
                    </Grid>
                  </Grid>

                  <TextField
                    id="standard-basic"
                    value={mov.observacion ?? ""}
                    fullWidth
                    multiline
                    size="small"
                    maxRows={3}
                    sx={{
                      mb: mov.imagenes?.length ? 2 : 0,
                      marginTop: "1rem",
                    }}
                    slotProps={{
                      input: {
                        readOnly: true,
                        style: {
                          fontSize: "0.9rem",
                        },
                        startAdornment: (
                          <InputAdornment position="start">
                            <CommentIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  {/* Recorrido de imágenes mostrandolas como adjuntos en la esquina inferior derecha del contenedor. */}
                  {mov.imagenes?.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      {mov.imagenes.map((img, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            position: "relative",
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover": { opacity: 0.85 },
                          }}
                          onClick={() => setSelectedImage(`${BASE_URL}/${img.imagen}`)}
                        >
                          <img
                            src={`${BASE_URL}/${img.imagen}`}
                            alt={`Evidencia ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(0,0,0,0.3)",
                              opacity: 0,
                              transition: "opacity 0.2s",
                              "&:hover": { opacity: 1 },
                            }}
                          >
                            <ImageIcon
                              fontSize="small"
                              sx={{ color: "#fff" }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      <Modal open={!!selectedImage}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 2,
            //maxWidth: "90%",
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Vista ampliada"
              style={{
                width: "100%",
                maxHeight: "90vh",
                display: "block",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            />
          )}

          <Button
            variant="contained"
            startIcon={<Close />}
            sx={{ display: "flex", justifySelf: "end" }}
            size="small"
            onClick={() => setSelectedImage(null)}
          >
            Cerrar
          </Button>
        </Box>
      </Modal>
    </>
  );
}