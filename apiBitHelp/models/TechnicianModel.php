<?php

class TechnicianModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    /**
     * Obtiene todos los técnicos, incluyendo la información de su usuario y sus especialidades.
     * @return array|null Los técnicos encontrados.
     */
    public function getAllTechnicians()
    {
        try {
            // Consulta SQL para obtener los técnicos, especialidades y combinar con la tabla 'usuario'.
            $query = "SELECT
                        t.idTecnico,
                        t.idUsuario,
                        dt.nombre AS disponibilidad, 
                        t.cargaTrabajo,
                        t.estado,
                        u.nombre,
                        u.primerApellido,
                        u.segundoApellido,
                        u.correo,
                        u.telefono
                    FROM
                        tecnico t
                    INNER JOIN
                        usuario u ON t.idUsuario = u.idUsuario
                    INNER JOIN
                        disponibilidad_tecnico dt ON t.idDisponibilidad = dt.idDisponibilidad;";
            // Ejecución de la consulta.
            $technicians = $this->connection->ExecuteSQL($query);
            // ✅ DEBUG 11: Muestra cuántos técnicos se encontraron antes de la lógica de especialidades
            error_log("DEBUG 11 (Tech Model): Conteo de técnicos encontrados por SQL: " . count($technicians));
            // Si no hay técnicos, devuelve un array vacío (o el resultado de ExecuteSQL)
            if (empty($technicians)) {
                return [];
            }
            
            // Iterar sobre cada técnico para añadir sus especialidades
            foreach ($technicians as $tech) {
                error_log("DEBUG Entró al foreach");
                
                // Query secundario para obtener las especialidades de ESTE técnico
                $specialtyQuery = "SELECT e.nombre 
                                FROM tecnico_especialidad te
                                INNER JOIN especialidad e ON te.idEspecialidad = e.idEspecialidad
                                WHERE te.idTecnico = " . $tech->idTecnico;
                
                $specialtiesResult = $this->connection->ExecuteSQL($specialtyQuery);
                
                // ****** INICIO DE LA CORRECCIÓN ******
                // Asegurar que el resultado sea un array antes de usar array_map (prevención de TypeError)
                if (!is_array($specialtiesResult)) {
                    $specialtiesResult = [];
                }
                // ****** FIN DE LA CORRECCIÓN ******

                // Mapear los resultados (objetos) a un array simple de strings (nombres)
                // Esto creará el array [ "Soporte Redes", "Hardware", ... ]
                $tech->especialidades = array_map(function($spec) {
                    return $spec->nombre;
                }, $specialtiesResult);
            }
            return $technicians;
        } catch (Exception $ex) {
            handleException($ex);
        }
    }
    /**
     * Obtiene el nombre completo de un técnico a partir de su ID de Técnico.
     * @param int $idTecnico ID del técnico.
     * @return string|null Nombre completo (Nombre Apellido1 Apellido2) o null si no se encuentra.
     */
    public function getTechnicianFullName(int $idTecnico)
    {
        try {
            $query = "SELECT 
                        CONCAT(COALESCE(u.nombre,''), ' ', COALESCE(u.primerApellido,''), ' ', COALESCE(u.segundoApellido,'')) AS nombreCompleto
                    FROM 
                        tecnico t
                    INNER JOIN 
                        usuario u ON t.idUsuario = u.idUsuario
                    WHERE 
                        t.idTecnico = {$idTecnico}";

            // Asumo que $this->connection->executeSQL ejecuta la consulta y retorna el resultado
            $result = $this->connection->executeSQL($query); 
            
            // Devolvemos el nombre limpio o null
            return trim($result[0]->nombreCompleto) ?: null; 
            
        } catch (Exception $ex) {
            error_log("Error al obtener nombre de técnico: " . $ex->getMessage());
            return "ERROR_NOMBRE";
        }
    }

    /**
     * Busca el técnico más adecuado (menor carga) que pertenezca a CUALQUIERA de las especialidades dadas.
     * @param array $idEspecialidades Array de IDs de especialidades.
     * @return object|null El técnico con menor carga de trabajo o null (con idTecnico y cargaTrabajo).
     */
    public function getAvailableTechnicianBySpecialties(array $idEspecialidades)
    {
        if (empty($idEspecialidades)) {
            return null;
        }
        
        $specialtyList = implode(',', $idEspecialidades);
        
        try {
            $query = "
                SELECT 
                    tec.idTecnico,
                    tec.cargaTrabajo
                FROM tecnico tec
                INNER JOIN tecnico_especialidad tecEsp ON tec.idTecnico = tecEsp.idTecnico
                WHERE tec.estado = 1 /* Solo activos */
                AND tecEsp.idEspecialidad IN ($specialtyList)
                GROUP BY tec.idTecnico, tec.cargaTrabajo /* Agrupar por técnico para contar */
                ORDER BY tec.cargaTrabajo ASC, tec.idTecnico ASC 
                LIMIT 1
            ";
            
            $result = $this->connection->executeSQL($query);
            return $result[0] ?? null;
            
        } catch (Exception $ex) {
            handleException($ex);
            return null;
        }
    }

    public function getTechnicianById(int $idTecnico)
    {
        try {
            // 1. Consulta Principal: Obtener datos del técnico y su usuario
            $query = "SELECT
                        t.idTecnico,
                        t.idUsuario,
                        dt.nombre AS disponibilidad, 
                        t.cargaTrabajo,
                        t.estado,
                        u.usuario,
                        u.nombre,
                        u.primerApellido,
                        u.segundoApellido,
                        u.correo,
                        u.telefono
                    FROM
                        tecnico t
                    INNER JOIN
                        usuario u ON t.idUsuario = u.idUsuario
                    INNER JOIN
                        disponibilidad_tecnico dt ON t.idDisponibilidad = dt.idDisponibilidad
                    WHERE
                        t.idTecnico = " . $idTecnico;

            // Ejecución de la consulta. Se espera solo un resultado.
            $technician = $this->connection->ExecuteSQL($query);
            
            // Si no se encuentra el técnico, devuelve null.
            if (empty($technician)) {
                return null;
            }

            // Obtener el primer (y único) técnico del resultado
            $tech = $technician[0];

            // 2. Consulta Secundaria: Añadir sus especialidades
            $specialtyQuery = "SELECT e.nombre 
                            FROM tecnico_especialidad te
                            INNER JOIN especialidad e ON te.idEspecialidad = e.idEspecialidad
                            WHERE te.idTecnico = " . $tech->idTecnico;
            
            $specialtiesResult = $this->connection->ExecuteSQL($specialtyQuery);
            
            // Asegurar que el resultado sea un array antes de usar array_map (prevención de TypeError)
            if (!is_array($specialtiesResult)) {
                $specialtiesResult = [];
            }
            
            // Mapear los resultados (objetos) a un array simple de strings (nombres)
            $tech->especialidades = array_map(function($spec) {
                return $spec->nombre;
            }, $specialtiesResult);
            
            return $tech;

        } catch (Exception $ex) {
            handleException($ex);
        }
    }

    /**
  * Obtiene la lista completa de opciones de disponibilidad.
  * @return array Las opciones de disponibilidad.
  */
  public function getAllDisponibilities()
  {
    try {
      $query = "SELECT idDisponibilidad, nombre FROM disponibilidad_tecnico WHERE estado = 1";
      return $this->connection->ExecuteSQL($query);
    } catch (Exception $ex) {
      handleException($ex);
    }
  }

  /**
  * Obtiene la lista completa de opciones de especialidades.
  * @return array Las opciones de especialidad.
  */
  public function getAllSpecialtiesOptions()
  {
    try {
      $query = "SELECT idEspecialidad, nombre FROM especialidad WHERE estado = 1";
      return $this->connection->ExecuteSQL($query);
    } catch (Exception $ex) {
      handleException($ex);
    }
  }
    /**
     * Obtiene todos los usuarios que tienen el rol de Cliente (idRol = 1) 
     * y que NO son técnicos (no tienen registro en la tabla 'tecnico').
     * Esto se asume para el proceso de 'Promover a Técnico'.
     * @return array|null Los usuarios que pueden ser promovidos.
     */
    public function getCandidateUsers()
    {
        try {
            // Obtenemos los usuarios con rol 1 (Cliente/Estándar) Y 
            // que no tienen un idUsuario en la tabla 'tecnico' (LEFT JOIN + IS NULL)
            $query = "SELECT 
                            u.idUsuario,
                            u.usuario,
                            u.nombre,
                            u.primerApellido,
                            u.segundoApellido
                        FROM
                            usuario u
                        LEFT JOIN
                            tecnico t ON u.idUsuario = t.idUsuario
                        WHERE
                            u.idRol = 1 AND t.idUsuario IS NULL AND u.estado = 1"; // Asume u.estado = 1 (Activo)
            
            return $this->connection->ExecuteSQL($query);
        } catch (Exception $ex) {
            handleException($ex);
        }
    }


    public function getTechnicianDetailsByUserId(int $idUsuario)
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;

            // Esta consulta es la clave. Une tecnico, tecnico_especialidad y especialidad.
            // Utiliza GROUP_CONCAT para obtener todas las especialidades en una sola columna,
            // separadas por '|||', que luego el frontend dividirá.
            $stmt = $conn->prepare("
                SELECT 
                    t.idTecnico, t.idDisponibilidad, t.cargaTrabajo, t.estado,
                    GROUP_CONCAT(e.nombre SEPARATOR '|||') as especialidades_nombres
                FROM 
                    tecnico t
                LEFT JOIN 
                    tecnico_especialidad te ON t.idTecnico = te.idTecnico
                LEFT JOIN 
                    especialidad e ON te.idEspecialidad = e.idEspecialidad
                WHERE 
                    t.idUsuario = ?
                GROUP BY
                    t.idTecnico, t.idDisponibilidad, t.cargaTrabajo, t.estado
            ");
            
            // Asumo que tu base de datos usa 'i' para int
            $stmt->bind_param("i", $idUsuario);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                $stmt->close();
                return null;
            }

            $technicianData = $result->fetch_assoc();
            $stmt->close();
            
            // Convertir la cadena de especialidades en un array antes de devolver
            $technicianData['especialidades'] = $technicianData['especialidades_nombres'] 
                ? explode('|||', $technicianData['especialidades_nombres']) 
                : [];
                
            unset($technicianData['especialidades_nombres']); // Limpiamos la columna temporal

            return $technicianData;

        } catch (Exception $ex) {
            // Logear el error o lanzar una excepción personalizada
            error_log("Error en getTechnicianDetailsByUserId: " . $ex->getMessage());
            throw new Exception("Error al obtener detalles del técnico por ID de usuario.");
        } finally {
             // Es buena práctica cerrar la conexión si no se maneja centralmente
             if (isset($conn)) {
                 $conn->close();
             }
        }
    }

    /**
     * Crea un nuevo registro de técnico a partir de un usuario existente.
     * Realiza las siguientes acciones en una transacción:
     * 1. Actualiza el idRol del usuario a 'Técnico' (ID 2).
     * 2. Inserta un nuevo registro en la tabla 'tecnico'.
     * 3. Asocia las especialidades al nuevo técnico.
     *
     * @param int $idUsuario El ID del usuario a promover a técnico.
     * @param int $idDisponibilidad La disponibilidad inicial (por defecto 1: Disponible).
     * @param int $estado El estado del técnico (por defecto 1: Activo).
     * @param array $especialidades Array de IDs de especialidad (opcional).
     * @return int El ID del técnico (idTecnico) recién creado.
     */
    public function createTechnician(int $idUsuario, int $idDisponibilidad = 1, int $estado = 1, array $especialidades = [])
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;
            
            // ID del Rol 'Técnico' (2) y Carga Inicial
            $idRolTecnico = 2;
            $cargaTrabajoInicial = '00:00:00'; // Inicialmente 0 horas de carga

          
            $conn->begin_transaction();

            // 1. Actualizar el Rol del Usuario a Técnico (idRol = 2)
            $stmtUser = $conn->prepare("UPDATE usuario SET idRol = ? WHERE idUsuario = ?");
            $stmtUser->bind_param("ii", $idRolTecnico, $idUsuario);
            $stmtUser->execute();
            $stmtUser->close();

            // 2. Insertar el registro en la tabla 'tecnico'
            // El idTecnico es idUsuario
            $stmtTech = $conn->prepare("INSERT INTO tecnico (idTecnico, idUsuario, idDisponibilidad, cargaTrabajo, estado) VALUES (?, ?, ?, ?, ?)");
            $stmtTech->bind_param("iissi", $idUsuario, $idUsuario, $idDisponibilidad, $cargaTrabajoInicial, $estado);
            $stmtTech->execute();
            $idTecnico = $idUsuario; // Ya que idTecnico = idUsuario
            $stmtTech->close();

            // 3. Insertar especialidades asociadas (Manejo de la tabla de unión)
            if (!empty($especialidades)) {
                $stmtEsp = $conn->prepare("INSERT INTO tecnico_especialidad (idTecnico, idEspecialidad) VALUES (?, ?)");
                foreach ($especialidades as $idEspecialidad) {
                    $stmtEsp->bind_param("ii", $idTecnico, $idEspecialidad);
                    $stmtEsp->execute();
                }
                $stmtEsp->close();
            }

            // Confirmar transacción
            $conn->commit();
            $conn->close();

            return $idTecnico;
        } 
        catch (Exception $ex) {
            if (isset($conn)) {
                $conn->rollback();
                $conn->close();
            }
            handleException($ex);
            // Lanzar la excepción de nuevo para que el controlador la maneje (e.g., devuelva un 500)
            throw $ex; 
        }
    }

    /**
     * Actualiza la información de un técnico existente y sus especialidades.
     * Realiza las siguientes acciones en una transacción:
     * 1. Actualiza los campos de la tabla 'tecnico'.
     * 2. Elimina todas las especialidades anteriores.
     * 3. Inserta las nuevas especialidades.
     *
     * @param int $idTecnico El ID del técnico a actualizar.
     * @param int $idDisponibilidad El nuevo ID de disponibilidad.
     * @param string $cargaTrabajo La nueva carga de trabajo (formato 'HH:MM:SS').
     * @param int $estado El nuevo estado del técnico.
     * @param array $especialidades Array de IDs de especialidad.
     * @return bool True si la actualización fue exitosa.
     */
    public function updateTechnician(int $idTecnico, int $idDisponibilidad, string $cargaTrabajo, int $estado, array $especialidades = [])
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;
            
            // Iniciar transacción
            $conn->begin_transaction();

            // 1. Actualizar la tabla 'tecnico'
            $stmtTech = $conn->prepare("UPDATE tecnico SET idDisponibilidad = ?, cargaTrabajo = ?, estado = ? WHERE idTecnico = ?");
            $stmtTech->bind_param("isii", $idDisponibilidad, $cargaTrabajo, $estado, $idTecnico);
            $stmtTech->execute();
            $stmtTech->close();

            // 2. Eliminar especialidades anteriores
            $stmtDelEsp = $conn->prepare("DELETE FROM tecnico_especialidad WHERE idTecnico = ?");
            $stmtDelEsp->bind_param("i", $idTecnico);
            $stmtDelEsp->execute();
            $stmtDelEsp->close();

            // 3. Insertar nuevas especialidades
            if (!empty($especialidades)) {
                $stmtEsp = $conn->prepare("INSERT INTO tecnico_especialidad (idTecnico, idEspecialidad) VALUES (?, ?)");
                foreach ($especialidades as $idEspecialidad) {
                    $stmtEsp->bind_param("ii", $idTecnico, $idEspecialidad);
                    $stmtEsp->execute();
                }
                $stmtEsp->close();
            }

            // Confirmar transacción
            $conn->commit();
            $conn->close();

            return true;
        } 
        catch (Exception $ex) {
            if (isset($conn)) {
                $conn->rollback();
                $conn->close();
            }
            handleException($ex);
            throw $ex;
        }
    }

    /**
     * Despromueve un técnico (DELETE Lógico).
     * Realiza las siguientes acciones en una transacción:
     * 1. Elimina las especialidades del técnico.
     * 2. Establece el 'estado' del registro en 'tecnico' a 0 (Inactivo).
     * 3. Cambia el 'idRol' en la tabla 'usuario' de vuelta a 1 (Cliente/Usuario Estándar).
     *
     * @param int $idTecnico El ID del técnico a despromover.
     * @return bool True si la despromoción fue exitosa.
     */
    public function deleteTechnician(int $idTecnico)
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;
            
            $idRolCliente = 1; // ID del Rol 'Cliente' o 'Usuario Estándar'
            $estadoInactivo = 0;

            
            $conn->begin_transaction();

            // 1. Eliminar especialidades asociadas (Limpieza)
            $stmtDelEsp = $conn->prepare("DELETE FROM tecnico_especialidad WHERE idTecnico = ?");
            $stmtDelEsp->bind_param("i", $idTecnico);
            $stmtDelEsp->execute();
            $stmtDelEsp->close();

            // 2. Desactivar el registro en la tabla 'tecnico'
            $stmtTech = $conn->prepare("UPDATE tecnico SET estado = ? WHERE idTecnico = ?");
            $stmtTech->bind_param("ii", $estadoInactivo, $idTecnico);
            $stmtTech->execute();
            // Verificar si se afectó alguna fila para saber si el técnico existía
            $rowsAffected = $stmtTech->affected_rows; 
            $stmtTech->close();

            // Si no se encontró el técnico, deshacer y retornar falso
            if ($rowsAffected === 0) {
                $conn->rollback();
                $conn->close();
                return false;
            }

            // 3. Actualizar el Rol del Usuario a Cliente (idRol = 1)
            // Ya que idTecnico = idUsuario
            $stmtUser = $conn->prepare("UPDATE usuario SET idRol = ? WHERE idUsuario = ?");
            $stmtUser->bind_param("ii", $idRolCliente, $idTecnico); 
            $stmtUser->execute();
            $stmtUser->close();

            // Confirmar transacción
            $conn->commit();
            $conn->close();

            return true;
        } 
        catch (Exception $ex) {
            if (isset($conn)) {
                $conn->rollback();
                $conn->close();
            }
            handleException($ex);
            throw $ex;
        }
    }

}
