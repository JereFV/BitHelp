import React, { useState ,useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography,Stack } from '@mui/material';
import CategorieService from '../../services/CategorieService';
import { esES } from '@mui/x-data-grid/locales';

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
                    idSla: item.idSla,
                    tiempoMaxRespuesta: item.tiempoMaxRespuesta,
                    tiempoMaxResolucion: item.tiempoMaxResolucion,
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
    { field: 'id', headerName: 'ID', maxWidth: 90, flex:0.3,headerAlign: 'center',align: 'center' },
    { field: 'nombre', headerName: 'Categoria', minWidth: 300 ,flex:0.8 , maxWidth: 650, headerAlign: 'center',align: 'center'},
    { 
      field: 'estado', 
      headerName: 'Estado', 
      minWidth:90,
      flex:0.6,
      maxWidth: 180,
      headerAlign: 'center',
      align: 'center',
      // Formatea el valor (1/0) a texto (Activo/Inactivo)
      valueFormatter: (params) => params === "1" ? 'Activo' : 'Inactivo'      
    },
    {
      field: 'actions',
      headerName: 'Opciones',
      maxWidth: 250,    
      minWidth: 170,  
      flex:1,
      headerAlign: 'center',
      align: 'center',      
      renderCell: (params) => (
        <Button  variant="outlined"  size="medium" onClick={() => handleOpenModal(params.row)}>
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
        <div style={{ height: 400, width: '100%' }}>
            {loading ? (
                <Typography variant="h6" fontFamily={'-apple-system'}>Cargando categorías...</Typography>
            ) : (
                <DataGrid
                    rows={rows}                    
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    sx={{
                      borderRadius: 4,
                      boxShadow: 1,                      
                    }}
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
                    maxWidth: '90%',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 16,
                    p: 4,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" fontFamily={'-apple-system'}>
                        Detalles de la Categoría
                    </Typography>
                    {selectedRow && (
                          <Stack spacing={1} sx={{ mt: 2 }}>
                                <Typography fontSize={16}>
                                  <Typography component="span" fontWeight="bold">ID:</Typography> {selectedRow.id}
                                </Typography>
                              
                                <Typography fontSize={16}>
                                    <Typography component="span" fontWeight="bold">Nombre:</Typography> {selectedRow.nombre}
                                </Typography>

                                <Typography fontSize={16}>
                                  <Typography component="span" fontWeight="bold">Tiempo max de respuesta: </Typography>{selectedRow.tiempoMaxRespuesta}                                 
                                </Typography>

                                <Typography fontSize={16}>
                                   <Typography component="span" fontWeight="bold">Tiempo max de resolución: </Typography>{selectedRow.tiempoMaxResolucion}                                     
                                </Typography>

                                <Typography fontSize={16}>
                                    <Typography component="span" fontWeight="bold">ID SLA:</Typography> {selectedRow.idSla}
                                </Typography>
                              
                                <Typography fontSize={16}>
                                  <Typography component="span" fontWeight="bold">Estado:</Typography> 
                                  <Typography 
                                      component="span" 
                                      fontWeight="bold"
                                      color={selectedRow.estado === '1' ? 'success.main' : 'error.main'}
                                  >
                                      {selectedRow.estado === '1' ? 'Activo' : 'Inactivo'}
                                  </Typography>
                                </Typography>
                          </Stack>
                      )
                    }
                    <Button  variant="outlined" onClick={handleCloseModal} sx={{ mt: 3 }}> 
                      <Typography  fontFamily={'-apple-system'} fontSize={15}>
                        Cerrar
                       </Typography>
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

