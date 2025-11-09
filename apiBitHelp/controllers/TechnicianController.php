<?php
// Sustituye categorie por technician
class technician
{
    public function index()
    {
        try { 
            // Asume que la clase Response y la función handleException están definidas.
            $response = new Response();
            $technicianModel = new TechnicianModel(); // Usa el nuevo modelo

            // Obtiene los técnicos y los devuelve en una estructura JSON como respuesta.
            $technicians = $technicianModel->getAllTechnicians();
            $response->toJson($technicians);            
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }

    public function get($id)
    {
        try {
            $response = new Response();        
            $technicianModel = new TechnicianModel(); 

            $technician = $technicianModel->getTechnicianById($id);
            
            if ($technician) {
                $response->toJson($technician);
            } else {
                $json = array(
                    'status' => 404,
                    'result' => 'Técnico no encontrado'
                );
                echo json_encode($json);
                http_response_code(404);
            }
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }

    

    /**
     * Promueve un usuario a técnico (POST /technicians).
     * Se espera recibir idUsuario y un array de especialidades.
     */
    public function create()
    {
        try {
            $response = new Response();
            $data = json_decode(file_get_contents('php://input'), true);

            // Validar datos mínimos requeridos
            if (!isset($data['idUsuario']) || !is_numeric($data['idUsuario'])) {
                $response->error(400, 'El idUsuario es requerido.');
                return;
            }

            $idUsuario = (int)$data['idUsuario'];
            $especialidades = $data['especialidades'] ?? [];

            $technicianModel = new TechnicianModel();
            // Llama al método del modelo. El modelo maneja la doble inserción (Usuario+Tecnico).
            $idTecnico = $technicianModel->createTechnician(
                $idUsuario, 
                $data['idDisponibilidad'] ?? 1, // Por defecto 'Disponible'
                $data['estado'] ?? 1,          // Por defecto 'Activo'
                $especialidades
            );
            
            $response->toJson([
                'status' => 201, 
                'result' => 'Técnico creado con éxito.',
                'idTecnico' => $idTecnico
            ], 201); // 201 Created

        } catch (Exception $ex) {
            // handleException lo maneja y lanza un 500
            handleException($ex);
        }
    }

    /**
     * Actualiza la información específica del técnico (PUT /technicians/{id}).
     */
    public function update($id)
    {
        try {
            $response = new Response();
            $data = json_decode(file_get_contents('php://input'), true);

            // Validar datos requeridos para la tabla 'tecnico'
            if (!isset($data['idDisponibilidad']) || !isset($data['cargaTrabajo']) || !isset($data['estado'])) {
                $response->error(400, 'Faltan campos de actualización (idDisponibilidad, cargaTrabajo, estado).');
                return;
            }

            $technicianModel = new TechnicianModel();
            $especialidades = $data['especialidades'] ?? [];

            $isUpdated = $technicianModel->updateTechnician(
                (int)$id,
                (int)$data['idDisponibilidad'],
                $data['cargaTrabajo'],
                (int)$data['estado'],
                $especialidades
            );
            
            if ($isUpdated) {
                $response->toJson([
                    'status' => 200, 
                    'result' => 'Técnico actualizado con éxito.'
                ]);
            } else {
                 // Si la fila no se afectó (ID no existe)
                 $response->error(404, 'Técnico no encontrado o sin cambios que aplicar.');
            }

        } catch (Exception $ex) {
            handleException($ex);
        }
    }

    /**
     * Desactiva/Despromueve a un técnico (DELETE /technicians/{id}).
     * Cambia su rol en 'usuario' a Cliente y desactiva el registro en 'tecnico'.
     *
     * @param int $id El ID del técnico a despromover.
     */
    public function delete($id)
    {
        try {
            $response = new Response();
            $technicianModel = new TechnicianModel();
            $idTecnico = (int)$id;

            $isDeleted = $technicianModel->deleteTechnician($idTecnico);
            
            if ($isDeleted) {
                $response->toJson([
                    'status' => 200, 
                    'result' => "Técnico $idTecnico despromovido a usuario estándar con éxito."
                ]);
            } else {
                // Si el modelo devuelve false porque el ID no existe
                $response->error(404, 'Técnico no encontrado para despromover.');
            }

        } catch (Exception $ex) {
            handleException($ex);
        }
    }

}