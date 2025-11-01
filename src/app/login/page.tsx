'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { UserRole, ROLE_ROUTES, ROLE_LABELS } from '@/types/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }

      // Use real API authentication
      const result = await dispatch(login({ email, password })).unwrap();

      // Redirect to appropriate dashboard based on user's role
      const userRole = result.user.role as UserRole;
      router.push(ROLE_ROUTES[userRole]);
    } catch (err: any) {
      setError(err || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  mb: 2,
                }}
              >
                <LockOutlined fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                ERP Dashboard
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Multi-Role Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="Password (DOB format: DD-MM-YYYY)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                placeholder="DD-MM-YYYY"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom fontWeight={600}>
                  Test Credentials (Password is DOB):
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontFamily: 'monospace' }}>
                  • admin@clapslearn.com / 01-01-1990
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontFamily: 'monospace' }}>
                  • coordinator@clapslearn.com / 15-03-1985
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontFamily: 'monospace' }}>
                  • teacher@clapslearn.com / 10-05-1992
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontFamily: 'monospace' }}>
                  • parent@clapslearn.com / 20-07-1988
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontFamily: 'monospace' }}>
                  • hr@clapslearn.com / 05-11-1987
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontFamily: 'monospace' }}>
                  • accountant@clapslearn.com / 25-09-1989
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
