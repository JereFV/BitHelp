import React, {useState, useEffect} from 'react';
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
import LabelIcon from '@mui/icons-material/Label';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import {IconButton, Divider, Box, Typography, Modal, Stack, InputLabel, Select, FormControl, MenuItem} from "@mui/material";
import TicketPriorityService from "../../services/TicketPriorityService";
import { useParams } from 'react-router-dom';
import StarsIcon from '@mui/icons-material/Stars';
import Alert from '@mui/material/Alert';
import StarIcon from '@mui/icons-material/Star';
import Rating from '@mui/material/Rating';
import CommentIcon from '@mui/icons-material/Comment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useNavigate } from 'react-router-dom';
import { Close } from '@mui/icons-material';
import TitleIcon from '@mui/icons-material/Title';

export function CreateTicket() 
{
  //Obtiene el usuario en sesión a partir del valor almacenado en localStorage.
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

    //Constante auxiliar para controlar la apertura del modal.
    const [open, setOpen] = React.useState(true);

    //Constante para el manejo de navegación y ruteo.
    const navigate = useNavigate();

    //Función de cerrado del modal.
    const handleClose = () => {
       setOpen(false);
       //Redirrecionamiento a la pestaña de navegación anterior.
       navigate(-1);
    }

    //Almacena el listado de opciones a mostrar en el campo de Prioridad.
    const [ticketpriorities, setTicketPriorities] = useState([]);

    //Constante para el manejo de la prioridad seleccionada, junto con su evento de control.
    const [selectedPriority, setSelectedPriority] = useState("");

    const handlePriorityChange = (event) => {
        setSelectedPriority(event.target.value);
    };

    useEffect(() => {
        //Consulta el catálogo interno de prioridades de tiquetes.
        TicketPriorityService.getTicketPriorities()
        .then((response) => {
            //Almacena las prioridades obtenidas en la constante auxiliar de renderización.  
            setTicketPriorities(response.data);          
          })
          .catch((error) => {      
            console.log(error);      
        });  
    }, [routeParams.id]);
    
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
                  //Sombra sútil para resasltar el texto
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                  fontWeight: "bold",
                  marginBottom: "2.5rem"
                }}
              >
                <Stack alignItems={"center"} direction={"row"} justifyContent={"center"}>
                  <ConfirmationNumberIcon
                    fontSize="large"
                    color="primary"
                    style={{ marginRight: "1%"}}
                  />
                  Nuevo Tiquete
                </Stack>
              </Typography>
             
              <Stack direction="row" spacing="10%" paddingBottom="1.5rem">
                <TextField id="standard-basic" label="Título"
                    fullWidth                
                    slotProps={{
                    input: {                       
                        startAdornment: (
                        <InputAdornment position="start">
                            <TitleIcon color="primary" />
                        </InputAdornment>
                        ),
                    },
                    }}
                />

                <TextField
                  id="outlined-read-only-input"
                  label="Usuario Solicitante"
                  value={`${userSession?.nombre} ${userSession?.primerApellido} ${userSession?.segundoApellido}`}
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
              </Stack>
           
              {/*Stack padre con dos stack hijos, cada uno con distribuciones diferentes en pantalla.*/}
              {/* <Stack direction="row" spacing={"10%"} paddingBottom="1.5rem" alignItems={"center"}>
                <Stack width={"50%"}>
                    <TextField id="standard-basic" label="Descripción"
                        fullWidth
                        multiline
                        maxRows={2}
                        minRows={2}                             
                        slotProps={{
                            input: {
                                style: {
                                //fontSize: "0.9rem",                    
                                //marginBottom: "1.5rem",                     
                                },
                                startAdornment: (
                                <InputAdornment position="start">
                                    <DescriptionIcon color="primary" />
                                </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>              
                
                <Stack width={"50%"}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimeField
                            label="Fecha de Creación"
                            value={dayjs(ticket.fechaCreacion)}
                            readOnly={true}
                            format="DD/MM/YYYY"
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
              </Stack>     */}

              {/*Stack padre con dos stack hijos, cada uno con distribuciones diferentes en pantalla.*/}
              <Stack direction="row" spacing={"10%"} paddingBottom="1.5rem">
                <Stack width={"50%"} alignSelf={"center"}>
                    <TextField id="standard-basic" label="Descripción"
                        fullWidth
                        multiline
                        maxRows={4}
                        minRows={4}                             
                        // slotProps={{
                        //     input: {
                        //         style: {
                        //         //fontSize: "0.9rem",                                                                       
                        //         },
                        //         startAdornment: (
                        //         <InputAdornment position="start">
                        //             <DescriptionIcon color="primary" />
                        //         </InputAdornment>
                        //         ),
                        //     },
                        // }}
                    />
                </Stack>              
                
                <Stack direction="column" spacing={"1rem"} width={"50%"}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimeField
                            label="Fecha de Creación"
                            value={dayjs(new Date())}
                            readOnly={true}
                            format="DD/MM/YYYY"
                            fullWidth
                            size='small'
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

                    <TextField
                        id="outlined-read-only-input"
                        label="Estado Inicial"
                        fullWidth
                        value={"Pendiente"}
                        size='small'
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

                    <FormControl size="small">
                        <InputLabel >Prioridad</InputLabel>
                        <Select
                            labelId="demo-simple-select-helper-label"
                            id="demo-simple-select-helper"
                            value={selectedPriority}
                            label="Prioridad"                                                    
                            onChange={handlePriorityChange}                           
                        >
                       {ticketpriorities && ticketpriorities.map((priority) => (
                                <MenuItem key={priority.idPrioridadTiquete} value={priority.nombre}>
                                    {priority.nombre}
                                </MenuItem>
                            ))
                        }
                        </Select>
                    </FormControl>
                    
                </Stack>               
              </Stack>                       
            </Box>           

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
            </Box>

            <IconButton
              onClick={() => handleClose()}
              //to={`/tickets/ticketsList`}
              //component={Link}
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