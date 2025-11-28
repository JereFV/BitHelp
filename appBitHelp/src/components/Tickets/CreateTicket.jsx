import React, { useState, useEffect, useContext} from "react";
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
  Box,
  Typography,
  Modal,
  Stack,
  InputLabel,
  Select,
  FormControl,
  MenuItem,
  FormHelperText,
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
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import FaceIcon from '@mui/icons-material/Face';
import * as yup from 'yup';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import TicketService from "../../services/TicketService";
import toast from 'react-hot-toast';
import TicketImageService from "../../services/TicketImageService"; 
import ImagesSelector from "./ImagesSelector";
import { NotificationContext } from '../../context/NotificationContext';

export function CreateTicket() {
  const { refreshCount } = useContext(NotificationContext);
  //Variable que contiene los campos del formulario en un formato de llave -> valor.
  let formData = new FormData();

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
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    pr: 1,
  };

  // Esquema de validación de los campos de entrada del formulario.
  const ticketSchema = yup.object({
    title: yup
          .string()
          .required("El título es requerido.")
          .max(45, "El título debe tener un máximo de 45 caractereres."),
    description: yup
          .string()
          .required("La descripción es requerida.")
          .min(30, "La descripción debe tener un mínimo de 30 caracteres.")
          .max(300, "La descripción debe tener un máximo de 300 caracteres."),
    idPriority: yup
          .number()
          .typeError("La prioridad del caso es requerida."),
    idTag: yup
          .number()        
          .typeError("La etiqueta es requerida para la categorización del caso."),         
    categorie: yup
          .string()
          .required("La categoría es requerida, por favor seleccione alguna etiqueta."),
  });

  //Incializacióm del formulario junto con el valor predefinido de los campos.
  const {
    control,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { 
      title: "",
      description: "",
      idPriority: "",
      idTag: "",
      idRequestUser: "",
      idCategorie: "",
      categorie: ""
    },
    // Asignación de validaciones haciendo uso del esquema de tiquetes yup.
    resolver: yupResolver(ticketSchema),
  });

  //Obtiene los parámetros de enrutamiento contenidos en la dirección.
  const routeParams = useParams();

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

  //Constante auxiliar para controlar la apertura del modal.
  const [open, setOpen] = React.useState(true);

  //Almacena las imágenes adjuntas.
  const [images, setImages] = useState(null);

  //Evento OnCahnge personalizado para el select de etiquetas.
  const handleTagChange = (event, fieldOnChange) => {
    //Ejecuta el evento OnChange precargado por el hook UseController.
    fieldOnChange(event);

    //Al cambiar la etiqueta seleccionada, obtiene la categoría relacionada.
    CategorieService.getCategoryByTag(event.target.value)
      .then((response) => {
        //Almacena los datos de la categoria en los campos del formulario respectivos.
        setValue("idCategorie", response.data.idCategoria);
        setValue("categorie", response.data.nombre, {shouldValidate: true});

        toast.success("Categoría obtenida automáticamente a partir de la etiqueta seleccionada.", {duration: 3500});
      })
      .catch((error) => {
        console.log(error);
        toast.error("Ha ocurrido un error al intentar obtener la categoría asociada a la etiqueta seleccionada. Por favor seleccione otra o contacte al administrador del sistema.", {duration: 3500});
      });
  }; 

  //Evento submit del formulario
  const onSubmit = (DataForm) => {
    try 
    {
      //Valida que los campos del formulario cumplan con las especificaciones requeridas.
      if (ticketSchema.isValid()) 
      {
        //Creación del tiquete
        TicketService.createTicket(DataForm)
          .then((response) => {
            //Valida que exista algún valor en la respuesta.
            if (response.data != null) {
              //Arma la estructura de entrada para el almacenamiento de imágenes.
              formData.append("file", images);
              formData.append("idTicket", response.data);

              //Almacenamiento de imágenes, una vez creado el tiquete.
              TicketImageService.uploadImages(formData)
                .then(() => {
                  toast.success(
                    `Se ha creado correctamente el tiquete #${response.data} - ${DataForm.title}`,
                    {
                      duration: 4000,
                      position: "top-center",
                    }
                  );
                  refreshCount(); // Actualiza el contador de notificaciones

                  //Al haber agregado el registro exitosamente, redirreciona hacia el listado.
                  return navigate("/tickets/ticketsList");
                })
                .catch((error) => {
                  toast.error(
                    "Ha ocurrido un error al intentar crear el tiquete."
                  );
                  console.error(error);
                });
            }
          })
          .catch((error) => {
            toast.error("Ha ocurrido un error al intentar crear el tiquete.");
            console.error(error);
          });
      }
    } 
    catch (error) {
      toast.error("Ha ocurrido un error al intentar crear el tiquete.");
      console.error(error);
    }
  };

  //Evento error del formulario.
  const onError = (errors, e) => {
    toast.error("Ha ocurrido un error al intentar crear el tiquete.");
    console.log(errors, e);
  }    

  // const [form, setForm] = useState({
  //   descripcion: "",
  //   imagenes: [],
  // });

  //Evento auxiliar para la obtención de imágenes. 
  const handleImages = (images) => {
    // setImages(images.map((i) => (i.file, i.file.name)));
    setImages(images[0], images[0].name)
  };

  useEffect(() => {
    //Consulta el catálogo interno de prioridades de tiquetes.
    TicketPriorityService.getTicketPriorities()
      .then((response) => {
        //Almacena las prioridades obtenidas en la constante auxiliar de renderización.
        setTicketPriorities(response.data);
      })
      .catch((error) => {
        toast.error("Ha ocurrido un error al obtener el catálogo de prioridades. Por favor contacte al administrador del sistema.", {duration: 3500});
        console.log(error);
      });

    //Consulta el catálogo interno de etiquetas de tiquetes.
    TicketTagService.getTicketTags()
      .then((response) => {
        //Almacena las etiquetas obtenidas en la constante auxiliar de renderización.
        setTicketTags(response.data);
      })
      .catch((error) => {
        toast.error("Ha ocurrido un error al obtener el catálogo de etiquetas. Por favor contacte al administrador del sistema.", {duration: 3500});
        console.log(error);
      });

    try 
    {
      //Asigna el id del usuario al campo del formulario respectivo.
      setValue("idRequestUser", userSession.idUsuario);
    } 
    catch (error) {
      toast.error("Ha ocurrido un error al intentar obtener los datos del usuario en sesión. Por favor contacte al administrador del sistema.", { duration: 3500 });
      console.error(error);
    }
  }, [routeParams.id]);

  return (
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
      <Box sx={styleParentBox}>
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
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
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="title"
                    label="Título"
                    fullWidth
                    error={Boolean(errors.title)}
                    helperText={errors.title ? errors.title.message : ""}
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
                )}
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
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="description"
                      label="Descripción"
                      fullWidth
                      multiline
                      maxRows={4}
                      minRows={4}
                      error={Boolean(errors.description)}
                      helperText={
                        errors.description ? errors.description.message : ""
                      }
                    />
                  )}
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
                  <Controller
                    name="idPriority"
                    control={control}
                    render={({ field }) => (
                      <>
                        <InputLabel id="id">Prioridad</InputLabel>
                        <Select
                          {...field}
                          labelId="idPriority"
                          value={field.value}
                          label="Prioridad"
                          //onChange={handlePriorityChange}
                          fullWidth
                          error={Boolean(errors.idPriority)}
                        >
                          {ticketpriorities &&
                            ticketpriorities.map((priority) => (
                              <MenuItem
                                key={priority.idPrioridadTiquete}
                                value={priority.idPrioridadTiquete}
                              >
                                {priority.nombre}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText error>
                          {errors.idPriority ? errors.idPriority.message : ""}
                        </FormHelperText>
                      </>
                    )}
                  />
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
              {/*Código de usuario almacenado en un campo hidden.*/}
              <input type="hidden" {...register("idRequestUser")} />

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
                <Controller
                  name="idTag"
                  control={control}
                  render={({ field }) => (
                    <>
                      <InputLabel id="id">Etiqueta</InputLabel>
                      <Select
                        {...field}
                        labelId="idTag"
                        value={field.value}
                        label="Etiqueta"
                        onChange={(event) =>
                          handleTagChange(event, field.onChange)
                        }
                        fullWidth
                        error={Boolean(errors.idTag)}
                      >
                        {ticketTags &&
                          ticketTags.map((tag) => (
                            <MenuItem
                              key={tag.idEtiqueta}
                              value={tag.idEtiqueta}
                            >
                              {tag.nombre}
                            </MenuItem>
                          ))}
                      </Select>
                      <FormHelperText error={errors.idTag}>
                        {errors.idTag
                          ? errors.idTag.message
                          : "Seleccione la etiqueta más adecuada según su problema."}
                      </FormHelperText>
                    </>
                  )}
                />
              </FormControl>

              {/*Código de categoría almacenado en un campo hidden.*/}
              <input type="hidden" {...register("idCategorie")} />

              <FormControl fullWidth>
                <Controller
                  name="categorie"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="categorie"
                      label="Categoría"
                      fullWidth
                      error={Boolean(errors.categorie)}
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
                  )}
                />
                <FormHelperText error={errors.categorie}>
                  {errors.categorie
                    ? errors.categorie.message
                    : "Obtenida a partir de la etiqueta seleccionada."}
                </FormHelperText>
              </FormControl>
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <ImagesSelector newTicket={true} onChange={handleImages} />
        </form>

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
  );
}

