import { useState } from "react";
import {
  IconButton,
  Alert,
  Box,
  Typography,
  Modal,
  Stack,
  Button,
} from "@mui/material";
import { Close, Image, Delete } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

//Validación de propiedades para el historial del tiquete
ImagesSelector.propTypes = {
  newTicket: PropTypes.bool,
  images: PropTypes.array,
  setImages: PropTypes.any
}

export default function ImagesSelector({ newTicket, images, setImages }) {
  const { t } = useTranslation();
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

    //Almacena las imágenes sobre el arreglo envíado por el componente padre.
    setImages(updateImages);
  };

  const handleEliminar = (index) => {
    //Filtra el arreglo de imágenes adjuntas, excluyendo el elemento seleccionado para eliminación.
    const updateImages = images.filter((_, i) => i !== index);

    //Renderizado de imágenes luego de la eliminación del elemento, actualizando el arreglo.
    setImages(updateImages);
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
      {newTicket ? (
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
            {t('tickets.attachedImages')}
          </Stack>
        </Typography>
      ) : null}

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
                alt={`${t('common.attachment')} ${index + 1}`}
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
            {newTicket ? t('tickets.noAttachedImages') : t('tickets.noAttachedImagesMovement')} 
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
          {t('tickets.selectImages')}
          <VisuallyHiddenInput
            type="file"
            onChange={handleSeleccion}
            multiple
            accept="image/*"
          />
        </Button>

        <Button
          type="submit"
          variant="contained"
          startIcon={<SendIcon />}
          color="success"
        >
          {newTicket ? t('tickets.createTicket') : t('tickets.saveMovement')}
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
    </Box>
  );
}