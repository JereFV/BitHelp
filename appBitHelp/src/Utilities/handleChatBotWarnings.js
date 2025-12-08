//Método original de error en consola.
const originalConsoleError = console.error;

// Patrones exactos de warnings que genera react-simple-chatbot producto de bugs conocidos.
const chatbotBugWarnings = [
  'Received `%s` for a non-boolean attribute `%s`',
  "React does not recognize the `%s` prop"
];

//Nombre de la librería sobre la que se filtrarán los warning.
const CHATBOT_FILE_HINT = 'react-simple-chatbot';

//Sobreescribre el método de escritura de error en consola, omitiendo los bugs conocidos del paquete 'react-simple-chatbot'
console.error = (...args) => {
  const message = args[0];

  //Verifica que el error generado se encuentre en el arreglo definido y que además el stacktrace haga referencia a la librería.
  const isChatbotWarning =
    typeof message === 'string' &&
    chatbotBugWarnings.some(w => message.includes(w)) && 
    (args[8]?.includes?.(CHATBOT_FILE_HINT) || args[3]?.includes?.(CHATBOT_FILE_HINT));

 //Omite la estritura en consola
  if (isChatbotWarning) {
    return; 
  }

  // Mostrar cualquier otro error normalmente
  originalConsoleError(...args);
};
