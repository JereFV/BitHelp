import ChatBot from "./ChatBot";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo, useRef } from "react";

export default function ChatbotContainer() {
  //Datos del usuario en sesión.
  const user = JSON.parse(localStorage.getItem("userSession"));

  //Gestiona la traducción de valores según el idioma seleccionado.
  const { t, i18n } = useTranslation();

  //Constante auxiliar para el remontado del componente al cambiar de idioma.
  const [botKey, setBotKey] = useState(0);

  //Controla el estado del chatbot a remontar luego del cambio de idioma. (abierto, cerrado)
  const [open, setOpen] = useState(false);

  //Referencia al estado del chat cuando se cambia el idioma con la ventana desplegada.
  const openRef = useRef(false);

  //Configuración de etapas o arbol lógico de decisiones utilizando useMemo para reutilización en memoria.
  const steps = useMemo(() => (
  [
    {
      id: "home",
      message: t('chatbot.homeMessage', {name: user.nombre}),
      trigger: "menu"
    },
    {
      id: "menu",
      options: [
        { value: "support", label: t('chatbot.supportOption'), trigger: "supportHome"},
        { value: "system", label: t('chatbot.systemOption'), trigger: "systemHome" }
      ],
    },
    {
      id: "supportHome",
      message: t('chatbot.supportHome', {name: user.nombre}),
      trigger: "supportMenu"
    },
    {
      id: "supportMenu",
      options: [
        { value: "software", label: t('chatbot.softwareOption'), trigger: "softwareMessage"},
        { value: "hardware", label: t('chatbot.hardwareOption'), trigger: "hardwareMessage"},
        { value: "network", label: t('chatbot.networkOption'), trigger: "networkMessage"},
        { value: "accounts", label: t('chatbot.accountsOption'),  trigger: "accountsMessage"},
        { value: "backMenu", label: t('chatbot.backOption'), trigger: "menu"}
      ]
    },
    {
      id: "softwareMessage",
      message: t('chatbot.softwareMessage'),
      trigger: "supportReviewMessage"
    },
    {
      id: "hardwareMessage",
      message: t('chatbot.hardwareMessage'),
      trigger: "supportReviewMessage"
    },
    {
      id: "networkMessage",
      message: t('chatbot.networkMessage'),
      trigger: "supportReviewMessage"
    },
    {
      id: "accountsMessage",
      message: t('chatbot.accountsMessage'),
      trigger: "supportReviewMessage"
    },
    {
      id: "supportReviewMessage",
      message: t('chatbot.reviewMessage'),
      trigger: "supportReviewOptions"
    },
    {
      id: "supportReviewOptions",
      options: [
        { value: "yes", label: t('chatbot.yes'), trigger: "yesResponseMessage"},
        { value: "no", label: t('chatbot.no'), trigger: "supportNoResponseMessage" }
      ],
    },
    {
      id: "supportNoResponseMessage",
      message: t('chatbot.supportNoMessage'),
      trigger: "returnSupportMenu"
    },
    {
      id: "returnSupportMenu",
      options: [
        { value: "returnSupport", label: t('chatbot.backOption'), trigger: "supportMenu"}
      ],
    },
    {
      id: "systemHome",
      message: t('chatbot.systemHome'),
      trigger: "systemMenu"
    },
    {
      id: "systemMenu",
      options: [
        { value: "newTicket", label: t('chatbot.newTicketOption'), trigger: "newTicketMessage"},
        { value: "password", label: t('chatbot.passwordOption'), trigger: "passwordMessage"},
        { value: "ticketList", label: t('chatbot.ticketListOption'), trigger: "ticketListMessage"}
      ]
    },
    {
      id: "newTicketMessage",
      message: t('chatbot.newTicketMessage'),
      trigger: "systemReviewMessage"
    },
    {
      id: "passwordMessage",
      message: t('chatbot.passwordMessage'),
      trigger: "systemReviewMessage"
    },
    {
      id: "ticketListMessage",
      message: t('chatbot.ticketListMessage'),
      trigger: "systemReviewMessage"
    },
    {
      id: "systemReviewMessage",
      message: t('chatbot.reviewMessage'),
      trigger: "systemReviewOptions"
    },
    {
      id: "systemReviewOptions",
      options: [
        { value: "yes", label: t('chatbot.yes'), trigger: "yesResponseMessage"},
        { value: "no", label: t('chatbot.no'), trigger: "systemNoResponseMessage" }
      ],
    },
    {
      id: "systemNoResponseMessage",
      message: t('chatbot.systemNoMessage'),
      trigger: "returnSystemMenu"
    },
    {
      id: "returnSystemMenu",
      options: [
        { value: "returnSystem", label: t('chatbot.backOption'), trigger: "systemMenu"}
      ],
    },
    {
      id: "yesResponseMessage",
      message: t('chatbot.yesMessage'),
      trigger: "menu"
    }
  ]), [t]);

  useEffect(() => {
    //Detecta si el contenedor del chat está visible, mediante las clases que genera al desplegarse.
    const isChatVisible = !!document.querySelector(".bwJvUL") || !!document.querySelector(".cxeHtn");

    openRef.current = isChatVisible;

    //Fuera el remontado del componente
    setBotKey(prev => prev + 1);

    //Envía el estado a partir del valor obtenido como referencia.
    setOpen(openRef.current);

  }, [i18n.language]);

  return <ChatBot key={botKey} steps={steps} open={open ? true : undefined} />;
}
