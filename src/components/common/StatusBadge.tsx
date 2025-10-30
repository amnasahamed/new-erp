import { Chip } from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Pause,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusConfig: Record<
  string,
  { color: 'success' | 'warning' | 'error' | 'info' | 'default'; icon?: React.ReactElement }
> = {
  active: { color: 'success', icon: <CheckCircle /> },
  ongoing: { color: 'success', icon: <CheckCircle /> },
  completed: { color: 'success', icon: <CheckCircle /> },
  pending: { color: 'warning', icon: <HourglassEmpty /> },
  paused: { color: 'warning', icon: <Pause /> },
  stopped: { color: 'error', icon: <Cancel /> },
  cancelled: { color: 'error', icon: <Cancel /> },
  disputed: { color: 'error', icon: <Error /> },
  demo: { color: 'info' },
  upcoming: { color: 'info' },
  low: { color: 'warning', icon: <Warning /> },
  escalated: { color: 'error', icon: <Error /> },
  resolved: { color: 'success', icon: <CheckCircle /> },
  open: { color: 'warning' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { color: 'default' as const };

  return (
    <Chip
      label={label || status}
      color={config.color}
      size="small"
      icon={config.icon}
      sx={{ fontWeight: 500 }}
    />
  );
}
