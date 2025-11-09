<?php
class CategorieModel
{
    public $connection;

    public function __construct()
    {
        $this->connection = new MySqlConnect();
    }

    public function getAllCategories()
    {
        try {
            $query = "
            SELECT 
                c.idCategoria,
                c.nombre AS nombreCategoria,
                c.estado AS estadoCategoria,
                c.idSla,
                s.tiempoMaxRespuesta,
                s.tiempoMaxResolucion,
                GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR '|||') AS especialidades_concatenadas,
                GROUP_CONCAT(DISTINCT et.nombre ORDER BY et.nombre SEPARATOR '|||') AS etiquetas_concatenadas
            FROM
                categoria c
            INNER JOIN 
                sla s ON c.idSla = s.idSla
            LEFT JOIN
                categoria_especialidad ce ON c.idCategoria = ce.idCategoria
            LEFT JOIN
                especialidad e ON ce.idEspecialidad = e.idEspecialidad
            LEFT JOIN
                etiqueta_categoria ec ON c.idCategoria = ec.idCategoria
            LEFT JOIN
                etiqueta et ON ec.idEtiqueta = et.idEtiqueta
            GROUP BY
                c.idCategoria, c.nombre, c.estado, c.idSla, s.tiempoMaxRespuesta, s.tiempoMaxResolucion
            ORDER BY
                c.idCategoria;
            ";

            $categorie = $this->connection->ExecuteSQL($query);
            return $categorie;
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    //Obtiene la categoría de un tiquete a partir de la especialidad del mismo.
    public function getBySpecialty($idSpecialty)
    {
        try {
            $query = "
            SELECT c.idCategoria, c.nombre
            FROM categoria c
            INNER JOIN categoria_especialidad ce ON c.idCategoria = ce.idCategoria
            INNER JOIN especialidad e ON ce.idEspecialidad = e.idEspecialidad
            WHERE e.idEspecialidad = $idSpecialty
            ";

            $categorie = $this->connection->executeSQL($query);
            return $categorie;
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    // Obtiene una categoría específica por ID con todos sus detalles
    public function getById($idCategoria)
    {
        try {
            $query = "
            SELECT 
                c.idCategoria,
                c.nombre AS nombreCategoria,
                c.estado AS estadoCategoria,
                c.idSla,
                s.tiempoMaxRespuesta,
                s.tiempoMaxResolucion,
                GROUP_CONCAT(DISTINCT e.idEspecialidad ORDER BY e.idEspecialidad SEPARATOR ',') AS especialidades_ids,
                GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR '|||') AS especialidades_concatenadas,
                GROUP_CONCAT(DISTINCT et.idEtiqueta ORDER BY et.idEtiqueta SEPARATOR ',') AS etiquetas_ids,
                GROUP_CONCAT(DISTINCT et.nombre ORDER BY et.nombre SEPARATOR '|||') AS etiquetas_concatenadas
            FROM
                categoria c
            INNER JOIN 
                sla s ON c.idSla = s.idSla
            LEFT JOIN
                categoria_especialidad ce ON c.idCategoria = ce.idCategoria
            LEFT JOIN
                especialidad e ON ce.idEspecialidad = e.idEspecialidad
            LEFT JOIN
                etiqueta_categoria ec ON c.idCategoria = ec.idCategoria
            LEFT JOIN
                etiqueta et ON ec.idEtiqueta = et.idEtiqueta
            WHERE
                c.idCategoria = $idCategoria
            GROUP BY
                c.idCategoria, c.nombre, c.estado, c.idSla, s.tiempoMaxRespuesta, s.tiempoMaxResolucion
            ";

            $result = $this->connection->executeSQL($query);
            return $result ? $result[0] : null;
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    // Obtiene todas las especialidades disponibles
    public function getAllSpecialties()
    {
        try {
            $query = "SELECT idEspecialidad, nombre, estado FROM especialidad WHERE estado = '1' ORDER BY nombre";
            return $this->connection->executeSQL($query);
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    // Obtiene todas las etiquetas disponibles
    public function getAllTags()
    {
        try {
            $query = "SELECT idEtiqueta, nombre, estado FROM etiqueta WHERE estado = 1 ORDER BY nombre";
            return $this->connection->executeSQL($query);
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    // Obtiene todos los SLAs disponibles
    public function getAllSlas()
    {
        try {
            $query = "SELECT idSla, tiempoMaxRespuesta, tiempoMaxResolucion, estado FROM sla WHERE estado = 1 ORDER BY idSla";
            return $this->connection->executeSQL($query);
        } 
        catch (Exception $ex) {
            handleException($ex);
        }
    }

    // Crea una nueva categoría
    public function create($nombre, $idSla, $estado, $especialidades, $etiquetas)
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;
            
            // Iniciar transacción
            $conn->begin_transaction();

            // Insertar la categoría
            $stmt = $conn->prepare("INSERT INTO categoria (nombre, idSla, estado) VALUES (?, ?, ?)");
            $stmt->bind_param("sii", $nombre, $idSla, $estado);
            $stmt->execute();
            
            $idCategoria = $conn->insert_id;
            $stmt->close();

            // Insertar especialidades asociadas
            if (!empty($especialidades)) {
                $stmtEsp = $conn->prepare("INSERT INTO categoria_especialidad (idCategoria, idEspecialidad) VALUES (?, ?)");
                foreach ($especialidades as $idEspecialidad) {
                    $stmtEsp->bind_param("ii", $idCategoria, $idEspecialidad);
                    $stmtEsp->execute();
                }
                $stmtEsp->close();
            }

            // Insertar etiquetas asociadas
            if (!empty($etiquetas)) {
                $stmtEti = $conn->prepare("INSERT INTO etiqueta_categoria (idEtiqueta, idCategoria) VALUES (?, ?)");
                foreach ($etiquetas as $idEtiqueta) {
                    $stmtEti->bind_param("ii", $idEtiqueta, $idCategoria);
                    $stmtEti->execute();
                }
                $stmtEti->close();
            }

            // Confirmar transacción
            $conn->commit();
            $conn->close();

            return $idCategoria;
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

    // Actualiza una categoría existente
    public function update($idCategoria, $nombre, $idSla, $estado, $especialidades, $etiquetas)
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;
            
            // Iniciar transacción
            $conn->begin_transaction();

            // Actualizar la categoría
            $stmt = $conn->prepare("UPDATE categoria SET nombre = ?, idSla = ?, estado = ? WHERE idCategoria = ?");
            $stmt->bind_param("siii", $nombre, $idSla, $estado, $idCategoria);
            $stmt->execute();
            $stmt->close();

            // Eliminar especialidades anteriores
            $stmtDelEsp = $conn->prepare("DELETE FROM categoria_especialidad WHERE idCategoria = ?");
            $stmtDelEsp->bind_param("i", $idCategoria);
            $stmtDelEsp->execute();
            $stmtDelEsp->close();

            // Insertar nuevas especialidades
            if (!empty($especialidades)) {
                $stmtEsp = $conn->prepare("INSERT INTO categoria_especialidad (idCategoria, idEspecialidad) VALUES (?, ?)");
                foreach ($especialidades as $idEspecialidad) {
                    $stmtEsp->bind_param("ii", $idCategoria, $idEspecialidad);
                    $stmtEsp->execute();
                }
                $stmtEsp->close();
            }

            // Eliminar etiquetas anteriores
            $stmtDelEti = $conn->prepare("DELETE FROM etiqueta_categoria WHERE idCategoria = ?");
            $stmtDelEti->bind_param("i", $idCategoria);
            $stmtDelEti->execute();
            $stmtDelEti->close();

            // Insertar nuevas etiquetas
            if (!empty($etiquetas)) {
                $stmtEti = $conn->prepare("INSERT INTO etiqueta_categoria (idEtiqueta, idCategoria) VALUES (?, ?)");
                foreach ($etiquetas as $idEtiqueta) {
                    $stmtEti->bind_param("ii", $idEtiqueta, $idCategoria);
                    $stmtEti->execute();
                }
                $stmtEti->close();
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

    // Elimina una categoría y sus relaciones
    public function delete($idCategoria)
    {
        try {
            $this->connection->connect();
            $conn = $this->connection->link;
            
            // Iniciar transacción
            $conn->begin_transaction();

            // Eliminar especialidades asociadas
            $stmtDelEsp = $conn->prepare("DELETE FROM categoria_especialidad WHERE idCategoria = ?");
            $stmtDelEsp->bind_param("i", $idCategoria);
            $stmtDelEsp->execute();
            $stmtDelEsp->close();

            // Eliminar etiquetas asociadas
            $stmtDelEti = $conn->prepare("DELETE FROM etiqueta_categoria WHERE idCategoria = ?");
            $stmtDelEti->bind_param("i", $idCategoria);
            $stmtDelEti->execute();
            $stmtDelEti->close();

            // Eliminar la categoría
            $stmt = $conn->prepare("DELETE FROM categoria WHERE idCategoria = ?");
            $stmt->bind_param("i", $idCategoria);
            $stmt->execute();
            $affectedRows = $stmt->affected_rows;
            $stmt->close();

            // Confirmar transacción
            $conn->commit();
            $conn->close();

            return $affectedRows > 0;
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