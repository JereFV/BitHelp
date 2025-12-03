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
import { useTranslation } from 'react-i18next';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ID_ASIGNED_STATE = "2";
const ID_INPROGRESS_STATE = "3";
const ID_RESOLVED_STATE = "4";
const ID_CLOSED_STATE = "5";
const ID_RETURNED_STATE = "6";

const ID_CLIENT_ROLE = "1";
const ID_TECHNICIAN_ROLE = "2";
const ID_ADMINISTRATOR_ROLE = "3";

TicketHistory.propTypes = {
  movements: PropTypes.array
}

const getColorMap = (theme, severity) => {
    switch (severity) {
        case 'success':
            return {
                backgroundColor: '#E6F4EA',
                iconColor: '#388E3C',
                textColor: '#1B5E20',
            };
        case 'error':
            return {
                backgroundColor: '#FDECEA',
                iconColor: '#D32F2F',
                textColor: '#C62828',
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

export function TicketDetail() {
  const { t, i18n } = useTranslation();
  const { refreshCount } = useContext(NotificationContext);

  let formData = new FormData();
  const modalContentRef = useRef(null);
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
    paddingBottom: 0,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    pr: 1,
  };

  const labelsTicketRating = {
    1: t('tickets.poor'),
    2: t('tickets.bad'),
    3: t('tickets.regular'),
    4: t('tickets.good'),
    5: t('tickets.excellent'),
  };

  const newMovementSchema = yup.object({
    idNewState: yup
      .number()
      .typeError(t('validation.newStateRequired')),
    comment: yup
      .string()
      .required(t('validation.commentRequired'))
      .max(300, t('validation.commentMaxLength')),
  });

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
    resolver: yupResolver(newMovementSchema),
  });

  const theme = useTheme();
  const navigate = useNavigate();
  const routeParams = useParams();

  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  const [ticket, setTicket] = useState({});
  const [movements, setMovements] = useState([]);
  const [slaDetails, setSlaDetails] = useState({});
  const [images, setImages] = useState([]);
  const [ticketStates, setTicketStates] = useState([]);
  const [displayNewMovSection, setDisplayNewMovSection] = useState(false);
  const [displayValorationSection, setDisplayValorationSection] = useState(false);
  const [refresh, setRefresh] = useState(0);

  let slaRespuestaDisplay = null;
  let slaResolucionDisplay = null;

  if (slaDetails) {
    slaRespuestaDisplay = getSLAStatus(
      slaDetails.SLARespuestaLimite,
      slaDetails.FechaRespuestaReal,
      slaDetails.cumplimientoSlaRespuesta
    );

    slaResolucionDisplay = getSLAStatus(
      slaDetails.SLAResolucionLimite,
      slaDetails.FechaResolucionReal,
      slaDetails.cumplimientoSlaResolucion
    );
  }

  const validateDisplayNewMovSection = (idTicketState) => {
    let display = false;

    switch (idTicketState) {
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
      case ID_RESOLVED_STATE:
        if (userSession.idRol == ID_CLIENT_ROLE || userSession.idRol == ID_ADMINISTRATOR_ROLE) {
          setDisplayNewMovSection(true);
          display = true;
        }
        else
          setDisplayNewMovSection(false);

        break;
      case ID_CLOSED_STATE:
        setDisplayNewMovSection(false);
    }

    if (display) {
      TicketStatusFlowService.getStates(idTicketState)
        .then((response) => {
          setTicketStates(response.data);
        })
        .catch((error) => {
          console.error(error);
        });

      setValue("idSessionUser", userSession.idUsuario);
    }
  };

  const onSubmit = (DataForm) => {
    try {
      if (newMovementSchema.isValid()) {
        TicketService.updateTicket(DataForm)
          .then(() => {
            if (images.length > 0) {
              formData.append("idTicket", DataForm.idTicket);

              images.map((image) => (
                formData.append("files[]", image.file)
              ))
              
              TicketImageService.uploadImages(formData)
                .then(() => {
                  setImages([]);
                  setRefresh(i => i + 1); 
                })
                .catch((error) => {
                  console.error(error);
                  throw error;
                });
            }
            else
              setRefresh(i => i + 1);
            
            reset({idNewState: "", comment: ""});
            modalContentRef.current.scrollTop  = 0;
            refreshCount();

            toast.success(t('messages.movementRegisteredSuccess'), { duration: 4000 });    
          })
          .catch((error) => {
            toast.error(t('messages.errorRegisteringMovement'));
            console.error(error);
          });
      }
    } catch (error) {
      toast.error(t('messages.errorRegisteringMovement'));
      console.error(error);
    }
  };

  const onError = (errors, e) => {
    toast.error(t('messages.errorRegisteringMovement'));
    console.log(errors, e);
  };

  useEffect(() => {
    const idTiquete = routeParams.id;

    TicketService.getTicketById(idTiquete)
      .then((response) => {
        setTicket(response.data);
        setMovements(response.data.historialTiquete);

        const idTicketState = response.data?.estadoTiquete?.idEstadoTiquete;
        validateDisplayNewMovSection(idTicketState);

        if (idTicketState == ID_CLOSED_STATE) 
          setDisplayValorationSection(true);

        setValue("idTicket", response.data?.idTiquete);
      })
      .catch((error) => {
        toast.error(t('messages.errorGettingTicketDetail'));
        console.error(error);
      });

    TicketService.getSlaDetailsById(idTiquete)
      .then((response) => {
        setSlaDetails(response.data);
      })
      .catch((error) => {
        toast.error(t('messages.errorGettingSlaDetails'));
        console.error("Error al obtener detalles de SLA:", error);
      });
  }, [routeParams.id, refresh]);

  const dateTimeFormat = i18n.language === 'es' ? 'DD/MM/YYYY hh:mm:ss a' : 'MM/DD/YYYY hh:mm:ss a';

  // ... continuación

  return (
    <div>
      <Modal
        open={open}
        onClose={(reason) => {
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
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              {t('tickets.ticketNumber')} {ticket.idTiquete} - {ticket.titulo}
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
                {t('tickets.generalInfo')}
              </Stack>
            </Typography>

            <TextField
              id="standard-basic"
              label={t('tickets.description')}
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
                label={t('tickets.requesterInfo')}
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
                  label={t('tickets.creationDate')}
                  value={
                    ticket.fechaCreacion ? dayjs(ticket.fechaCreacion) : null
                  }
                  readOnly={true}
                  format={dateTimeFormat}
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
                label={t('tickets.status')}
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

              <Stack
                direction="row"
                spacing={2}
                sx={{ flex: 1 }}
              >
                <TextField
                  id="outlined-read-only-input"
                  label={t('tickets.priority')}
                  fullWidth
                  value={ticket.prioridad?.nombre ?? ""}
                  sx={{ flex: 1 }}
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

                <TextField
                  id="outlined-read-only-input-asignation-method"
                  label={t('tickets.assignmentMethod')}
                  fullWidth
                  value={
                    ticket.metodoAsignacion
                      ? ticket.metodoAsignacion?.nombre
                      : t('tickets.notAssigned')
                  }
                  sx={{ flex: 1 }}
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
                label={t('tickets.assignedTechnician')}
                fullWidth
                value={
                  ticket.tecnicoAsignado
                    ? `${ticket.tecnicoAsignado?.nombre} ${ticket.tecnicoAsignado?.primerApellido} ${ticket.tecnicoAsignado?.segundoApellido}`
                    : t('tickets.unassigned')
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
                label={t('categories.category')}
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
                {t('tickets.slaMetrics')}
              </Stack>
            </Typography>

            {slaDetails ? (
              <>
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
                        label={t('tickets.slaResponseLimit')}
                        value={
                          slaDetails.SLARespuestaLimite
                            ? dayjs(slaDetails.SLARespuestaLimite)
                            : null
                        }
                        readOnly={true}
                        fullWidth
                        format={dateTimeFormat}
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
                        getColorMap(theme, slaRespuestaDisplay.color);
                      return (
                        <Box
                          sx={{
                            backgroundColor: backgroundColor,
                            borderRadius: 2,
                            p: 0.8,
                            display: "flex",
                            alignItems: "center",
                            textAlign: "left",
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
                              {t('tickets.status')}: {slaRespuestaDisplay.estado}
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
                                {t('tickets.responded')}:{" "}
                                {dayjs(slaDetails.FechaRespuestaReal).format(dateTimeFormat)}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      );
                    })()}
                  </Stack>
                </Stack>

                <Stack direction={{ md: "row" }} spacing="10%">
                  <Stack
                    width={{ xs: "100%", sm: "50%" }}
                    paddingBottom={{ xs: "1.5rem", md: "0rem" }}
                    alignSelf={{ md: "center" }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimeField
                        label={t('tickets.slaResolutionLimit')}
                        value={
                          slaDetails.SLAResolucionLimite
                            ? dayjs(slaDetails.SLAResolucionLimite)
                            : null
                        }
                        readOnly={true}
                        format={dateTimeFormat}
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
                              {t('tickets.status')}: {slaResolucionDisplay.estado}
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
                                {t('tickets.resolvedOn')}:{" "}
                                {dayjs(slaDetails.FechaResolucionReal).format(dateTimeFormat)}
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
              <Alert severity="info">{t('tickets.loadingSlaMetrics')}</Alert>
            )}
          </Box>

          <TicketHistory movements={movements}></TicketHistory>

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
                    {t('tickets.newMovement')}
                  </Stack>
                </Typography>

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
                          <InputLabel id="id">{t('tickets.newState')}</InputLabel>
                          <Select
                            {...field}
                            labelId="idNewState"
                            value={field.value}
                            label={t('tickets.newState')}
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
                      label={t('tickets.comment')}
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

                <ImagesSelector images={images} setImages={setImages}/>
              </Box>
            </form>
          ) : null}

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
                  {t('tickets.ticketRating')}
                </Stack>
              </Typography>

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
                    value={parseInt(ticket.valoracion ?? 0)}
                    emptyIcon={
                      <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                    }
                    readOnly
                    size="large"
                  />
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
                </Box>

                <TextField
                  id="standard-basic"
                  label={t('tickets.ratingComment')}
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
                {t('tickets.noRatingRegistered')}
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
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState("");

  const dateFormat = i18n.language === 'es' ? 'DD/MM/YYYY hh:mm:ss a' : 'MM/DD/YYYY hh:mm:ss a';

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
            {t('tickets.ticketMovements')}
          </Stack>
        </Typography>

        <Box sx={{ position: "relative", pl: 3, mt: 2 }}>
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
                        {dayjs(mov.fecha).format(dateFormat)}
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
                            alt={`${t('common.evidence')} ${idx + 1}`}
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
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt={t('tickets.enlargedView')}
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
            {t('common.close')}
          </Button>
        </Box>
      </Modal>
    </>
  );
}