<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}

	private function limpiarCadena($string) {
		// 1. Convertir a minúsculas
		$string = strtolower($string);
		
		// 2. Reemplazar caracteres especiales y acentos
		$reemplazos = [
			'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u',
			'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ü' => 'U',
			'ñ' => 'n', 'Ñ' => 'N',
			' ' => '', // Quitar espacios en blanco
			'-' => '', // Quitar guiones
		];
		
		$string = strtr($string, $reemplazos);
		
		// 3. Opcional: Quitar cualquier carácter que no sea letra o número.
		// Solo para asegurar un nombre de usuario limpio (ej. quita comas, puntos, etc.)
		$string = preg_replace('/[^a-z0-9]/', '', $string);

		return $string;
	}

	/**
 * Verifica si un correo ya existe en la base de datos
 * @param string $correo El correo a verificar
 * @param int|null $idUsuario ID del usuario a excluir (para updates)
 * @return bool true si el correo ya existe
 */
private function correoExists($correo, $idUsuario = null) {
    $sql = "SELECT COUNT(*) AS count FROM usuario WHERE correo = '$correo'";
    
    if ($idUsuario !== null) {
        $sql .= " AND idUsuario != $idUsuario";
    }
    
    $resultado = $this->enlace->ExecuteSQL($sql);
    return $resultado[0]->count > 0;
}

/**
 * Valida que la contraseña cumpla con requisitos de complejidad
 * Nivel medio: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
 * @param string $password La contraseña a validar
 * @throws Exception Si no cumple los requisitos
 */
private function validatePasswordComplexity($password) {
    if (strlen($password) < 8) {
        throw new Exception("La contraseña debe tener al menos 8 caracteres.");
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        throw new Exception("La contraseña debe contener al menos una letra mayúscula.");
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        throw new Exception("La contraseña debe contener al menos una letra minúscula.");
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        throw new Exception("La contraseña debe contener al menos un número.");
    }
}
	
	public function all()
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM usuario;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
		}
	}

	// Método para obtener un usuario por ID (usado después de crear o actualizar)
    public function get($id)
    {
        try {
            // Usar idUsuario para buscar
            $vSql = "SELECT * FROM usuario where idUsuario = $id"; 
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            
            return $vResultado ? $vResultado[0] : null;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

	public function getAllUsers()
	{
		try {
			$query = "
				SELECT 
					u.idUsuario,
					u.usuario,
					u.nombre,
					u.primerApellido,
					u.segundoApellido,
					CONCAT_WS(' ', u.nombre, u.primerApellido, u.segundoApellido) AS nombreCompleto,
					u.correo,
					u.telefono,
					u.estado,
					u.idRol,
					r.nombre AS nombreRol
				FROM
					usuario u
				INNER JOIN 
					rol_usuario r ON u.idRol = r.idRolUsuario
				-- Puedes añadir un WHERE si solo quieres usuarios activos (u.estado = 1)
				ORDER BY
					u.idUsuario DESC
			";

			$result = $this->enlace->executeSQL($query);
			// Asumiendo que executeSQL devuelve un array de objetos/filas
			return $result; 
		} 
		catch (Exception $ex) {
			// Manejo de excepciones
			handleException($ex);
		}
	}
	/*
	public function customerbyShopRental($idShopRental)
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM bithelp.usuario
					where idRolUsuario=1 and shop_id=$idShopRental;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
		}
	} */
	public function login($objeto)
	{
		try {

			$vSql = "SELECT * from usuario where correo='$objeto->email'";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			if (is_object($vResultado[0])) {
				$user = $vResultado[0];
				if (password_verify($objeto->password, $user->password)) {
					$usuario = $this->get($user->id);
					if (!empty($usuario)) {
						// Datos para el token JWT
						$data = [
							'idUsuario' => $usuario->id,
							'correo' => $usuario->email,
							'rol' => $usuario->rol,
							'iat' => time(),  // Hora de emisión
							'exp' => time() + 3600 // Expiración en 1 hora
						];

						// Generar el token JWT
						$jwt_token = JWT::encode($data, config::get('SECRET_KEY'), 'HS256');

						// Enviar el token como respuesta
						return $jwt_token;
					}
				}
			} else {
				return false;
			}
		} catch (Exception $e) {
			handleException($e);
		}
	}


	/**
	 * Genera un nombre de usuario basado en la lógica: 
	 * inicialNombre + primerApellido, con sufijo de segundoApellido si se repite.
	 * @param string $nombre Nombre del usuario
	 * @param string $apellido1 Primer apellido
	 * @param string $apellido2 Segundo apellido (puede ser null)
	 * @return string Nombre de usuario único
	 */
	private function generateUniqueUsername($nombre, $apellido1, $apellido2) {
		// 1. Obtener inicial del nombre y limpiar acentos/espacios
		$inicial = strtolower(substr($this->limpiarCadena($nombre), 0, 1));
		$apellidouno = strtolower($this->limpiarCadena($apellido1));

		// 2. Construir el nombre base
		$baseUsername = $inicial . $apellidouno;
		$username = $baseUsername;
		$sufijo = "";

		// 3. Verificar si ya existe en la base de datos
		$counter = 0;
		do {
			// La primera vez, intenta por ejemplo'rherrera'
			// Si no está disponible, intenta 'rherrera.castillo', etc.
			$finalUsername = $username . $sufijo;
			
			$vSql = "SELECT COUNT(*) AS count FROM usuario WHERE usuario = '$finalUsername'";
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			$exists = $vResultado[0]->count > 0;

			if ($exists) {
				// Si el nombre de usuario ya existe:
				if (!empty($apellido2) && $counter == 0) {
					// Intenta la primera vez con el segundo apellido: jfuentes.venegas
					$apellidodos = strtolower($this->limpiarCadena($apellido2));
					$sufijo = "." . $apellidodos;
					$counter++; // Aseguramos que solo entre una vez
				} else {
					// Si el segundo apellido tampoco funciona, o no existe, añade un contador
					$counter++;
					$sufijo = $counter > 1 ? $counter : "";
					$username = $baseUsername; // Resetear el nombre base
				}
			}
		} while ($exists);

		return $finalUsername;
	}


	public function create($objeto)
	{
		try {
			// Validar correo único
			if ($this->correoExists($objeto->correo)) {
				throw new Exception("El correo electrónico ya está registrado en el sistema.");
			}
			
			// Validar y hashear contraseña
			if (isset($objeto->contrasenna) && !empty($objeto->contrasenna)) {
				$this->validatePasswordComplexity($objeto->contrasenna);
				$crypt = password_hash($objeto->contrasenna, PASSWORD_BCRYPT);
				$objeto->contrasenna = $crypt;
			} else {
				throw new Exception("La contraseña es obligatoria para crear un usuario.");
			}
			
			// Generar el nombre de usuario único
			$objeto->usuario = $this->generateUniqueUsername(
				$objeto->nombre, 
				$objeto->primerApellido, 
				$objeto->segundoApellido
			);
			
			// Consulta SQL
			$vSql = "INSERT INTO usuario (usuario, nombre, primerApellido, segundoApellido, correo, telefono, contrasenna, estado, idRol)
					VALUES (
						'$objeto->usuario', 
						'$objeto->nombre', 
						'$objeto->primerApellido', 
						'$objeto->segundoApellido', 
						'$objeto->correo', 
						'$objeto->telefono', 
						'$objeto->contrasenna', 
						1, 
						$objeto->idRol
					)";

			$vResultado = $this->enlace->executeSQL_DML_last($vSql);
			return $this->get($vResultado);
		} catch (Exception $e) {
			handleException($e);
		}
	}

	public function update($objeto)
	{
		try {
			// Validar correo único (excluyendo el propio usuario)
			if ($this->correoExists($objeto->correo, $objeto->idUsuario)) {
				throw new Exception("El correo electrónico ya está registrado por otro usuario.");
			}
			
			$telefono = (is_null($objeto->telefono) || $objeto->telefono === '') ? 'NULL' : "'" . $objeto->telefono . "'";
			$segundoApellido = (is_null($objeto->segundoApellido) || $objeto->segundoApellido === '') ? 'NULL' : "'" . $objeto->segundoApellido . "'";
			
			$vSql = "UPDATE usuario SET                         
						nombre = '$objeto->nombre', 
						primerApellido = '$objeto->primerApellido',
						segundoApellido = $segundoApellido,
						correo = '$objeto->correo', 
						telefono = $telefono,
						estado = $objeto->estado, 
						idRol = $objeto->idRol
					WHERE idUsuario = $objeto->idUsuario";

			$this->enlace->executeSQL_DML($vSql);
			return $this->get($objeto->idUsuario);
		} catch (Exception $e) {
			handleException($e);
		}
	}

	/**
     * Actualiza la contraseña hasheada de un usuario.
     * @param int $idUsuario El ID del usuario.
     * @param string $newPassword La nueva contraseña sin hashear.
     * @return object|null El objeto de usuario actualizado.
     * @throws Exception Si la contraseña es muy corta o la actualización falla en DB.
     */
    public function updatePassword($idUsuario, $newPassword)
	{
		try {
			if (empty($newPassword)) {
				throw new Exception("La nueva contraseña es requerida.");
			}
			
			// Validar complejidad
			$this->validatePasswordComplexity($newPassword);
			
			// Hashear la nueva contraseña
			$crypt = password_hash($newPassword, PASSWORD_BCRYPT);
			
			$vSql = "UPDATE usuario SET 
						contrasenna = '$crypt'
					WHERE idUsuario = $idUsuario";

			$result = $this->enlace->executeSQL_DML($vSql);
			
			if ($result === false) {
				throw new Exception("Error fatal al ejecutar la consulta de actualización de contraseña.");
			}
			if ($result < 1) {
				return null;
			}
			
			return $this->get($idUsuario);
			
		} catch (Exception $e) {
			throw $e; 
		}
	}



	
	public function delete($id)
    {
        try {
            // Usar idUsuario para eliminar
            $vSql = "DELETE FROM usuario WHERE idUsuario = $id";
            return $this->enlace->executeSQL_DML($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

/**
 * Obtener usuario por username o correo para login
 */
public function getUserByCredential($credential) {
    $sql = "SELECT idUsuario, usuario, nombre, primerApellido, segundoApellido, 
            correo, contrasenna, estado, idRol 
            FROM usuario 
            WHERE (usuario = '$credential' OR correo = '$credential') 
            AND estado = 1";
    
    $result = $this->enlace->executeSQL($sql);
    return $result ? $result[0] : null;
}
}
