import React, { useState ,useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography } from '@mui/material';
import CategorieService from '../../services/CategorieService';

export const CategoriesDataGridWithModal = () => {
  /*
  Ejemplo data quemada
  const [rows, setRows] = useState([
    { id: 1, firstName: 'Jon', lastName: 'Doe', age: 35, email: 'jon.doe@example.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', age: 42, email: 'jane.smith@example.com' },
    // ... more data
  ]);
  */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false); // Estado para manejar la carga

  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                // Realiza la llamada GET al endpoint de categorías
                const response = await CategorieService.getAllCategories();        

                let apiData = response.data;

                if (apiData && apiData.result && Array.isArray(apiData.result)) {
                  apiData = apiData.result; 
                }
                // 2. Si es un objeto vacío o no es un array después de la verificación, 
                //    forzarlo a un array vacío para evitar el error.
                if (!Array.isArray(apiData)) {
                    console.error("La respuesta de la API no es un array:", apiData);
                    apiData = []; 
                }
                // Mapear los datos si es necesario para asegurar la propiedad 'id'
                const categoriesData = apiData.map(item => ({
                    id: item.idCategoria || item.id, 
                    nombre: item.nombre,
                    estado: item.estado,
                    
                }));

                setRows(categoriesData);
            } catch (error) {
                console.error("Error al obtener las categorías:", error);
                // Opcional: mostrar un mensaje de error al usuario
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []); // El array vacío [] asegura que solo se ejecute al montar el componente

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
    { field: 'nombre', headerName: 'Categoria', width: 150 },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 110,
      // Formatea el valor (1/0) a texto (Activo/Inactivo)
      valueFormatter: (params) => params === "1" ? 'Activo' : 'Inactivo'
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
                <Typography variant="h6">Cargando categorías...</Typography>
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
                        Detalles de la Categoría
                    </Typography>
                    {selectedRow && (
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            ID: {selectedRow.id}<br />
                            Nombre: {selectedRow.nombre}<br /> 
                            ID SLA: {selectedRow.idSla}<br />
                            Estado: {selectedRow.estado === 1 ? 'Activo' : 'Inactivo'}
                        </Typography>
                    )}
                    <Button onClick={handleCloseModal} sx={{ mt: 2 }}>Cerrar</Button>
                </Box>
            </Modal>
        </div>
    );
};

