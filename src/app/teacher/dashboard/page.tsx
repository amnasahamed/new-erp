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
} from '@mui/material';
import {
  Assignment,
  VideoCall,
  CheckCircle,
  AttachMoney,
  CalendarMonth,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { UserRole } from '@/types/roles';
import { ClassSession } from '@/types/dashboard';

// Mock data
const mockTodayClasses: ClassSession[] = [
  {
    id: '1',
    date: '2025-10-28',
    time: '10:00 AM',
    subject: 'Mathematics',
    teacher: { id: 't1', code: 'TCH001', name: 'Rajesh Menon', subject: 'Mathematics', hourlyRate: 250, status: 'active' },
    teacherId: 't1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 1250, balanceHours: 5.0, status: 'ongoing' },
    studentId: 's1',
    duration: 60,
    gmeetLink: 'https://meet.google.com/abc-defg-hij',
    status: 'upcoming',
  },
  {
    id: '2',
    date: '2025-10-28',
    time: '2:00 PM',
    subject: 'Physics',
    teacher: { id: 't1', code: 'TCH001', name: 'Rajesh Menon', subject: 'Physics', hourlyRate: 250, status: 'active' },
    teacherId: 't1',
    student: { id: 's2', code: 'STU002', name: 'Priya Sharma', department: 'BB', balance: 375, balanceHours: 1.5, status: 'ongoing' },
    studentId: 's2',
    duration: 60,
    gmeetLink: 'https://meet.google.com/xyz-abcd-efg',
    status: 'upcoming',
  },
];

const mockPastClasses: ClassSession[] = [
  {
    id: '3',
    date: '2025-10-27',
    time: '10:00 AM',
    subject: 'Mathematics',
    teacher: { id: 't1', code: 'TCH001', name: 'Rajesh Menon', subject: 'Mathematics', hourlyRate: 250, status: 'active' },
    teacherId: 't1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 1250, balanceHours: 5.0, status: 'ongoing' },
    studentId: 's1',
    duration: 60,
    gmeetLink: 'https://meet.google.com/abc',
    status: 'completed',
    attendanceMarked: false,
    topic: 'Algebra - Quadratic Equations',
  },
];

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/teacher/dashboard' },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMarkAttendance = (classSession: ClassSession) => {
    setSelectedClass(classSession);
    setAttendanceDialogOpen(true);
  };

  const handleCloseAttendance = () => {
    setAttendanceDialogOpen(false);
    setSelectedClass(null);
  };

  const handleJoinClass = (gmeetLink: string) => {
    window.open(gmeetLink, '_blank');
  };

  // Mock salary data
  const totalHoursTaught = 45;
  const hourlyRate = 250;
  const projectedSalary = totalHoursTaught * hourlyRate;

  return (
    <AuthGuard allowedRoles={[UserRole.TEACHER]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Teacher Dashboard
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="My Classes Today" />
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
                          <TableCell>Subject</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockTodayClasses.map((classSession) => (
                          <TableRow key={classSession.id}>
                            <TableCell>{classSession.time}</TableCell>
                            <TableCell>{classSession.student.name}</TableCell>
                            <TableCell>{classSession.subject}</TableCell>
                            <TableCell>{classSession.duration} mins</TableCell>
                            <TableCell>
                              <StatusBadge status={classSession.status} />
                            </TableCell>
                            <TableCell>
                              {classSession.status === 'upcoming' ? (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<VideoCall />}
                                  onClick={() => handleJoinClass(classSession.gmeetLink)}
                                >
                                  Join Class
                                </Button>
                              ) : classSession.status === 'completed' && !classSession.attendanceMarked ? (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleMarkAttendance(classSession)}
                                >
                                  Mark Attendance
                                </Button>
                              ) : (
                                <Chip label="Attendance Marked" color="success" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
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
                        {mockPastClasses.map((classSession) => (
                          <TableRow key={classSession.id}>
                            <TableCell>{classSession.date}</TableCell>
                            <TableCell>{classSession.student.name}</TableCell>
                            <TableCell>{classSession.subject}</TableCell>
                            <TableCell>{classSession.duration} mins</TableCell>
                            <TableCell>{classSession.topic || '-'}</TableCell>
                            <TableCell>
                              {classSession.attendanceMarked ? (
                                <StatusBadge status="completed" label="Marked" />
                              ) : (
                                <StatusBadge status="pending" />
                              )}
                            </TableCell>
                            <TableCell>
                              {!classSession.attendanceMarked && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleMarkAttendance(classSession)}
                                >
                                  Mark Now
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
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
            {selectedClass && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Student: {selectedClass.student.name}
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
                  Subject: {selectedClass.subject}
                </Typography>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  defaultValue={selectedClass.duration}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Topic Covered"
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Homework Assigned"
                  multiline
                  rows={2}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAttendance}>Cancel</Button>
            <Button variant="contained" onClick={handleCloseAttendance}>
              Mark Attendance
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}
