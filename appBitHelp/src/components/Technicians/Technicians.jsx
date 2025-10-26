// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography } from '@mui/material';
// Importa el nuevo servicio
import TechnicianService from '../../services/TechnicianService'; 

export const TechniciansDataGridWithModal = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        const fetchTechnicians = async () => {
            setLoading(true);
            try {
                // Llama al servicio de técnicos
                const response = await TechnicianService.getAllTechnicians();

                let apiData = response.data;

                if (apiData && apiData.result && Array.isArray(apiData.result)) {
                    apiData = apiData.result;
                }

                if (!Array.isArray(apiData)) {
                    console.error("La respuesta de la API no es un array:", apiData);
                    apiData = [];
                }

                // Mapear los datos de técnicos
                // Asumimos que la API devuelve los campos combinados del técnico y el usuario.
                const techniciansData = apiData.map(item => ({
                    // Propiedades del técnico:
                    id: item.idTecnico || item.id, // Necesario para DataGrid
                    idUsuario: item.idUsuario,
                    idDisponibilidad: item.idDisponibilidad,
                    cargaTrabajo: item.cargaTrabajo,
                    // Propiedades combinadas del usuario asociado (asumiendo que vienen en la respuesta):
                    nombreCompleto: `${item.nombre} ${item.primerApellido}`,
                    correo: item.correo,
                    telefono: item.telefono,
                    // Estado se usa para DataGrid
                    estado: item.estado, 
                }));

                setRows(techniciansData);
            } catch (error) {
                console.error("Error al obtener los técnicos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTechnicians();
    }, []);

    const handleOpenModal = (row) => {
        setSelectedRow(row);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRow(null);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'nombreCompleto', headerName: 'Técnico', width: 200 },
        { field: 'correo', headerName: 'Correo', width: 250 },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 110,
            // Formatea 1/0 (tinyint) a texto (Activo/Inactivo)
            valueFormatter: (params) => params.value === 1 ? 'Activo' : 'Inactivo' 
        },
        {
            field: 'actions',
            headerName: 'Opciones',
            width: 150,
            renderCell: (params) => (
                <Button variant="outlined" size="small" onClick={() => handleOpenModal(params.row)}>
                    Ver Detalles
                </Button>
            ),
        },
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
            {loading ? (
                <Typography variant="h6">Cargando técnicos...</Typography>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                />
            )}

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Detalles del Técnico
                    </Typography>
                    {selectedRow && (
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            ID Técnico: {selectedRow.id}<br />
                            Nombre: {selectedRow.nombreCompleto}<br />
                            Correo: {selectedRow.correo}<br />
                            Teléfono: {selectedRow.telefono}<br />
                            Disponibilidad (ID): {selectedRow.idDisponibilidad}<br />
                            Carga de Trabajo: {selectedRow.cargaTrabajo}<br />
                            Estado: {selectedRow.estado === 1 ? 'Activo' : 'Inactivo'}
                        </Typography>
                    )}
                    <Button onClick={handleCloseModal} sx={{ mt: 2 }}>Cerrar</Button>
                </Box>
            </Modal>
        </div>
    );
};