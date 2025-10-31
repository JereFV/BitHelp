import React, { useState ,useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography,Stack, Chip,Divider, Paper} from '@mui/material';
import CategorieService from '../../services/CategorieService';
import { esES } from '@mui/x-data-grid/locales';




// Renderizar el Chip de estado para las categorías
const getStatusChip = (estado) => {
    // El estado viene como '1' o '0'
    const isActive = estado === '1' || estado === 1;
    return (
        <Chip
            label={isActive ? 'Activo' : 'Inactivo'}
            color={isActive ? 'success' : 'error'} // Verde para activo, rojo para inactivo
            variant="outlined"
            size="small"
        />
    );
};

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
                const categoriesData = apiData.map(item => {                    
                    // Función para convertir la cadena concatenada a un arreglo de strings
                    const parseConcatenatedData = (dataString) => {
                        if (!dataString) return [];
                        // Se usa '|||' como delimitador, y se filtran cadenas vacías
                        return dataString.split('|||').filter(s => s.trim() !== '');
                    };

                    return {
                        id: item.idCategoria || item.id, 
                        nombre: item.nombreCategoria,
                        estado: item.estadoCategoria,
                        idSla: item.idSla,
                        tiempoMaxRespuesta: item.tiempoMaxRespuesta,
                        tiempoMaxResolucion: item.tiempoMaxResolucion,                        
                        especialidades: parseConcatenatedData(item.especialidades_concatenadas),
                        etiquetas: parseConcatenatedData(item.etiquetas_concatenadas),
                    };
                });

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
      // Muestra el estado con un elemento "Chip" para que sea más estético
      renderCell: (params) => getStatusChip(params.value),        
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
            
            {/* Modal de Detalles de la Categoría (Adaptado del Técnico) */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="category-modal-title" // Cambiado el ID a Category
                aria-describedby="category-modal-description"
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
                    <Typography id="category-modal-title" variant="h5" component="h2" mb={1} color="text.primary" fontWeight={600}>
                        Detalles de la Categoría
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {selectedRow && (
                        <Box id="modal-modal-description">
                            
                            {/* ID y Nombre */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    INFORMACIÓN BÁSICA
                                </Typography>
                                
                                {/* Fila: ID */}
                                <Box display="flex" mb={1}>
                                    <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>ID:</Typography> 
                                    <Typography fontSize={16}>{selectedRow.id}</Typography>
                                </Box>

                                {/* Fila: Nombre */}
                                <Box display="flex" mb={1}>
                                    <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>Nombre:</Typography> 
                                    <Typography fontSize={16}>{selectedRow.nombre}</Typography>
                                </Box>
                                
                                {/* Fila: Estado */}
                                <Box display="flex" alignItems="center">
                                    <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>Estado:</Typography> 
                                    <Typography>
                                        {getStatusChip(selectedRow.estado)}
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* Tiempos de Respuesta/Resolución */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    MÉTRICAS DE SERVICIO
                                </Typography>
                                
                                {/* Fila: Tiempo Max de Respuesta */}
                                <Box display="flex" mb={1}>
                                    <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>T. Max. Respuesta:</Typography>
                                    <Typography fontSize={16}>{selectedRow.tiempoMaxRespuesta}</Typography>
                                </Box>
                                
                                {/* Fila: Tiempo Max de Resolución */}
                                <Box display="flex">
                                    <Typography component="span" fontWeight="bold" mr={0.5} fontSize={16}>T. Max. Resolución:</Typography>
                                    <Typography fontSize={16}>{selectedRow.tiempoMaxResolucion}</Typography>
                                </Box>
                            </Paper>
                            
                            {/* Especialidades y Etiquetas (Usando la estructura Stack/Chip) */}
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                                    ASIGNACIONES
                                </Typography>
                                
                                {/* Especialidades */}
                                <Box mb={2}>
                                    <Typography component="span" fontWeight="bold" fontSize={16}>Especialidades:</Typography>
                                    <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                                        {selectedRow.especialidades && selectedRow.especialidades.length > 0 ? (
                                            selectedRow.especialidades.map((esp, index) => (
                                                <Chip 
                                                    key={index} 
                                                    label={esp} 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="outlined" 
                                                />
                                            ))
                                        ) : (
                                            <Typography fontSize={14} color="text.secondary">
                                                No tiene especialidades asignadas.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>

                                {/* Etiquetas */}
                                <Box>
                                    <Typography component="span" fontWeight="bold" fontSize={16}>Etiquetas:</Typography>
                                    <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                                        {selectedRow.etiquetas && selectedRow.etiquetas.length > 0 ? (
                                            selectedRow.etiquetas.map((eti, index) => (
                                                <Chip 
                                                    key={index} 
                                                    label={eti} 
                                                    size="small" 
                                                    color="secondary" 
                                                    variant="outlined" 
                                                />
                                            ))
                                        ) : (
                                            <Typography fontSize={14} color="text.secondary">
                                                No tiene etiquetas asignadas.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>

                            </Paper>
                        </Box>
                    )}
                    
                    {/* Botón de Cerrar */}
                    <Button 
                        onClick={handleCloseModal} 
                        variant="contained" 
                        sx={{ mt: 3, float: 'right' }}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

