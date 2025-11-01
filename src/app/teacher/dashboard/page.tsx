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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment,
  VideoCall,
  CheckCircle,
  AttachMoney,
  CalendarMonth,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { UserRole } from '@/types/roles';
import { useAppSelector } from '@/store/hooks';
import { useTodayClasses } from '@/hooks';

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/teacher/dashboard' },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [attendanceNotes, setAttendanceNotes] = useState('');

  const { user } = useAppSelector((state) => state.auth);

  // Get teacher's classes using real hook
  const { classes: todayClasses, loading, error, markAttendance } = useTodayClasses(
    user?.teacherId // Filter by teacher ID from user
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMarkAttendance = (classId: string) => {
    setSelectedClassId(classId);
    setAttendanceDialogOpen(true);
  };

  const handleCloseAttendance = () => {
    setAttendanceDialogOpen(false);
    setSelectedClassId(null);
    setAttendanceNotes('');
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClassId) return;

    const success = await markAttendance(selectedClassId, {
      attended: true,
      notes: attendanceNotes || 'Class completed',
    });

    if (success) {
      alert('Attendance marked! Parent has 24 hours to raise disputes.');
      handleCloseAttendance();
    }
  };

  const handleJoinClass = (gmeetLink: string) => {
    if (gmeetLink) {
      window.open(gmeetLink, '_blank');
    } else {
      alert('GMeet link not available');
    }
  };

  // Calculate salary from completed classes
  const completedClasses = todayClasses.filter(c => c.attendanceMarked);
  const totalHoursTaught = completedClasses.reduce((sum, c) => sum + c.duration, 0);
  const hourlyRate = 250; // Should come from teacher profile
  const projectedSalary = (totalHoursTaught / 60) * hourlyRate;

  if (loading) {
    return (
      <AuthGuard allowedRoles={[UserRole.TEACHER]}>
        <DashboardLayout menuItems={menuItems}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={[UserRole.TEACHER]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Teacher Dashboard
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={`My Classes Today (${todayClasses.length})`} />
            <Tab label="Attendance Log" />
            <Tab label="Salary Preview" />
            <Tab label="Availability" />
            <Tab label="Exams & Feedback" />
          </Tabs>

          {/* My Classes Today Tab */}
          {activeTab === 0 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Today's Classes
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {todayClasses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No classes scheduled for today
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          todayClasses.map((classSession) => (
                            <TableRow key={classSession.id}>
                              <TableCell>
                                {new Date(classSession.scheduledAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </TableCell>
                              <TableCell>{classSession.student?.name || 'N/A'}</TableCell>
                              <TableCell>{classSession.duration / 60} hours</TableCell>
                              <TableCell>
                                <StatusBadge status={classSession.status} />
                              </TableCell>
                              <TableCell>
                                {classSession.status === 'scheduled' || classSession.status === 'ongoing' ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<VideoCall />}
                                    onClick={() => handleJoinClass(classSession.gmeetLink || '')}
                                  >
                                    Join Class
                                  </Button>
                                ) : classSession.status === 'completed' && !classSession.attendanceMarked ? (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleMarkAttendance(classSession.id)}
                                  >
                                    Mark Attendance
                                  </Button>
                                ) : classSession.attendanceMarked ? (
                                  <Chip label="Attendance Marked" color="success" size="small" />
                                ) : null}
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

          {/* Attendance Log Tab */}
          {activeTab === 1 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Log (Last 7 days)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Topic</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {todayClasses.filter(c => c.attendanceMarked).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No attendance marked yet
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          todayClasses.filter(c => c.attendanceMarked).map((classSession) => (
                            <TableRow key={classSession.id}>
                              <TableCell>
                                {new Date(classSession.scheduledAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{classSession.student?.name || 'N/A'}</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>{classSession.duration / 60} hours</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>
                                <Chip label="Marked" color="success" size="small" />
                              </TableCell>
                              <TableCell>
                                {new Date(classSession.markedAt || '').toLocaleString()}
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

          {/* Salary Preview Tab */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Total Hours Taught"
                    value={totalHoursTaught}
                    icon={<CalendarMonth fontSize="large" />}
                    subtitle="This month"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Hourly Rate"
                    value={`₹${hourlyRate}`}
                    icon={<AttachMoney fontSize="large" />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Projected Salary (Pre-GST)"
                    value={`₹${projectedSalary.toLocaleString()}`}
                    icon={<AttachMoney fontSize="large" />}
                    color="success.main"
                  />
                </Grid>
              </Grid>
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Note: Final salary will be calculated after dispute resolution
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Availability Tab */}
          {activeTab === 3 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weekly Availability
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Toggle your availability for each time slot
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <Card key={day} variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" align="center" gutterBottom>
                            {day}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button size="small" variant="contained" color="success">
                              10:00 AM
                            </Button>
                            <Button size="small" variant="outlined">
                              2:00 PM
                            </Button>
                            <Button size="small" variant="contained" color="success">
                              4:00 PM
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                  <Button variant="contained" sx={{ mt: 3 }}>
                    Save Availability
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Exams & Feedback Tab */}
          {activeTab === 4 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Log Exam
                      </Typography>
                      <Button variant="contained">
                        Log New Exam
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Student Feedback
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        No feedback received yet
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {/* Mark Attendance Dialog */}
        <Dialog open={attendanceDialogOpen} onClose={handleCloseAttendance} maxWidth="sm" fullWidth>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Marking attendance will start a 24-hour grace period. Parents can raise disputes during this time.
                </Typography>
              </Alert>
              <TextField
                fullWidth
                label="Class Notes (optional)"
                multiline
                rows={4}
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                placeholder="Topic covered, homework assigned, etc."
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAttendance}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitAttendance}>
              Confirm Attendance
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}
