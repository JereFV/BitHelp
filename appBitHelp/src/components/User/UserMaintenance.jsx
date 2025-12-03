import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid'; 
import { Button,Chip,Paper,IconButton, Stack, Box, Alert, 
  CircularProgress, Typography, Snackbar, Dialog, DialogTitle, 
  DialogContent, DialogContentText, DialogActions,Modal, Divider
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Mail from '@mui/icons-material/MailOutline';
import Phone from '@mui/icons-material/Phone';
import Work from '@mui/icons-material/WorkOutline';
import Verified from '@mui/icons-material/VerifiedUserOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import TechnicianService from '../../services/TechnicianService'; 
import UserService from '../../services/userService'; 
import UserFormModal from './UserFormModal'; 
import PasswordChangeModal from './PasswordChangeModal';
import { useTranslation } from 'react-i18next';
import { esES, enUS } from '@mui/x-data-grid/locales';

const getStatusChip = (estado, t) => {
  const isActive = estado === '1' || estado === 1; 
  return (
    <Chip
      label={isActive ? t('common.active') : t('common.inactive')}
      color={isActive ? 'success' : 'error'}
      variant="filled" 
      size="small"
      sx={{ ml: 1, verticalAlign: 'middle' }}
    />
  );
};

const getAvailabilityChip = (idDisponibilidad, t) => {
  const isAvailable = Number(idDisponibilidad) === 1;
  const label = isAvailable ? t('users.available') : t('users.busy');
  const color = isAvailable ? 'info' : 'warning';
  
  if (!idDisponibilidad) {
    return <Chip label="N/A" color="default" size="small" sx={{ fontWeight: 'bold' }} />;
  }

  return (
    <Chip 
      label={label} 
      color={color} 
      size="small" 
      sx={{ fontWeight: 'bold' }} 
    />
  );
};

const getColumns = (handleOpenDetailModal, handleEdit, handleDelete, handleOpenPasswordModal, t) => [
  { 
    field: 'idUsuario', 
    headerName: t('users.userId'), 
    width: 90, 
    headerAlign: 'center', 
    align: 'center',
    type: 'number' 
  },
  { 
    field: 'nombreCompleto', 
    headerAlign: 'center', 
    align: 'center', 
    headerName: t('users.fullName'), 
    minWidth: 250,
    flex: 1,
  },
  { 
    field: 'correo', 
    headerName: t('users.email'),
    minWidth: 250, 
    flex: 1, 
    headerAlign: 'center', 
    align: 'center' 
  },
  { 
    field: 'nombreRol', 
    headerAlign: 'center', 
    align: 'center', 
    headerName: t('users.role'), 
    minWidth: 150,
    width: 250,
    flex: 0.6, 
  },
  {
    field: 'actions', 
    headerAlign: 'center', 
    align: 'center',
    headerName: t('common.actions'),
    minWidth: 250,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={2} justifyContent="center">
        <IconButton color="primary" size="small" onClick={() => handleOpenDetailModal(params.row)}>
          <VisibilityIcon />
        </IconButton>
        <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
          <EditIcon />
        </IconButton>
        <IconButton 
          color="warning" 
          size="small"
          onClick={() => handleOpenPasswordModal(params.row)}
        >
          <LockResetIcon />
        </IconButton>
        <IconButton 
          color="error" 
          size="small" 
          onClick={() => handleDelete(params.row)} 
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];

export default function UserMaintenance() {
  const { t, i18n } = useTranslation();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [detailLoading, setDetailLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const dataGridLocale = i18n.language === 'es' ? esES : enUS;

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh', 
    overflowY: 'auto',
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await UserService.getAllUsers(); 
      const mappedUsers = response.data.map(user => ({
        ...user,
        cargaTrabajo: user.cargaTrabajo || null, 
        idDisponibilidad: user.idDisponibilidad || null,
        especialidades: user.especialidades && Array.isArray(user.especialidades) ? user.especialidades : []
      }));
      setUsers(mappedUsers); 
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      toast.error(t('users.errorLoadingUsers'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); 

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedUser(null);
    setDetailLoading(false);
  };

  const handleOpenPasswordModal = useCallback((user) => {
    setSelectedUser(user); 
    setPassModalOpen(true); 
  }, []);

  const handlePassModalClose = useCallback((success = false, message = null) => {
    setPassModalOpen(false);
    setSelectedUser(null); 
    
    if (success && message) {
      toast.success(message);
    } else if (!success && message) {
      toast.error(message);
    }
  }, []);

  const handleOpenDetailModal = useCallback(async (user) => { 
    setSelectedUser(user);
    setOpenDetailModal(true);

    if (user.idRol === '2' || user.nombreRol === 'Técnico') {
      setDetailLoading(true);
      try {
        const response = await TechnicianService.getTechnicianDetailsByUserId(user.idUsuario);
        
        const technicianDetails = response.data.result || response.data;
        
        let finalSpecialties = technicianDetails.especialidades || [];
        if (typeof finalSpecialties === 'string') {
          finalSpecialties = finalSpecialties.split('|||');
        }
        
        setSelectedUser(prev => ({ 
          ...prev, 
          cargaTrabajo: technicianDetails.cargaTrabajo || '00:00:00', 
          idDisponibilidad: technicianDetails.idDisponibilidad || 0,
          especialidades: finalSpecialties,
        }));
      } catch (error) {
        console.error("Error al cargar detalles del técnico:", error.response?.data || error.message);
        setSelectedUser(prev => ({ 
          ...prev, 
          cargaTrabajo: 'N/A', 
          idDisponibilidad: 0,
          especialidades: [],
        }));
      } finally {
        setDetailLoading(false);
      }
    }
  }, []);

  const handleNewUser = () => {
    setCurrentUser(null); 
    setIsModalOpen(true);
  };

  const handleEdit = useCallback((user) => {
    setCurrentUser(user); 
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((user) => {
    setUserToDelete({
      id: user.idUsuario,
      nombre: user.nombreCompleto
    });
    setIsConfirmOpen(true); 
  }, []);

  const handleConfirmDelete = async () => {
    setIsConfirmOpen(false);
    
    if (!userToDelete || !userToDelete.id) return;

    const userId = userToDelete.id; 
    const userName = userToDelete.nombre || `ID ${userId}`;

    try {
      await UserService.deleteUser(userId); 
      await fetchUsers(); 
      toast.success(t('users.userDeletedSuccess', { userName }));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      toast.error(t('users.errorDeletingUser'));
    } finally {
      setUserToDelete(null);
    }
  };
  
  const handleModalClose = useCallback((refreshNeeded, message) => {
    setIsModalOpen(false);
    setCurrentUser(null);
    if (refreshNeeded) {
      fetchUsers();
    }
    if (message) {
      toast.success(message);
    }
  }, [fetchUsers]);

  const columns = getColumns(handleOpenDetailModal, handleEdit, handleDelete, handleOpenPasswordModal, t);

  return (
    <Box sx={{ p: 0, height: '100%' }}>
      <Toaster position="top-center" />
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleNewUser}
          startIcon={<AddIcon />}
        >
          {t('users.createUser')}
        </Button>
      </Box>
      
      <Box sx={{ height: 630, width: '100%', backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: '#00796b' }} />
          </Box>
        ) : (
          <DataGrid
            getRowId={(row) => row.idUsuario} 
            rows={users}
            columns={columns}
            initialState={{ 
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            localeText={{
              ...dataGridLocale.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: t('users.noUsersRegistered')
            }}
            sx={{ border: 0 }}
          />
        )}
      </Box>
      
      <UserFormModal 
        open={isModalOpen}
        handleClose={handleModalClose}
        userToEdit={currentUser}
      /> 

      {selectedUser && (
        <PasswordChangeModal 
          open={passModalOpen}
          handleClose={handlePassModalClose}
          userId={selectedUser.idUsuario}
          userName={selectedUser.nombreCompleto || selectedUser.nombre} 
        />
      )}

      <Modal
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        aria-labelledby="user-details-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="user-details-modal-title" variant="h5" component="h2" mb={1} sx={{ color: '#00796b', fontWeight: 'bold' }}>
            {t('users.userDetails')}
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={30} />
              <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
                {t('users.loadingTechnicianDetails')}
              </Typography>
            </Box>
          ) : selectedUser && (
            <Box id="modal-modal-description">
              
              <Box display="flex" alignItems="center" mb={1}>
                <AccountCircle color="primary" sx={{ mr: 1, fontSize: 30 }} />
                <Typography variant="h6" fontWeight="bold" mr={1}>
                  {selectedUser.nombreCompleto} ({selectedUser.nombreRol})
                </Typography>
                {getStatusChip(selectedUser.estado, t)}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ml: 0.5, mb: 2}}>
                {t('users.userId')}: {selectedUser.idUsuario} | {t('users.userName')}: {selectedUser.usuario}
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                  {t('users.contact')}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Mail color="action" sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="body2">{selectedUser.correo}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Phone color="action" sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="body2">{selectedUser.telefono || 'N/A'}</Typography>
                </Box>
              </Paper>
              
              {(selectedUser.idRol === '2' || selectedUser.nombreRol === 'Técnico') && (
                <>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" mb={1} color="text.secondary" fontWeight="bold">
                      {t('users.workMetrics')}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Work color="action" sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2">
                        {t('users.workload')}: <strong>{selectedUser.cargaTrabajo || '00:00:00'}</strong>
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                      {getAvailabilityChip(selectedUser.idDisponibilidad, t)} 
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box mb={1} display="flex" alignItems="center">
                      <Verified color="action" sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle'}}/>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                        {t('technicians.specialties').toUpperCase()}
                      </Typography>
                    </Box>
                    <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                      {selectedUser.especialidades && selectedUser.especialidades.length > 0 ? (
                        selectedUser.especialidades.map((esp, index) => (
                          <Chip 
                            key={index} 
                            label={esp} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        ))
                      ) : (
                        <Typography fontSize={14} color="text.secondary" sx={{ml: 0.5}}>
                          {t('technicians.noSpecialtiesAssigned')}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </>
              )}

            </Box>
          )}
          <Button onClick={handleCloseDetailModal} variant="contained" sx={{ mt: 3, float: 'right', backgroundColor: '#00796b' }}>
            {t('common.close')}
          </Button>
        </Box>
      </Modal>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          {t('users.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('users.deleteConfirmMessage', { userName: userToDelete?.nombre })}
            <br />
            {t('users.deleteWarningMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
}