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
import {Card, CardContent, Grid, IconButton, Divider, Box, Typography, Modal,Stack } from "@mui/material";
import { Person, CalendarMonth, Image as ImageIcon, Close } from "@mui/icons-material";
import HistoryIcon from '@mui/icons-material/History';
import TicketService from "../../services/TicketService";
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function TicketDetail() 
{
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

    //Constante temporal para pruebas
    // const ticket = {
    //     idTiquete: 1,
    //     titulo: "Error al Iniciar Sesión mediante Teams",
    //     descripcion: "Llevo horas intentando iniciar sesión y no lo consigo, por favor ayudenme.",
    //     fechaCreacion: dayjs("2025-10-25"),
    //     usuarioSolicita: {
    //         nombre: 'Oscar',
    //         primerApellido: 'Peréz',
    //         segundoApellido: 'Gómez'
    //     },
    //     estado: {
    //         idEstadoTiquete: 2,
    //         nombre: 'Asignado'
    //     },
    //     prioridad: {
    //         idPrioridadTiquete: 1,
    //         nombre: 'Media'
    //     },
    //     tecnicoAsignado: {
    //         nombre: 'Richard',
    //         primerApellido: 'Ríos',
    //         segundoApellido: 'Palenque'
    //     },
    //     especialidad: {
    //         idEspecialidad: 1,
    //         nombre: 'Cuentas y Accesos'
    //     },
    //     slaRespuesta: dayjs("2025-10-25T13:15"),
    //     slaResolucion: dayjs("2025-10-26T08:15"),
    // }

    // const movimientos = [
    // {
    //     usuario: "rherrera",
    //     nuevoEstado: "Corregido",
    //     fecha: "31/12/2025",
    //     comentario: "Ticket Resuelto (Ver evidencia)",
    //     imagenes: ["/src/images/accountAdministrator.jpg", "/uploads/evidencia2.jpg"]
    // },
    // {
    //     usuario: "lalvarez",
    //     nuevoEstado: "Resuelto",
    //     fecha: "01/01/2026",
    //     comentario: "Se valida corrección",
    //     imagenes: []
    // }
    // ];

    //Obtiene los parámetros de enrutamiento contenidos en la dirección.
    const routeParams = useParams();

    //Constantes auxiliares para controlar la apertura del modal.
    const [open, setOpen] = React.useState(true);
    const handleClose = () => setOpen(false);

    //Constantes que almacena el detalle del tiquete y sus movimientos.
    const [ticket, setTicket] = useState({});
    const [movements, setMovements] = useState([]);

    useEffect(() => {
        //Obtiene el detalle del tiquete a partir del valor enviado.
        TicketService.getTicketById(routeParams.id)
          .then((response) => {
            //Seteo del tiquete e historial de movimientos en las constantes de renderización.  
            setTicket(response.data);
            setMovements(response.data.historialTiquete)
          })
          .catch((error) => {      
            console.log(error);      
          });
      }, []);

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
                    <Typography id="modal-modal-title" variant="h5" component="h2" 
                    sx={{
                        fontSize: '2rem',
                        textAlign: 'center',
                        //Sombra sútil para resasltar el texto
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                        fontWeight: 'bold'
                    }}>
                        Ticket N.° {ticket.idTiquete} - {ticket.titulo}                                              
                    </Typography>                                                                        

                    <Typography id="modal-modal-title" variant="h6" paddingTop={"15px"} paddingBottom={"5px"}>
                        <Stack alignItems={'center'} direction={'row'}>
                            <DescriptionIcon fontSize="medium" color='primary' style={{marginRight: '1%'}}/>Descripción.
                        </Stack>   
                    </Typography>
                    <Typography variant="subtitle2" component="p" paddingBottom={"20px"}>
                        {ticket.descripcion}
                    </Typography>

                    <Stack direction="row" spacing="10%" paddingBottom="25px">
                        <TextField id="outlined-read-only-input" label="Usuario Reporta" value={`${ticket.usuarioSolicita?.nombre} ${ticket.usuarioSolicita?.primerApellido} ${ticket.usuarioSolicita?.segundoApellido}`}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle color='primary'/>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        /> 

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateField label="Fecha de Creación" value={dayjs(ticket.fechaCreacion)} readOnly={true} format='DD/MM/YYYY' 
                                slotProps={{
                                    textField: {
                                        InputProps: {
                                            startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarIcon color='primary'/>          
                                            </InputAdornment>
                                            ),
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>            
                    </Stack>

                    <Stack direction="row" spacing="10%" paddingBottom="25px">
                        <TextField id="outlined-read-only-input" label="Estado" value={ticket.estadoTiquete?.nombre}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <NotificationsIcon color='primary'/>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        /> 

                        <TextField id="outlined-read-only-input" label="Prioridad" value={ticket.prioridad?.nombre}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PriorityHighIcon color='primary'/>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />             
                    </Stack>

                    <Stack direction="row" spacing="10%" paddingBottom="25px">
                        <TextField id="outlined-read-only-input" label="Técnico Asignado" value={`${ticket.tecnicoAsignado?.nombre} ${ticket.tecnicoAsignado?.primerApellido} ${ticket.tecnicoAsignado?.segundoApellido}`}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SupportAgentIcon color='primary'/>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        /> 

                        <TextField id="outlined-read-only-input" label="Especialidad" value={ticket.especialidad?.nombre}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LabelIcon color='primary'/>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />             
                    </Stack>

                    <Stack direction="row" spacing="10%">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimeField label="SLA Respuesta" value={dayjs(Date.parse(ticket.slaRespuesta))} readOnly={true} format='DD/MM/YYYY hh:mm a' 
                                slotProps={{
                                    textField: {
                                        InputProps: {
                                            startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarIcon color='primary'/>          
                                            </InputAdornment>
                                            ),
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider> 

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimeField label="SLA Resolución" value={dayjs(Date.parse(ticket.slaResolucion))} readOnly={true} format='DD/MM/YYYY hh:mm a' 
                                slotProps={{
                                    textField: {
                                        InputProps: {
                                            startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarIcon color='primary'/>          
                                            </InputAdornment>
                                            ),
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>             
                    </Stack>

                </Box>

                <TicketHistory movements={movements}></TicketHistory>

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

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          <Stack alignItems={"center"} direction={"row"}>
            <HistoryIcon
              fontSize="medium"
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
                      marginTop: "5%",
                    }}
                  >
                    <Typography variant="body2">{mov.comentario}</Typography>
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