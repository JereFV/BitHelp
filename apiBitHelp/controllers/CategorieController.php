<?php
class categorie
{
    public function index()
    {
        try { 
            $response = new Response();
            $categorieModel = new categorieModel();

            //Obtiene las categorías y los devuelve en una estructura JSON como respuesta.
            $categorie = $categorieModel->getAllCategories();
            $response->toJson($categorie);           
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }

    // Obtiene una categoría específica por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $categorieModel = new categorieModel();

            $categorie = $categorieModel->getById($id);
            
            if ($categorie) {
                $response->toJson($categorie);
            } else {
                $json = array(
                    'status' => 404,
                    'result' => 'Categoría no encontrada'
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

    // Obtiene todas las especialidades disponibles
    public function getSpecialties()
    {
        try {
            $response = new Response();
            $categorieModel = new categorieModel();

            $specialties = $categorieModel->getAllSpecialties();
            $response->toJson($specialties);
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }

    // Obtiene todas las etiquetas disponibles
    public function getTags()
    {
        try {
            $response = new Response();
            $categorieModel = new categorieModel();

            $tags = $categorieModel->getAllTags();
            $response->toJson($tags);
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }

    // Obtiene todos los SLAs disponibles
    public function getSlas()
    {
        try {
            $response = new Response();
            $categorieModel = new categorieModel();

            $slas = $categorieModel->getAllSlas();
            $response->toJson($slas);
        }
        catch (Exception $ex)
        {
            handleException($ex);
        }
    }

    // Crea una nueva categoría
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $categorieModel = new categorieModel();

            // Obtener datos del request
            $data = $request->getJSON();

            // Validaciones
            if (empty($data->nombre)) {
                $json = array(
                    'status' => 400,
                    'result' => 'El nombre de la categoría es requerido'
                );
                echo json_encode($json);
                http_response_code(400);
                return;
            }

            if (empty($data->idSla)) {
                $json = array(
                    'status' => 400,
                    'result' => 'El SLA es requerido'
                );
                echo json_encode($json);
                http_response_code(400);
                return;
            }

            // Valores por defecto
            $nombre = $data->nombre;
            $idSla = $data->idSla;
            $estado = isset($data->estado) ? $data->estado : 1;
            $especialidades = isset($data->especialidades) ? $data->especialidades : [];
            $etiquetas = isset($data->etiquetas) ? $data->etiquetas : [];

            // Crear categoría
            $idCategoria = $categorieModel->create($nombre, $idSla, $estado, $especialidades, $etiquetas);

            if ($idCategoria) {
                $json = array(
                    'status' => 201,
                    'result' => 'Categoría creada exitosamente',
                    'idCategoria' => $idCategoria
                );
                echo json_encode($json);
                http_response_code(201);
            } else {
                $json = array(
                    'status' => 500,
                    'result' => 'Error al crear la categoría'
                );
                echo json_encode($json);
                http_response_code(500);
            }
        }
        catch (Exception $ex)
        {
            $json = array(
                'status' => 500,
                'result' => 'Error: ' . $ex->getMessage()
            );
            echo json_encode($json);
            http_response_code(500);
            handleException($ex);
        }
    }

    // Actualiza una categoría existente
    public function update($id)
    {
        try {
            $request = new Request();
            $response = new Response();
            $categorieModel = new categorieModel();

            // Obtener datos del request
            $data = $request->getJSON();

            // Validaciones
            if (empty($data->nombre)) {
                $json = array(
                    'status' => 400,
                    'result' => 'El nombre de la categoría es requerido'
                );
                echo json_encode($json);
                http_response_code(400);
                return;
            }

            if (empty($data->idSla)) {
                $json = array(
                    'status' => 400,
                    'result' => 'El SLA es requerido'
                );
                echo json_encode($json);
                http_response_code(400);
                return;
            }

            // Valores
            $nombre = $data->nombre;
            $idSla = $data->idSla;
            $estado = isset($data->estado) ? $data->estado : 1;
            $especialidades = isset($data->especialidades) ? $data->especialidades : [];
            $etiquetas = isset($data->etiquetas) ? $data->etiquetas : [];

            // Actualizar categoría
            $result = $categorieModel->update($id, $nombre, $idSla, $estado, $especialidades, $etiquetas);

            if ($result) {
                $json = array(
                    'status' => 200,
                    'result' => 'Categoría actualizada exitosamente'
                );
                echo json_encode($json);
                http_response_code(200);
            } else {
                $json = array(
                    'status' => 500,
                    'result' => 'Error al actualizar la categoría'
                );
                echo json_encode($json);
                http_response_code(500);
            }
        }
        catch (Exception $ex)
        {
            $json = array(
                'status' => 500,
                'result' => 'Error: ' . $ex->getMessage()
            );
            echo json_encode($json);
            http_response_code(500);
            handleException($ex);
        }
    }

    // Elimina una categoría
    public function delete($id)
    {
        try {
            $response = new Response();
            $categorieModel = new categorieModel();

            $result = $categorieModel->delete($id);

            if ($result) {
                $json = array(
                    'status' => 200,
                    'result' => 'Categoría eliminada exitosamente'
                );
                echo json_encode($json);
                http_response_code(200);
            } else {
                $json = array(
                    'status' => 404,
                    'result' => 'Categoría no encontrada o no se pudo eliminar'
                );
                echo json_encode($json);
                http_response_code(404);
            }
        }
        catch (Exception $ex)
        {
            $json = array(
                'status' => 500,
                'result' => 'Error: ' . $ex->getMessage()
            );
            echo json_encode($json);
            http_response_code(500);
            handleException($ex);
        }
    }
}