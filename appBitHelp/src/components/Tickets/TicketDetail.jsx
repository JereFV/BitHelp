import React, {useState, useEffect} from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import { DateField } from '@mui/x-date-pickers/DateField';
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
import LabelIcon from '@mui/icons-material/Label';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import {Card, CardContent, Grid, IconButton, Divider, Box, Typography, Modal,Stack ,useTheme} from "@mui/material";
import { Person, CalendarMonth, Image as ImageIcon, Close } from "@mui/icons-material";
import HistoryIcon from '@mui/icons-material/History';
import TicketService from "../../services/TicketService";
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import StarsIcon from '@mui/icons-material/Stars';
import Alert from '@mui/material/Alert';
import StarIcon from '@mui/icons-material/Star';
import Rating from '@mui/material/Rating';
import { getSLAStatus, formatTimeRemaining } from '../../Utilities/slaCalculations';
import CommentIcon from '@mui/icons-material/Comment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

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
  const theme = useTheme();
    //Estilos definidos para el contenedor padre.
    const styleParentBox = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "40%",
        maxHeight: "90vh",
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        pr: 1,
    };

    const labelsTicketRating = {      
      1: 'Deficiente',
      2: 'Malo',    
      3: 'Regular',
      4: 'Bueno',     
      5: 'Excelente',
    }

    //Obtiene los parámetros de enrutamiento contenidos en la dirección.
    const routeParams = useParams();

    //Constantes auxiliares para controlar la apertura del modal.
    const [open, setOpen] = React.useState(true);
    const handleClose = () => setOpen(false);

    //Constantes que almacena el detalle del tiquete y sus movimientos.
    const [ticket, setTicket] = useState({});
    const [movements, setMovements] = useState([]);
    const [slaDetails, setSlaDetails] = useState(null);

    useEffect(() => {
      const idTiquete = routeParams.id;
        //Obtiene el detalle del tiquete a partir del valor enviado.
        TicketService.getTicketById(idTiquete)
          .then((response) => {
            //Seteo del tiquete e historial de movimientos en las constantes de renderización.  
            setTicket(response.data);
            setMovements(response.data.historialTiquete)
          })
          .catch((error) => {      
            console.log(error);      
          });
        TicketService.getSlaDetailsById(idTiquete) 
          .then((response) => {
            setSlaDetails(response.data); // Almacena los límites y fechas reales del backend
          })
          .catch((error) => {
            console.error("Error al obtener detalles de SLA:", error);
            // Opcional: setSlaDetails({}) o un valor para evitar errores de null checking
          });
      }, [routeParams.id]);
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

    return (
      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          style={{}}
        >
          <Box sx={styleParentBox}>
            <Box sx={{ mb: 3, flexShrink: 0 }}>
              <Typography
                id="modal-modal-title"
                variant="h5"
                component="h2"
                sx={{
                  fontSize: "2rem",
                  textAlign: "center",
                  //Sombra sútil para resasltar el texto
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                  fontWeight: "bold",
                  marginBottom: "1.5rem"
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
                    style={{ marginRight: "1%"}}
                  />
                  Información General
                </Stack>
              </Typography>
             
              <TextField id="standard-basic" label="Descripción" value={ticket.descripcion}
                fullWidth
                multiline
                slotProps={{
                  input: {
                    readOnly: true,
                    style: {
                      fontSize: "0.9rem",
                      marginBottom: "1.5rem"
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Stack direction="row" spacing="10%" paddingBottom="1.5rem">
                <TextField
                  id="outlined-read-only-input"
                  label="Usuario Reporta"
                  value={`${ticket.usuarioSolicita?.nombre} ${ticket.usuarioSolicita?.primerApellido} ${ticket.usuarioSolicita?.segundoApellido}`}
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
                    value={dayjs(ticket.fechaCreacion)}
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
                <TextField
                  id="outlined-read-only-input"
                  label="Estado"
                  value={ticket.estadoTiquete?.nombre}
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

                <TextField
                  id="outlined-read-only-input"
                  label="Prioridad"
                  value={ticket.prioridad?.nombre}
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
              </Stack>

              <Stack direction="row" spacing="10%" paddingBottom="1.5rem">
                <TextField
                  id="outlined-read-only-input"
                  label="Técnico Asignado"
                  value={`${ticket.tecnicoAsignado?.nombre} ${ticket.tecnicoAsignado?.primerApellido} ${ticket.tecnicoAsignado?.segundoApellido}`}
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
                  label="Especialidad"
                  value={ticket.especialidad?.nombre}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LabelIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 3 }} />
              
              {/* <Typography
                variant="subtitle1"
                component="p"
                paddingBottom={"20px"}
              >
                <AccessAlarmIcon
                  color="primary"
                  sx={{ verticalAlign: "top" }}
                />{" "}
                Métricas de SLA y cumplimiento
              </Typography> */}
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
                    style={{ marginRight: "1%"}}
                  />
                  Métricas de SLA y Cumplimiento
                </Stack>
              </Typography>

              {slaDetails ? (
                <Grid
                  container
                  spacing={3}
                  paddingBottom="25px"
                  sx={{ width: "100%" }}
                >
                  {/* SLA RESPUESTA (Límite + Cumplimiento)  */}
                  <Grid item xs={12}>
                    {/* Grid anidado para colocar el DateTimeField y el Alert lado a lado */}
                    <Grid container spacing={9} alignItems="center">
                      {/* Lado Izquierdo: DateTimeField para el Límite de Respuesta */}
                      <Grid item xs={12} sm={6} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateTimeField
                            label="SLA Respuesta Límite"
                            value={dayjs(slaDetails.SLARespuestaLimite)}
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
                      </Grid>

                      {/* Lado Derecho: Alert para el Estado de Respuesta */}
                      <Grid item xs={12} sm={6} md={8}>
                        {/* Obtener colores basados en el estado (usando slaRespuestaDisplay.color) */}
                        {/* Asumo que slaRespuestaDisplay.color devuelve 'success', 'error', etc. */}
                        {(() => {
                          const { backgroundColor, iconColor, textColor } =
                            getColorMap(theme, slaRespuestaDisplay.color);
                          return (
                            <Box
                              sx={{
                                width: "100%", // 🚨 EL 100% AHORA FUNCIONARÁ
                                backgroundColor: backgroundColor,
                                borderRadius: 1, // Bordes redondeados como el Alert
                                p: 2, // Padding interno
                                display: "flex",
                                alignItems: "center",
                                gap: 2, // Espacio entre ícono y texto
                              }}
                            >
                              {/* Ícono de Alarma */}
                              <AccessAlarmIcon
                                sx={{ color: iconColor }}
                                fontSize="large"
                              />

                              {/* Stack con el Contenido */}
                              <Stack sx={{ color: textColor }}>
                                <Typography variant="body2" fontWeight="bold">
                                  Estado: {slaRespuestaDisplay.estado}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {slaRespuestaDisplay.tiempoRestante}
                                </Typography>
                                {slaDetails.FechaRespuestaReal && (
                                  <Typography variant="caption" display="block">
                                    Respondido:{" "}
                                    {dayjs(
                                      slaDetails.FechaRespuestaReal
                                    ).format("hh:mm:ss a")}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          );
                        })()}
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* --- DIVISOR VISUAL --- */}
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* === 2. SLA RESOLUCIÓN (Límite + Cumplimiento) === */}
                  <Grid item xs={12}>
                    {/* Grid anidado para colocar el DateTimeField y el Alert lado a lado */}
                    <Grid container spacing={9} alignItems="center">
                      {/* Lado Izquierdo: DateTimeField para el Límite de Resolución */}
                      <Grid item xs={12} sm={6} md={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateTimeField
                            label="SLA Resolución Límite"
                            value={dayjs(slaDetails.SLAResolucionLimite)}
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
                      </Grid>

                      {/* Lado Derecho: Alert para el Estado de Resolución */}
                      <Grid item xs={12} sm={6} md={8}>
                        {(() => {
                          const { backgroundColor, iconColor, textColor } =
                            getColorMap(theme, slaResolucionDisplay.color);
                          return (
                            <Box
                              sx={{
                                width: "108%", // 🚨 EL 100% AHORA FUNCIONARÁ
                                backgroundColor: backgroundColor,
                                borderRadius: 1,
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <AccessAlarmIcon
                                sx={{ color: iconColor }}
                                fontSize="large"
                              />

                              <Stack sx={{ color: textColor }}>
                                <Typography variant="body2" fontWeight="bold">
                                  Estado: {slaResolucionDisplay.estado}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {slaResolucionDisplay.tiempoRestante}
                                </Typography>
                                {slaDetails.FechaResolucionReal && (
                                  <Typography variant="caption" display="block">
                                    Resuelto:{" "}
                                    {dayjs(
                                      slaDetails.FechaResolucionReal
                                    ).format("hh:mm:ss a")}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          );
                        })()}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Cargando métricas de SLA...</Alert>
              )}
            </Box>

            <TicketHistory movements={movements}></TicketHistory>

            <Divider sx={{ mb: 3 }} />

            <Box>
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
                      value={ticket.valoracion} //ticket.valoracion}
                      //getLabelText={labelsTicketRating[ticket.valoracion]}
                      // onChange={(event, newValue) => {
                      //   setValue(newValue);
                      // }}
                      // onChangeActive={(event, newHover) => {
                      //   setHover(newHover);
                      // }}
                      emptyIcon={
                        <StarIcon
                          style={{ opacity: 0.55 }}
                          fontSize="inherit"
                        />
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

                  <TextField id="standard-basic" label="Comentario Valoración" value={ticket.comentarioValoracionServicio}
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
                  No existe valoración registrada para el tiquete seleccionado hasta que haya sido cerrado.
                </Alert>
              )}
            </Box>

            <IconButton
              onClick={() => handleClose()}
              to={`/tickets/ticketsList`}
              component={Link}
              sx={{
                position: "absolute",
                top: 1,
                right: 1,
                color: "black",
                zIndex: 10,
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Modal>
      </div>
    );
}

function TicketHistory({ movements }) {

  //Constante para controlar la imagen del historial seleccionada para ampliarla.
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" fontWeight="bold" gutterBottom marginBottom="2rem">
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

          {movements.map((mov, index) => (
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
                      <Typography variant="body2" color="text.secondary">
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
                      <Typography variant="body2" color="text.secondary">
                        {mov.fecha}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Comentario */}
                  <Box
                    sx={{
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      p: 1.5,
                      mb: mov.imagenes?.length ? 2 : 0,
                      marginTop: "1.5rem",
                    }}
                  >
                    <Typography variant="body2">{mov.observacion}</Typography>
                  </Box>

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
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover": { opacity: 0.85 },
                          }}
                          onClick={() => setSelectedImage(img.imagen)}
                        >
                          <img
                            src={img.imagen}
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
            maxWidth: "90%",
            maxHeight: "90vh",
          }}
        >
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "black",
              zIndex: 10,
            }}
          >
            <Close />
          </IconButton>

          {selectedImage && (
            <img
              src={selectedImage}
              alt="Vista ampliada"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "4px",
              }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
}