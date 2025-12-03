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
import { useTranslation } from 'react-i18next';

export function CreateTicket() {
  const { t, i18n } = useTranslation();
  const { refreshCount } = useContext(NotificationContext);
  let formData = new FormData();

  const userSession = JSON.parse(localStorage.getItem("userSession"));

  const styleParentBox = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: {
      xs: "90%",
      sm: "80%",
      md: "70%",
      lg: "60%",
      xl: "50%",
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
          .required(t('validation.titleRequired'))
          .max(45, t('validation.titleMaxLength')),
    description: yup
          .string()
          .required(t('validation.descriptionRequired'))
          .min(30, t('validation.descriptionMinLength'))
          .max(300, t('validation.descriptionMaxLength')),
    idPriority: yup
          .number()
          .typeError(t('validation.priorityRequired')),
    idTag: yup
          .number()        
          .typeError(t('validation.tagRequired')),         
    categorie: yup
          .string()
          .required(t('validation.categoryRequired')),
  });

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
  const [images, setImages] = useState([]);

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
        toast.success(t('messages.categoryObtainedSuccess'), {duration: 3500});
      })
      .catch((error) => {
        console.log(error);
        toast.error(t('messages.errorGettingCategory'), {duration: 3500});
      });
  }; 

  const onSubmit = (DataForm) => {
    try {
      //Valida que los campos del formulario cumplan con las especificaciones requeridas.
      if (ticketSchema.isValid()) {
        //Creación del tiquete
        TicketService.createTicket(DataForm)
          .then((response) => {
            //Valida que exista algún valor en la respuesta.
            if (response.data != null) {
              //Arma la estructura de entrada para el almacenamiento de imágenes. 
              formData.append("idTicket", response.data);

              //Recorre cada una de las imágenes adjuntas para añadirlas en el arreglo.
              images.map((image) => (
                formData.append("files[]", image.file)
              ))

              //Almacenamiento de imágenes, una vez creado el tiquete.
              TicketImageService.uploadImages(formData)
                .then(() => {
                  toast.success(
                    `${t('messages.ticketCreatedSuccess')} #${response.data} - ${DataForm.title}`,
                    {
                      duration: 4000,
                      position: "top-center",
                    }
                  );
                  // Actualiza el contador de notificaciones
                  refreshCount();
                  //Al haber agregado el registro exitosamente, redirreciona hacia el listado.
                  return navigate("/tickets/ticketsList");
                })
                .catch((error) => {
                  toast.error(t('messages.errorCreatingTicket'));
                  console.error(error);
                });
            }
          })
          .catch((error) => {
            toast.error(t('messages.errorCreatingTicket'));
            console.error(error);
          });
      }
    } catch (error) {
      toast.error(t('messages.errorCreatingTicket'));
      console.error(error);
    }
  };

  //Evento error del formulario.
  const onError = (errors, e) => {
    toast.error(t('messages.errorCreatingTicket'));
    console.log(errors, e);
  }    

  useEffect(() => {
    //Consulta el catálogo interno de prioridades de tiquetes.
    TicketPriorityService.getTicketPriorities()
      .then((response) => {
        //Almacena las prioridades obtenidas en la constante auxiliar de renderización.
        setTicketPriorities(response.data);
      })
      .catch((error) => {
        toast.error(t('messages.errorGettingPriorities'), {duration: 3500});
        console.log(error);
      });

    //Consulta el catálogo interno de etiquetas de tiquetes.
    TicketTagService.getTicketTags()
      .then((response) => {
        //Almacena las etiquetas obtenidas en la constante auxiliar de renderización.
        setTicketTags(response.data);
      })
      .catch((error) => {
        toast.error(t('messages.errorGettingTags'), {duration: 3500});
        console.log(error);
      });

    try {
      //Asigna el id del usuario al campo del formulario respectivo.
      setValue("idRequestUser", userSession.idUsuario);
    } catch (error) {
      toast.error(t('messages.errorGettingUserSession'), { duration: 3500 });
      console.error(error);
    }
  }, [routeParams.id]);

  const dateFormat = i18n.language === 'es' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';

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
                {t('tickets.newTicket')}
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
                {t('tickets.generalInfo')}
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
                    label={t('tickets.title')}
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
                  label={t('tickets.creationDate')}
                  value={dayjs(new Date())}
                  readOnly={true}
                  format={dateFormat}
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
                      label={t('tickets.description')}
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
                  label={t('tickets.initialState')}
                  fullWidth
                  value={t('tickets.pending')}
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
                        <InputLabel id="id">{t('common.priority')}</InputLabel>
                        <Select
                          {...field}
                          labelId="idPriority"
                          value={field.value}
                          label={t('common.priority')}
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
                {t('tickets.requesterInfo')}
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
                {t('tickets.categorization')}
              </Stack>
            </Typography>

            <Stack direction="row" spacing="10%">
              <FormControl fullWidth>
                <Controller
                  name="idTag"
                  control={control}
                  render={({ field }) => (
                    <>
                      <InputLabel id="id">{t('tickets.tag')}</InputLabel>
                      <Select
                        {...field}
                        labelId="idTag"
                        value={field.value}
                        label={t('tickets.tag')}
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
                          : t('tickets.selectAppropriateTag')}
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
                      label={t('categories.category')}
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
                    : t('tickets.categoryObtainedFromTag')}
                </FormHelperText>
              </FormControl>
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <ImagesSelector newTicket={true} images={images} setImages={setImages} />
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