<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
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

	public function allCustomer()
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM bithelp.usuario
					where idRol=1;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
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
	public function create($objeto)
    {
        try {
            if (isset($objeto->contrasenna) && !empty($objeto->contrasenna)) {
                $crypt = password_hash($objeto->contrasenna, PASSWORD_BCRYPT);
                $objeto->contrasenna = $crypt;
            } else {
                 throw new Exception("La contraseña es obligatoria para crear un usuario.");
            }
            
            // Consulta SQL usando los nombres de columna exactos de tu DB:
            $vSql = "INSERT INTO usuario (usuario, nombre, primer_apellido, segundo_apellido, correo, telefono, contrasenna, estado, idRol)
                     VALUES (
                        '$objeto->usuario', 
                        '$objeto->nombre', 
                        '$objeto->primer_apellido', 
                        '$objeto->segundo_apellido', 
                        '$objeto->correo', 
                        '$objeto->telefono', 
                        '$objeto->contrasenna', 
                        1,  -- Asume estado 1 (activo) por defecto
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
            $password_update = "";
            if (isset($objeto->contrasenna) && !empty($objeto->contrasenna)) {
                $crypt = password_hash($objeto->contrasenna, PASSWORD_BCRYPT);
                $password_update = ", contrasenna = '$crypt'";
            }
            
            // Consulta SQL usando los nombres de columna exactos de tu DB y idUsuario para WHERE:
            $vSql = "UPDATE usuario SET 
                        usuario = '$objeto->usuario',
                        nombre = '$objeto->nombre', 
                        primer_apellido = '$objeto->primer_apellido',
                        segundo_apellido = '$objeto->segundo_apellido',
                        correo = '$objeto->correo', 
                        telefono = '$objeto->telefono',
                        estado = $objeto->estado, 
                        idRol = $objeto->idRol
                        $password_update
                    WHERE idUsuario = $objeto->idUsuario";

            $this->enlace->executeSQL_DML($vSql);
            return $this->get($objeto->idUsuario);
        } catch (Exception $e) {
            handleException($e);
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
}
