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
import { setCredentials } from '@/store/slices/authSlice';
import { UserRole, ROLE_ROUTES, ROLE_LABELS, Department, DEPARTMENTS } from '@/types/roles';
import { User } from '@/types/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [department, setDepartment] = useState<Department>('AA');
  const [error, setError] = useState('');

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Mock authentication - replace with actual API call
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }

      // Create mock user
      const mockUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        role,
        department: role === UserRole.COORDINATOR ? department : undefined,
      };

      const mockToken = 'mock-jwt-token';

      // Set credentials in Redux
      dispatch(setCredentials({ user: mockUser, token: mockToken }));

      // Redirect to appropriate dashboard
      router.push(ROLE_ROUTES[role]);
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Login As</InputLabel>
                <Select
                  value={role}
                  label="Login As"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  {Object.values(UserRole).map((r) => (
                    <MenuItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {role === UserRole.COORDINATOR && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={department}
                    label="Department"
                    onChange={(e) => setDepartment(e.target.value as Department)}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        Department {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

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
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  Demo Credentials (any email/password):
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  • Admin: Full system access
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  • Coordinator: Department-specific management
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  • Teacher: Class and attendance management
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  • Parent: Student monitoring and payments
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  • HR: Teacher recruitment and performance
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  • Accountant: Financial management and GST
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
