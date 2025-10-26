import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import Stack from '@mui/material/Stack';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import DescriptionIcon from '@mui/icons-material/Description';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '35%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function TicketDetail() 
{
    //Constante temporal para probar
    const ticket = {
        idTicket: 1,
        title: "Error al Iniciar Sesión",
        description: "Llevo horas intentando iniciar sesión y no lo consigo, por favor ayudenme."
    }

    const [open, setOpen] = React.useState(false);
    //const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div>
            <Modal
                open={true}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5" component="" justifySelf={"center"}>
                        <Stack alignItems={'center'} direction={'row'}>
                            <ConfirmationNumberIcon fontSize="large" />Ticket #{ticket.idTicket} - {ticket.title}
                        </Stack>                        
                    </Typography>

                    <Typography id="modal-modal-title" variant="h6" paddingTop={"15px"} paddingBottom={"5px"}>
                        <Stack alignItems={'center'} direction={'row'}>
                            <DescriptionIcon fontSize="medium" />Descripción.
                        </Stack>   
                    </Typography>
                    <TextareaAutosize
                        placeholder= {ticket.description} 
                        aria-label="empty textarea" 
                        style={{ width: "100%"}}                       
                    />
                </Box>
            </Modal>
        </div>
    
    );
}