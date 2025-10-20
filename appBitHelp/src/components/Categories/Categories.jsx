import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, Typography } from '@mui/material';

export const CategoriesDataGridWithModal = () => {
  const [rows, setRows] = useState([
    { id: 1, firstName: 'Jon', lastName: 'Doe', age: 35, email: 'jon.doe@example.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', age: 42, email: 'jane.smith@example.com' },
    // ... more data
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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
    { field: 'firstName', headerName: 'Categoria', width: 150 },
    { field: 'lastName', headerName: 'Last name', width: 150 },
    { field: 'age', headerName: 'Age', type: 'number', width: 110 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button variant="outlined" size="small" onClick={() => handleOpenModal(params.row)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
      />

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
            Row Details
          </Typography>
          {selectedRow && (
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              ID: {selectedRow.id}<br />
              First Name: {selectedRow.firstName}<br />
              Last Name: {selectedRow.lastName}<br />
              Age: {selectedRow.age}<br />
              Email: {selectedRow.email}
            </Typography>
          )}
          <Button onClick={handleCloseModal} sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>
    </div>
  );
};

