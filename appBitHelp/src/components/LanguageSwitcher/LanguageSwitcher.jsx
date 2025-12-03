import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    handleClose();
  };

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        size="small"
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem 
          onClick={() => changeLanguage('es')}
          selected={i18n.language === 'es'}
        >
          🇪🇸 Español
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('en')}
          selected={i18n.language === 'en'}
        >
          🇺🇸 English
        </MenuItem>
      </Menu>
    </>
  );
};