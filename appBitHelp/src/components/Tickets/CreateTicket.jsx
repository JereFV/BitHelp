import React, { useState, useEffect } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CalendarIcon from "@mui/icons-material/CalendarMonth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import {
  IconButton,
  Alert,
  Box,
  Typography,
  Modal,
  Stack,
  InputLabel,
  Select,
  FormControl,
  MenuItem,
  FormHelperText,
  Button,
  Chip,
  Divider
} from "@mui/material";
import TicketPriorityService from "../../services/TicketPriorityService";
import { useParams } from "react-router-dom";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { useNavigate } from "react-router-dom";
import { Close } from "@mui/icons-material";
import TitleIcon from "@mui/icons-material/Title";
import CategoryIcon from "@mui/icons-material/Category";
import TicketTagService from "../../services/TicketTagService";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CategorieService from "../../services/CategorieService";
import { Image, Delete } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import FaceIcon from '@mui/icons-material/Face';

export function CreateTicket() {
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
  };

  //Almacenan el listado de opciones a mostrar en los campos de lista desplegable. (Prioridad y Etiqueta)
  const [ticketpriorities, setTicketPriorities] = useState([]);
  const [ticketTags, setTicketTags] = useState([]);

  //Constantes para el manejo de valores seleccionados sobre las listas desplegables.
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  //Almacena la categoría a mostrar según la etiqueta seleccionada.
  const [categorie, setCategorie] = useState("");

  //Funciones de control de eventos OnChange sobre las listas desplegables.
  const handlePriorityChange = (event) => {
    setSelectedPriority(event.target.value);
  };

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);

    //Al cambiar la etiqueta seleccionada, obtiene la categoría relacionada.
    CategorieService.getCategoryByTag(event.target.value)
      .then((response) => {
        //Almacena la categoría obtenida en la constante auxiliar de renderización.
        setCategorie(response.data.nombre);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const [form, setForm] = useState({
  //   descripcion: "",
  //   imagenes: [],
  // });

  // const handleImagenes = (imagenesSeleccionadas) => {
  //   setForm({ ...form, imagenes: imagenesSeleccionadas });
  // };

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

    //Consulta el catálogo interno de etiquetas de tiquetes.
    TicketTagService.getTicketTags()
      .then((response) => {
        //Almacena las etiquetas obtenidas en la constante auxiliar de renderización.
        setTicketTags(response.data);
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
                marginBottom: "1.5rem",
              }}
            >
              <Stack
                alignItems={"center"}
                direction={"row"}
                justifyContent={"center"}
              >
                <ConfirmationNumberIcon
                  fontSize="large"
                  color="primary"
                  style={{ marginRight: "1%" }}
                />
                Nuevo Tiquete
              </Stack>
            </Typography>

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              marginBottom="2rem"
            >
              <Stack alignItems={"center"} direction={"row"}>
                <DescriptionIcon
                  fontSize="large"
                  color="primary"
                  style={{ marginRight: "1%" }}
                />
                Información General
              </Stack>
            </Typography>    

            <Stack direction="row" spacing="10%" paddingBottom="1.5rem">
              <TextField
                id="standard-basic"
                label="Título"
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

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimeField
                  label="Fecha de Creación"
                  value={dayjs(new Date())}
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

            {/*Stack padre con dos stack hijos, cada uno con distribuciones diferentes en pantalla.*/}
            <Stack direction="row" spacing={"10%"} paddingBottom="1.5rem">
              <Stack width={"50%"} alignSelf={"center"}>
                <TextField
                  id="standard-basic"
                  label="Descripción"
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
                <TextField
                  id="outlined-read-only-input"
                  label="Estado Inicial"
                  fullWidth
                  value={"Pendiente"}
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

                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={selectedPriority}
                    label="Prioridad"
                    onChange={handlePriorityChange}
                    fullWidth
                  >
                    {ticketpriorities &&
                      ticketpriorities.map((priority) => (
                        <MenuItem
                          key={priority.idPrioridadTiquete}
                          value={priority.nombre}
                        >
                          {priority.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              marginBottom="2rem"
            >
              <Stack alignItems={"center"} direction={"row"}>
                <AccountCircle
                  fontSize="large"
                  color="primary"
                  style={{ marginRight: "1%" }}
                />
                Información Usuario Solicitante
              </Stack>
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2, md: 3 }}
              paddingBottom="1.5rem"
            >
              <Chip
                icon={<FaceIcon fontSize="medium" />}
                label={`${userSession?.nombre} ${userSession?.primerApellido} ${userSession?.segundoApellido}`}
                size="medium"
                color="primary"
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              />

              <Chip
                icon={<AlternateEmailIcon fontSize="medium" />}
                label={`${userSession?.correo}`}
                size="medium"
                color="primary"
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
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
                <CategoryIcon
                  fontSize="large"
                  color="primary"
                  style={{ marginRight: "1%" }}
                />
                Categorización del Tiquete
              </Stack>
            </Typography>

            <Stack direction="row" spacing="10%">
              <FormControl fullWidth>
                <InputLabel>Etiqueta</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={selectedTag}
                  label="Etiqueta"
                  onChange={handleTagChange}
                >
                  {ticketTags &&
                    ticketTags.map((tag) => (
                      <MenuItem key={tag.idEtiqueta} value={tag.idEtiqueta}>
                        {tag.nombre}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  Seleccione la etiqueta más adecuada según su problema.
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  id="outlined-read-only-input"
                  label="Categoría"
                  value={categorie}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <FormHelperText>
                  Obtenida a partir de la etiqueta seleccionada.
                </FormHelperText>
              </FormControl>
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />
                  
          <ImagesSelector onChange={""} />

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

export default function ImagesSelector({ onChange }) {
  //Constante auxiliar para el manejo de imágenes adjuntas.
  const [images, setImages] = useState([]);

  //Almacena la imagen seleccionada de los adjuntos para ser ampliada en otra vista.
  const [selectedImage, setSelectedImage] = useState(null);

  //Evento de selección de imagen.
  const handleSeleccion = (e) => {
    //Obtiene los archivos seleccionados y crea la estructura de imágenes nuevas.
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      file,
      //Crea una dirección url temporal de acceso sobre la imagen.
      preview: URL.createObjectURL(file),
    }));

    //Crea una estructura con las imagenes existentes y los nuevos adjuntos para renderización en pantalla.
    const updateImages = [...images, ...newImages];
    setImages(updateImages);
    //onChange && onChange(actualizadas.map((i) => i.file));
  };

  const handleEliminar = (index) => {
    //Filtra el arreglo de imágenes adjuntas, excluyendo el elemento seleccionado para eliminación.
    const actualizadas = images.filter((_, i) => i !== index);

    //Renderizado de imágenes luego de la eliminación del elemento.
    setImages(actualizadas);
    //onChange && onChange(actualizadas.map((i) => i.file));
  };

  //Componente input personalizado de MUI.
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        marginBottom="2rem"
      >
        <Stack alignItems={"center"} direction={"row"}>
          <Image
            fontSize="large"
            color="primary"
            style={{ marginRight: "1%" }}
          />
          Imágenes Adjuntas
        </Stack>
      </Typography>

      {/* Contenedor de imágenes seleccionadas.*/}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2.5,
          marginBottom: "2rem",
        }}
      >
        {images.length > 0 ? (
          images.map((img, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: 1,
                overflow: "hidden",
                boxShadow: 2,
              }}
            >
              <img
                src={img.preview}
                alt={`Adjunto ${index + 1}`}
                onClick={() => setSelectedImage(img.preview)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleEliminar(index)}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  bgcolor: "rgba(0,0,0,0.4)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))
        ) : (
          <Alert
            severity="info"
            sx={{ fontSize: "1rem", fontWeight: "bold", width: "100%" }}
          >
            No existen imágenes adjuntas para el tiquete en creación.
          </Alert>
        )}
      </Box>

      {/* Contenedor de botones de acciones.*/}
      <Box display={"flex"} justifyContent={"end"} gap={1}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Seleccionar Imágenes
          <VisuallyHiddenInput
            type="file"
            onChange={handleSeleccion}
            multiple
            accept="image/*"
          />
        </Button>

        <Button variant="contained" startIcon={<SendIcon />} color="success">
          Crear Tiquete
        </Button>
      </Box>

      {/* Ventana desplegable de vista ampliada de imágenes adjuntas.*/}
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
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Vista ampliada"
              style={{
                width: "100%",
                height: "auto",
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
    </Box>
  );
}
