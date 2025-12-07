import {useContext, useState, useEffect, useMemo } from "react";
import Bot from "react-simple-chatbot";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ThemeProvider } from "styled-components";
import {useTheme } from "@mui/material/styles";
import { CreateTicket } from "../Tickets/CreateTicket.jsx";

export default function ChatBot() {
  //Obtiene la condición de autenticación del usuario dentro del sistema.
  const {isAuthenticated } = useContext(AuthContext);

  //Datos del usuario en sesión.
  const user = JSON.parse(localStorage.getItem("userSession"));

  //Obtiene el tema seleccionado y el modo a partir de la clase definida en el html.
  const [mode, setMode] = useState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  const theme = useTheme();

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

  //Configuración del flujo o etapas.
  const steps = [
    {
      id: "home",
      message: `¡Hola, ${user?.nombre}! Soy Bit tu asistente virtual.\n¿En que puedo ayudarte?`,
      trigger: "menu"
    },
    {
      id: "menu",
      options: [
        { value: "support", label: "🛠️ Soporte Técnico", trigger: "supportHome"},
        { value: "system", label: "📘 Uso del sistema", trigger: "systemHome" }
      ]
    },
    {
      id: "supportHome",
      message: "¿Cual es el tipo de problema que presentas?",
      trigger: "supportMenu"
    },
    {
      id: "supportMenu",
      options: [
        { value: "software", label: "🧩 Error en aplicación", trigger: "softwareMessage"},
        { value: "hardware", label: "🖥️ Problemas con la computadora", trigger: "hardwareMessage"},
        { value: "network", label: "📶 Problemas con la red", trigger: "networkMessage"},
        { value: "accounts", label: "🔐 Cuentas y Accesos",  trigger: "accountsMessage"},
        { value: "backMenu", label: "🔙 Regresar", trigger: "menu"}
      ]
    },
    {
      id: "softwareMessage",
      message: "¡Aquí tienes algunas recomendaciones para tu problema!"
                + "\n\n•Reiniciar la aplicación."
                + "\n•Borrar caché o datos temporales."
                + "\n•Verificar actualizaciones pendientes.",
      trigger: "supportReviewMessage"
    },
    {
      id: "hardwareMessage",
      message: "¡Aquí tienes algunas recomendaciones para tu problema!"
                + "\n\n•Reiniciar el equipo."
                + "\n•Verificar conexión de cables."
                + "\n•Probar con otros periféricos.",
      trigger: "supportReviewMessage"
    },
    {
      id: "networkMessage",
      message: "¡Aquí tienes algunas recomendaciones para tu problema!"
                + "\n\n•Verificar conexión WIFI."
                + "\n•Probar conexión por cable."
                + "\n•Verificar conexión VPN.",
      trigger: "supportReviewMessage"
    },
    {
      id: "accountsMessage",
      message: "¡Aquí tienes algunas recomendaciones para tu problema!"
                + "\n\n•Verificar que el usuario y contraseña sean correctos."
                + "\n•Intentar restablecer la contraseña."
                + "\n•Solicitar desloqueo de cuenta.",
      trigger: "supportReviewMessage"
    },
    {
      id: "supportReviewMessage",
      message: "¿Te fue útil la información anterior?",
      trigger: "supportReviewOptions"
    },
    {
    id: "supportReviewOptions",
      options: [
        { value: "yes", label: "✅ Sí", trigger: "yesResponseMessage" },
        { value: "no", label: "🚫 No", trigger: "supportNoResponseMessage" }
      ]
    },
    {
      id: "supportNoResponseMessage",
      message: "Lamento no haber ayudado a resolver tu problema.\nPuedes regresar a las opciones anteriores o de lo contrario te sugiero crear un nuevo tiquete con el problema.",
      trigger: "returnSupportMenu"
    },
    {
    id: "returnSupportMenu",
      options: [
        { value: "returnSupport", label: "🔙 Regresar", trigger: "supportMenu" },
      ]
    },
    {
      id: "systemHome",
      message: "Selecciona alguna de las siguientes opciones",
      trigger: "systemMenu"
    },
    {
      id: "systemMenu",
      options: [
        { value: "newTicket", label: "📝 ¿Cómo crear un tiquete?", trigger: "newTicketMessage" },
        { value: "password", label: "🔐 ¿Cómo cambiar mi contraseña?", trigger: "passwordMessage" },
        { value: "ticketList", label: "📋 ¿Dónde ver mis tiquetes existentes?", trigger: "ticketListMessage" }
      ]
    },
    {
      id: "newTicketMessage",
      message: "Dirigete al apartado \"Tiquetes\" en el menú principal, allí encontrarás la opción de \"Crear Tiquete\", la cual desplegará una nueva ventana para el ingreso de la información.",
      trigger: "systemReviewMessage"
    },
    {
      id: "passwordMessage",
      message: "Actualmente debes solicitar el apoyo de un usuario administrador para cambiar tu contraseña. (Próximamente podrás hacerlo por tu cuenta.)",
      trigger: "systemReviewMessage"
    },
     {
      id: "ticketListMessage",
      message: "Dirigete al apartado \"Tiquetes\" en el menú principal, allí encontrarás la opción de \"Lista de Tiquetes\", la cual mostrará una pantalla con todos los tiquetes que hayas reportado hasta el momento con posibilidad de filtrarlos por estado.",
      trigger: "systemReviewMessage"
    },
    {
      id: "systemReviewMessage",
      message: "¿Te fue útil la información anterior?",
      trigger: "systemReviewOptions"
    },
    {
    id: "systemReviewOptions",
      options: [
        { value: "yes", label: "✅ Sí", trigger: "yesResponseMessage" },
        { value: "no", label: "🚫 No", trigger: "systemNoResponseMessage" }
      ]
    },
    {
      id: "systemNoResponseMessage",
      message: "Lamento no haber ayudado a resolver tu problema.\nPuedes regresar a las opciones anteriores o de lo contrario contactar a un administrador del sistema.",
      trigger: "returnSystemMenu"
    },
    {
    id: "returnSystemMenu",
      options: [
        { value: "returnSystem", label: "🔙 Regresar", trigger: "systemMenu" },
      ]
    },
    {
      id: "yesResponseMessage",
      message: "¡Me alegra mucho haber ayudado a resolver tu problema!\n¿Necesitas algo adicional?",
      trigger: "menu"
    },
  ];

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
          headerTitle="Asistente Virtual Bit"
          hideSubmitButton={true}
          //recognitionEnable={false}
          placeholder="Seleccione una opción..."
          floating={"true"}
          //width={"100%"}
          //opened={"false"}
          invalid={"false"}
          footerStyle={{display: "none" }}
          customStyle={{maxwidth: "100%" }}
          //height={"300px"} 
        />
      </ThemeProvider>
      {/* Botón flotante */}
      {/*<button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 30,
          borderRadius: "50%",
          width: 60,
          height: 60,
          background: "#1976d2",
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          fontSize: 24
        }}
      >
      </button>

      {/* Contenedor del chatbot */}
      {/*{open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 350,
            height: 480,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            overflow: "hidden",
            zIndex: 9999
          }}
        >
          <Bot
            steps={steps}
            headerTitle="Asistente Virtual"
            hideSubmitButton={true}
            //recognitionEnable={false}
            //placeholder="Seleccione una opción..."
          />
        </div>
      )}*/}
    </>
  ) : null);     
}
