'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { Block } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { ROLE_ROUTES } from '@/types/roles';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const handleGoBack = () => {
    if (user) {
      router.push(ROLE_ROUTES[user.role]);
    } else {
      router.push('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'error.light',
              color: 'error.main',
              mb: 3,
            }}
          >
            <Block sx={{ fontSize: 64 }} />
          </Box>
          <Typography variant="h3" gutterBottom fontWeight={600}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </Typography>
          <Button variant="contained" size="large" onClick={handleGoBack}>
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
