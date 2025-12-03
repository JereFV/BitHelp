import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { NotificationContext } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);
  const { refreshCount } = useContext(NotificationContext);

  const [formData, setFormData] = useState({
    credential: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.credential || !formData.password) {
      toast.error(t('auth.completeAllFields'));
      return;
    }

    setLoading(true);

    const loginPromise = login(formData.credential, formData.password);

    toast.promise(
      loginPromise,
      {
        loading: t('auth.loggingIn'),
        success: (result) => {
          if (result.success) {
            setTimeout(() => {
              refreshCount();
              navigate('/');
            }, 1000);
            return t('auth.loginSuccess');
          } else {
            throw new Error(result.message || t('auth.invalidCredentials'));
          }
        },
        error: (err) => err.message || t('auth.loginFailed')
      }
    ).finally(() => setLoading(false));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Toaster position="top-center" />
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              BitHelp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.enterCredentials')}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.usernameOrEmail')}
              name="credential"
              value={formData.credential}
              onChange={handleChange}
              margin="normal"
              autoComplete="username"
              autoFocus
              disabled={loading}
            />

            <TextField
              fullWidth
              label={t('auth.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {t('auth.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;