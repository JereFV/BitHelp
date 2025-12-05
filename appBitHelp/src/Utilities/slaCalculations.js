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
 * @param {string} limite - Fecha y hora límite del SLA.
 * @param {string|null} real - Fecha y hora real de la acción.
 * @param {function(string, object?): string} t - Función de traducción i18n.
 * @returns {SlaDisplayData} - Objeto con el estado, tiempo y color para mostrar.
 */
export const getSLAStatus = (limite, real, t) => { 
    
    // Si no hay límite definido, no aplica
    if (!limite) {
        return {
            // Usa las claves del JSON para el estado y el mensaje
            estado: t('sla.notApplicable'), 
            tiempoRestante: t('sla.noLimitDefined'),
            color: 'warning'
        };
    }

    const now = dayjs();
    const limiteDate = dayjs(limite);
    const realDate = real ? dayjs(real) : null;
    const isCompleted = !!realDate;

    let diferencia;

    // Caso 1: La acción ya se completó (Respuesta o Resolución)
    if (isCompleted) {
        diferencia = realDate.diff(limiteDate, 'second'); 

        // Cumplido: real es igual o anterior al límite (diferencia <= 0)
        if (diferencia <= 0) {
            return {
                estado: t('status.fulfilled'), // "Cumplido"
                tiempoRestante: t('sla.completedOnTime'), // "Completado a tiempo"
                color: 'success'
            };
        } else {
            // No cumplido (se excedió)
            const tiempoExcedido = formatTimeRemaining(diferencia);
            return {
                estado: t('status.notFulfilled'), // "No Cumplido"
                // usamos la variable 'time' para el formato HH:MM:SS
                tiempoRestante: t('sla.exceededBy', { time: tiempoExcedido }), // "Se excedió por HH:MM:SS"
                color: 'error'
            };
        }
    } 
    //  Caso 2: La acción AÚN NO se completa 
    else {
        // Si el límite ya pasó (la fecha límite es antes que ahora)
        if (limiteDate.isBefore(now)) {
            // Vencido
            diferencia = now.diff(limiteDate, 'second'); 
            const tiempoExcedido = formatTimeRemaining(diferencia);
            
            return {
                estado: t('status.notFulfilled'), // "No Cumplido"
                //  usamos la variable 'time' para el formato HH:MM:SS
                tiempoRestante: t('sla.overdueSince', { time: tiempoExcedido }), // "Vencido hace HH:MM:SS"
                color: 'error'
            };
        } 
        // Si aún está a tiempo
        else {
            diferencia = limiteDate.diff(now, 'second');
            const tiempoRestante = formatTimeRemaining(diferencia);
            
            const isNearDeadline = diferencia < 14400; // 4 horas

            return {
                estado: t('status.onTime'), // "A Tiempo"
                //  usamos la variable 'time' para el formato HH:MM:SS
                tiempoRestante: t('sla.remaining', { time: tiempoRestante }), // "HH:MM:SS restantes"
                color: isNearDeadline ? 'warning' : 'success'
            };
        }
    }
};