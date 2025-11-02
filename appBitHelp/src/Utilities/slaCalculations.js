import dayjs from 'dayjs';

/**
 * @typedef {object} SlaDisplayData
 * @property {'A Tiempo'|'Cumplido'|'No Cumplido'} estado - El estado de cumplimiento del SLA.
 * @property {string} tiempoRestante - El tiempo restante o el tiempo excedido formateado (HH:MM:SS).
 * @property {'success'|'warning'|'error'} color - El color de alerta de Material UI.
 */

/**
 * Formatea segundos a HH:MM:SS (horas:minutos:segundos).
 *
 *
 * @param {number} totalSeconds - Segundos totales (puede ser negativo si es tiempo excedido).
 * @returns {string} - Cadena de tiempo formateada.
 */
export const formatTimeRemaining = (totalSeconds) => {
    // Se usa Math.abs para trabajar con el valor absoluto y evitar problemas
    const seconds = Math.abs(totalSeconds); 
    
    const hours = Math.trunc(seconds / 3600);
    const minutes = Math.trunc((seconds % 3600) / 60);
    const remainingSeconds = Math.trunc(seconds % 60);
    
    // Devolvemos el formato HH:MM:SS
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(remainingSeconds).padStart(2, '0');

    return `${h}:${m}:${s}`;
};

/**
 * Calcula el estado de cumplimiento del SLA para su visualización en el frontend.
 *
 * @param {string} limite - Fecha y hora límite del SLA (ej: SLARespuestaLimite).
 * @param {string|null} real - Fecha y hora real de la acción (ej: FechaRespuestaReal).
 * @param {number|null} cumplimiento - Indicador de cumplimiento del backend (1: cumplido, 0: no cumplido).
 * @returns {SlaDisplayData} - Objeto con el estado, tiempo y color para mostrar.
 */
export const getSLAStatus = (limite, real) => {
    
    // Si no hay límite definido, no aplica
    if (!limite) {
        return {
            estado: 'No Aplicable',
            tiempoRestante: 'No hay límite de SLA definido.',
            color: 'warning'
        };
    }

    const now = dayjs();
    const limiteDate = dayjs(limite);
    const realDate = real ? dayjs(real) : null;
    const isCompleted = !!realDate;

    // Utilizamos la diferencia en segundos para toda la lógica
    let diferencia;

    // --- Caso 1: La acción ya se completó (Respuesta o Resolución) ---
    if (isCompleted) {
        // Diferencia: (Fecha Real) - (Fecha Límite). Positivo = tarde, Cero/Negativo = a tiempo
        diferencia = realDate.diff(limiteDate, 'second'); 

        // Se considera CUMPLIDO si la acción real es igual o anterior al límite (diferencia <= 0)
        if (diferencia <= 0) {
            return {
                estado: 'Cumplido',
                tiempoRestante: 'Completado a tiempo',
                color: 'success'
            };
        } else {
            // No cumplido (se excedió por 1 segundo o más)
            const tiempoExcedido = formatTimeRemaining(diferencia);
            return {
                estado: 'No Cumplido',
                tiempoRestante: `Se excedió por ${tiempoExcedido}`,
                color: 'error'
            };
        }
    } 
    // --- Caso 2: La acción AÚN NO se completa ---
    else {
        // Si el límite ya pasó (la fecha límite es antes que ahora)
        if (limiteDate.isBefore(now)) {
            // Diferencia: (Ahora) - (Fecha Límite). Esto es positivo si está vencido.
            diferencia = now.diff(limiteDate, 'second'); 
            const tiempoExcedido = formatTimeRemaining(diferencia);
            
            return {
                estado: 'No Cumplido',
                tiempoRestante: `Vencido hace ${tiempoExcedido}`,
                color: 'error'
            };
        } 
        // Si aún está a tiempo
        else {
            // Diferencia: (Fecha Límite) - (Ahora). Esto es positivo.
            diferencia = limiteDate.diff(now, 'second');
            const tiempoRestante = formatTimeRemaining(diferencia);
            
            // Si falta menos de X tiempo (ej. 4 horas = 14400 segundos), es 'warning'
            const isNearDeadline = diferencia < 14400; 

            return {
                estado: 'A Tiempo',
                tiempoRestante: `${tiempoRestante} restantes`,
                color: isNearDeadline ? 'warning' : 'success'
            };
        }
    }
};