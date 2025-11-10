// validationSchemas.js
import * as yup from 'yup';

const phoneRegExp = /^\d{8,15}$/;
const isEditing = (ref, value) => {
    // Si estamos en modo edición (la prop 'userToEdit' existe)
    // la contraseña es opcional si el campo está vacío.
    return ref.options.context?.isEditing && !value;
};

export const userSchema = yup.object().shape({
    // Obligatorios y longitud mínima de 2
    nombre: yup.string().required("El nombre es obligatorio.").min(2, "Mínimo 2 caracteres."),
    primerApellido: yup.string().required("El primer apellido es obligatorio.").min(2, "Mínimo 2 caracteres."),
    segundoApellido: yup.string().nullable(),

    // Correo: requerido y con formato de email
    correo: yup.string().email("El formato del correo electrónico no es válido.").required("El correo es obligatorio."),
    
    // Teléfono: opcional, pero si existe debe cumplir el formato
    telefono: yup.string().nullable().matches(phoneRegExp, "El teléfono debe contener solo números (8 a 15 dígitos) o estar vacío.").optional(),
    
    // Rol: Requerido (asumimos que el select siempre tendrá un valor por defecto)
    idRol: yup.string().required("Debe seleccionar un Rol."),

    // Contraseña:
    contrasenna: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    // Usamos when para hacerla requerida SOLO si NO estamos editando
    .when('$isEditing', {
        is: false, 
        then: (schema) => schema.required('La contraseña es obligatoria para nuevos usuarios.'),
        otherwise: (schema) => schema.notRequired().nullable().test( // Permite que no esté en el objeto
             'no-presence', 
             'Este campo debe ser nulo o vacío.', 
             (value) => value === undefined || value === null || value === ''
        ),
    }),
});