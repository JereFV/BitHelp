import {useContext, useState, useEffect, useMemo } from "react";
import Bot from "react-simple-chatbot";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ThemeProvider } from "styled-components";
import {useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

ChatBot.propTypes = {
  steps: PropTypes.array,
  open: PropTypes.bool
}

export default function ChatBot({ steps, open}) {
  //Obtiene la condición de autenticación del usuario dentro del sistema.
  const {isAuthenticated } = useContext(AuthContext);

  //Obtiene el tema seleccionado y el modo a partir de la clase definida en el html.
  const theme = useTheme();
  const [mode, setMode] = useState(document.documentElement.classList.contains("dark") ? "dark" : "light");

  //Constante de traducción según diccionarios definidos.
  const {t} = useTranslation();

  //Configuración del tema según el modo de visualización seleccionado, utilizando useMemo para reutilización en memoria.
  const botTheme = useMemo(() => {
    return {
      background:
        mode === "dark"
          ? theme.colorSchemes.dark.palette.background.paper
          : theme.colorSchemes.light.palette.background.paper,
      headerBgColor:  
        mode === "dark"
          ? "#6ab9faff"
          : theme.colorSchemes.light.palette.primary.main,
      headerFontColor: "white",
      headerFontSize: "1.3rem",
      botBubbleColor: 
        mode === "dark"
          ? "#6ab9faff"
          : theme.colorSchemes.light.palette.primary.main,
      botFontColor: "#fff",
      userBubbleColor: mode === "dark"
          ? theme.colorSchemes.light.palette.background.paper
          : "#879099ff",
      userFontColor: 
        mode === "dark"
          ? theme.colorSchemes.light.palette.text.primary
          : theme.colorSchemes.dark.palette.text.primary,
    };
  }, [theme, mode]);

   useEffect(() => {
    //Acceso al elemento html base.
    const html = document.documentElement;

    //Configuración de un observer encargado de configurar el nuevo modo seleccionado.
    const observer = new MutationObserver(() => {
      const newMode = html.classList.contains("dark") ? "dark" : "light";
      setMode(newMode);
    });

    //Se asocia el observert con la clase del documento html raíz.
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    //Desconexión del observer.
    return () => observer.disconnect();
  }, []);
  
  //Renderiza únicamente si se ha iniciado sesión previamente.
  return (isAuthenticated ? (
    <>
      {/*Estilos personalizados a los diferentes elementos, con ajustes de responsividad.*/}
      <style>
        {`
          .rsc-content {
            height: 460px;
          }

          .rsc-ts-bubble  {
            white-space: pre-wrap;
          }

          @media (max-width: 568px) {
            .rsc-container {
              top: 65px !important;
            }

            .rsc-content {
              height: 85%;
            }
          }
        `}
      </style>

      <ThemeProvider theme={botTheme}>  
        <Bot        
          steps={steps}
          headerTitle={t("chatbot.headerTtile")}
          hideSubmitButton={true}
          floating={"true"}
          footerStyle={{display: "none" }}
          customStyle={{maxwidth: "100%" }}
          opened={open ? open : undefined}   
        />
      </ThemeProvider>
    </>
  ) : null);  
}
