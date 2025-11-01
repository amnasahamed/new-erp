'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert as MuiAlert,
} from '@mui/material';
import {
  Assignment,
  Edit,
  Payment,
  PauseCircle,
  PlayCircle,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatusBadge from '@/components/common/StatusBadge';
import { UserRole } from '@/types/roles';
import { useAppSelector } from '@/store/hooks';
import { useStudents, useDemos, useDisputes } from '@/hooks';

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/coordinator/dashboard' },
];

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolveDisputeOpen, setResolveDisputeOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [adjustmentHours, setAdjustmentHours] = useState<number>(0);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { user } = useAppSelector((state) => state.auth);
  const department = user?.department || 'AA';

  // Use real hooks instead of mock data
  const { students, loading: studentsLoading, error: studentsError, pauseStudent, resumeStudent } = useStudents({
    departmentId: user?.departmentId,
  });

  const { demos, loading: demosLoading, error: demosError } = useDemos({
    status: 'pending',
    departmentId: user?.departmentId,
  });

  const { disputes, loading: disputesLoading, error: disputesError, resolveDispute } = useDisputes({
    status: 'open',
  });

  const filteredStudents = statusFilter === 'all'
    ? students
    : students.filter(s => s.status === statusFilter);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePauseStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to pause this student?')) {
      const success = await pauseStudent(studentId, 'Coordinator paused');
      if (success) {
        alert('Student paused successfully');
      }
    }
  };

  const handleResumeStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to resume this student?')) {
      const success = await resumeStudent(studentId);
      if (success) {
        alert('Student resumed successfully');
      }
    }
  };

  const handleResolveDispute = (disputeId: string) => {
    setSelectedDisputeId(disputeId);
    setResolveDisputeOpen(true);
  };

  const handleCloseResolveDispute = () => {
    setResolveDisputeOpen(false);
    setSelectedDisputeId(null);
    setAdjustmentHours(0);
    setResolutionNotes('');
  };

  const handleSubmitResolution = async () => {
    if (!selectedDisputeId) return;

    const success = await resolveDispute(selectedDisputeId, {
      finalAdjustmentHours: adjustmentHours,
      resolutionNotes: resolutionNotes || 'Resolved by coordinator',
    });

    if (success) {
      alert('Dispute resolved successfully!');
      handleCloseResolveDispute();
    }
  };

  // Show loading state
  if (studentsLoading && activeTab === 0) {
    return (
      <AuthGuard allowedRoles={[UserRole.COORDINATOR]}>
        <DashboardLayout menuItems={menuItems}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={[UserRole.COORDINATOR]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Coordinator Dashboard - Department {department}
          </Typography>

          {/* Error Messages */}
          {studentsError && <MuiAlert severity="error" sx={{ mb: 2 }}>Students: {studentsError}</MuiAlert>}
          {demosError && <MuiAlert severity="error" sx={{ mb: 2 }}>Demos: {demosError}</MuiAlert>}
          {disputesError && <MuiAlert severity="error" sx={{ mb: 2 }}>Disputes: {disputesError}</MuiAlert>}

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={`Student List (${students.length})`} />
            <Tab label={`Demo Pipeline (${demos.length})`} />
            <Tab label={`Dispute Queue (${disputes.length})`} />
            <Tab label="Timetable Builder" />
            <Tab label="Notifications" />
          </Tabs>

          {/* Student List Tab */}
          {activeTab === 0 && (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Students - Department {department}
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Filter by Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Filter by Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="demo">Demo</MenuItem>
                        <MenuItem value="ongoing">Ongoing</MenuItem>
                        <MenuItem value="paused">Paused</MenuItem>
                        <MenuItem value="stopped">Stopped</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Class/Syllabus</TableCell>
                          <TableCell>Balance</TableCell>
                          <TableCell>Next Class</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No students found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.code}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.email || '-'}</TableCell>
                              <TableCell>
                                ₹{student.balance} ({(student.balance / 250).toFixed(1)}h)
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>
                                <StatusBadge status={student.status} />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Button size="small" startIcon={<Edit />} variant="outlined">
                                    Edit
                                  </Button>
                                  {student.status === 'ongoing' ? (
                                    <Button
                                      size="small"
                                      startIcon={<PauseCircle />}
                                      color="warning"
                                      onClick={() => handlePauseStudent(student.id)}
                                    >
                                      Pause
                                    </Button>
                                  ) : student.status === 'paused' ? (
                                    <Button
                                      size="small"
                                      startIcon={<PlayCircle />}
                                      color="success"
                                      onClick={() => handleResumeStudent(student.id)}
                                    >
                                      Resume
                                    </Button>
                                  ) : null}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Demo Pipeline Tab */}
          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3}>
                {/* Pending Demo Requests */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Pending Demo Requests
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Parent Name</TableCell>
                              <TableCell>Student</TableCell>
                              <TableCell>Preferred Time</TableCell>
                              <TableCell>Subject</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {demosLoading ? (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  <CircularProgress size={24} />
                                </TableCell>
                              </TableRow>
                            ) : demos.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  <Typography variant="body2" color="textSecondary">
                                    No pending demo requests
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              demos.filter(d => d.status === 'pending').map((demo) => (
                                <TableRow key={demo.id}>
                                  <TableCell>{demo.parentName}</TableCell>
                                  <TableCell>{demo.studentName}</TableCell>
                                  <TableCell>{demo.scheduledAt ? new Date(demo.scheduledAt).toLocaleString() : '-'}</TableCell>
                                  <TableCell>{demo.notes || '-'}</TableCell>
                                  <TableCell>
                                    <Button variant="contained" size="small">
                                      Assign Teacher + GMeet
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Completed Demos */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Completed Demos (Outcome Pending)
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        No completed demos awaiting outcome.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Dispute Queue Tab */}
          {activeTab === 2 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Open Disputes
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>Class Date</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Age (hrs)</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {disputesLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <CircularProgress size={24} />
                            </TableCell>
                          </TableRow>
                        ) : disputes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No open disputes
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          disputes.map((dispute) => {
                            const hoursAgo = Math.floor(
                              (new Date().getTime() - new Date(dispute.createdAt).getTime()) / (1000 * 60 * 60)
                            );
                            return (
                              <TableRow key={dispute.id}>
                                <TableCell>{dispute.class?.student?.name || 'N/A'}</TableCell>
                                <TableCell>
                                  {dispute.class?.scheduledAt
                                    ? new Date(dispute.class.scheduledAt).toLocaleDateString()
                                    : '-'}
                                </TableCell>
                                <TableCell>{dispute.reason}</TableCell>
                                <TableCell>{hoursAgo}h</TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleResolveDispute(dispute.id)}
                                  >
                                    Resolve Dispute
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Timetable Builder Tab */}
          {activeTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Timetable Management
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" startIcon={<Schedule />}>
                          Create New Timetable
                        </Button>
                        <Button variant="outlined">
                          View Conflicts
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Notifications Tab */}
          {activeTab === 4 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notifications
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        New demo request from Arjun's parent
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        2 hours ago
                      </Typography>
                    </Alert>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        Dispute raised for STU101 – 25 Oct class
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        1 day ago
                      </Typography>
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        {/* Resolve Dispute Dialog */}
        <Dialog open={resolveDisputeOpen} onClose={handleCloseResolveDispute} maxWidth="sm" fullWidth>
          <DialogTitle>Resolve Dispute</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Resolution Notes"
                multiline
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the dispute was resolved..."
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Final Adjustment (hours to credit)"
                type="number"
                value={adjustmentHours}
                onChange={(e) => setAdjustmentHours(parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.5 }}
                helperText="Enter hours to credit back to student (0 = no refund)"
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResolveDispute}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitResolution}>
              Resolve Dispute
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}

function Alert({ severity, children, sx }: any) {
  return (
    <Box sx={{ p: 2, bgcolor: severity === 'info' ? 'info.light' : 'warning.light', borderRadius: 1, ...sx }}>
      {children}
    </Box>
  );
}
