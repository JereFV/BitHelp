import { useState, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import HotelClassIcon from '@mui/icons-material/HotelClass';
import {IconButton, Box, Typography, Modal, Button, Rating, TextField, InputAdornment, FormControl, FormHelperText, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions} from "@mui/material";
import {Close} from "@mui/icons-material";
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import PropTypes from "prop-types";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from "react-hook-form";
import TicketService from "../../services/TicketService";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

TicketRating.propTypes = {
  labels: PropTypes.object,
  ticket: PropTypes.object,
  setTicket: PropTypes.any,
  modalRef: PropTypes.element
}

export default function TicketRating ({labels, ticket, setTicket, modalRef}) {
  //Gestiona la traducción del contenido según el idioma seleccionado.  
  const { t} = useTranslation();

  //Constante para el manejo del valor de hover mostrado al cambiar entre opciones.
  const [hover, setHover] = useState(-1);

  //Controla la apertura del modal.
  const [open, setOpen] = useState(true);

  //Controla la apertura del componente Dialog generado al salirse del formulario sin enviar la califación.
  const [openDialog, setOpenDialog] = useState(false);

  //Esquema de validación de los campos de entrada del formulario.
const formSchema = yup.object({
    valoration: yup
      .number()
      .required(t("ticketRating.valorationValidMessage"))
      .min(1, t("ticketRating.valorationValidMessage")),
    valorationComment: yup
      .string()
      .required(t("ticketRating.commentRequiredMessage"))
      .max(100, t("ticketRating.commentMaxMessage")),
});

  //Configuración del formulario y sus valores por defecto.
  const {
    control,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      idTicket: "",
      valoration: 0,
      valorationComment: ""
    },
    resolver: yupResolver(formSchema),
  });

  //Evento de control de apertura/cerrado del diálogo de confirmación.
  const handleOpenDialog = (state) => {
    setOpenDialog(state);
  };

  //Evento de control de apertura/cerrado del modal de calificación.
  const handleOpenModal = (state) => {
    setOpen(state);
  };

  //Evento submit del formulario.
  const onSubmit = (DataForm) => {
    try {
      if (formSchema.isValid()) {
        TicketService.saveRating(DataForm)
          .then((response) => {
            //Al guardar la calificación correctamente procede a actualizar la información del tiquete a partir del useState recibido como parámetro.
            setTicket(response.data);

            //Cierra el modal.
            handleOpenModal(false);

            //Reposiciona la vista al inicio del modal, dando un efecto de "refrescamiento".
            modalRef.current.scrollTop  = 0;

            toast.success(
              t("ticketRating.submitSucessMessage"),
              { duration: 4000 }
            );
          })
          .catch((error) => {
            toast.error(t("ticketRating.submitErrorMessage"));
            console.error(error);
          });
      }
    } 
    catch (error) {
      toast.error(t("ticketRating.submitErrorMessage"));
      console.error(error);
    }
  };

  //Evento error del formulario.
  const onError = (errors, e) => {
    toast.error(t("ticketRating.submitErrorMessage"));
    console.log(errors, e);
  };

  //Obtiene el id del tiquete a partir de la estructura recibida como parámetro luego de la renderización de componentes.
  useEffect(() => {
      setValue("idTicket", ticket?.idTiquete);    
  }, []);

  return (
    <Modal open={open}>
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
          paddingTop: 4,
          width: {
            xs: "100%",
            sm: "40%",
          },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "0.5rem",
            }}
          >
            <HotelClassIcon
              fontSize="large"
              color="primary"
              style={{ marginRight: "1%" }}
            />
            <Typography
              id="modal-modal-title"
              variant="h5"
              component="h2"
              sx={{
                fontSize: { lg: "2rem" },
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              {t("ticketRating.title")}
            </Typography>
          </Box>

          <input type="hidden" {...register("idTicket")} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "2rem",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormControl error={Boolean(errors.valoration)}>
              <Controller
                name="valoration"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Rating
                      {...field}
                      emptyIcon={
                        <StarIcon
                          style={{ opacity: 0.55 }}
                          fontSize="inherit"
                        />
                      }
                      size="large"
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                        //Si no hay un valor seleccionado setea un hover de 0 para generar un label vacío.
                        if (!newValue) setHover(0);
                      }}
                      onChangeActive={(event, newHover) => {
                        setHover(newHover);
                      }}
                    />

                    {/*Etiqueta según la cantidad de estrellas seleccionadas*/}
                    <Box
                      sx={{
                        fontSize: "1rem",
                        fontWeight: "bold",
                        alignSelf: "center",
                      }}
                    >
                      {/* Muestra la descripción basada en el hover o el valor actual.*/}
                      {labels[hover !== -1 ? hover : field.value]}
                    </Box>
                  </Box>
                )}
              />
            </FormControl>

            {errors.valoration && (
              <FormHelperText
                sx={{
                  color: "#f44336",
                }}
              >
                {errors.valoration.message}
              </FormHelperText>
            )}
          </Box>

          <FormControl fullWidth>
            <Controller
              name="valorationComment"
              control={control}
              render={({ field }) => (
                <>
                  <TextField
                    {...field}
                    label={t("ticketRating.commentFieldLabel")}
                    multiline
                    minRows={3}
                    maxRows={3}
                    error={Boolean(errors.valorationComment)}
                    helperText={
                      errors.valorationComment
                        ? errors.valorationComment.message
                        : ""
                    }
                    sx={{ paddingBottom: "2rem" }}
                    slotProps={{
                      input: {
                        style: {
                          fontSize: "0.9rem",
                        },
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
                </>
              )}
            />
          </FormControl>

          <Box display={"flex"} justifyContent={"end"}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              color="success"
            >
              {t("ticketRating.submitButtonLabel")}
            </Button>
          </Box>

          <IconButton
            onClick={() => handleOpenDialog(true)}
            size="large"
            color="primary"
            sx={{
              position: "absolute",
              top: -8,
              right: -5,
              zIndex: 10,
            }}
          >
            <Close fontSize="large" />
          </IconButton>
        </form>

        <Dialog
          open={openDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {t("ticketRating.dialogtitle")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              whiteSpace={"pre-wrap"}
            >
              {t("ticketRating.dialogContent")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleOpenDialog(false)} color="error" variant="contained">
              {t("ticketRating.dialogCancelButton")}
            </Button>
            <Button onClick={() => handleOpenModal(false)} color="success" variant="contained">
              {t("ticketRating.dialogAcceptButton")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
}