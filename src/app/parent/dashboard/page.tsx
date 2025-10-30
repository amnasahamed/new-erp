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
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  Payment,
  VideoCall,
  Cancel,
  Warning,
  ReportProblem,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { UserRole } from '@/types/roles';
import { ClassSession, Dispute } from '@/types/dashboard';

// Mock data
const mockBalance = {
  amount: 500,
  hours: 2.0,
  hourlyRate: 250,
  status: 'low', // 'active', 'low', 'paused'
};

const mockUpcomingClasses: ClassSession[] = [
  {
    id: '1',
    date: '2025-10-29',
    time: '10:00 AM',
    subject: 'Mathematics',
    teacher: { id: 't1', code: 'TCH001', name: 'Rajesh Menon', subject: 'Mathematics', hourlyRate: 250, status: 'active' },
    teacherId: 't1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 500, balanceHours: 2.0, status: 'ongoing' },
    studentId: 's1',
    duration: 60,
    gmeetLink: 'https://meet.google.com/abc-defg-hij',
    status: 'upcoming',
  },
  {
    id: '2',
    date: '2025-10-30',
    time: '2:00 PM',
    subject: 'Physics',
    teacher: { id: 't2', code: 'TCH002', name: 'Lakshmi Nair', subject: 'Physics', hourlyRate: 250, status: 'active' },
    teacherId: 't2',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 500, balanceHours: 2.0, status: 'ongoing' },
    studentId: 's1',
    duration: 60,
    gmeetLink: 'https://meet.google.com/xyz-abcd-efg',
    status: 'upcoming',
  },
];

const mockRecentClasses: ClassSession[] = [
  {
    id: '3',
    date: '2025-10-27',
    time: '10:00 AM',
    subject: 'Mathematics',
    teacher: { id: 't1', code: 'TCH001', name: 'Rajesh Menon', subject: 'Mathematics', hourlyRate: 250, status: 'active' },
    teacherId: 't1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 500, balanceHours: 2.0, status: 'ongoing' },
    studentId: 's1',
    duration: 60,
    gmeetLink: 'https://meet.google.com/abc',
    status: 'completed',
  },
  {
    id: '4',
    date: '2025-10-26',
    time: '2:00 PM',
    subject: 'Physics',
    teacher: { id: 't2', code: 'TCH002', name: 'Lakshmi Nair', subject: 'Physics', hourlyRate: 250, status: 'active' },
    teacherId: 't2',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 500, balanceHours: 2.0, status: 'ongoing' },
    studentId: 's1',
    duration: 60,
    gmeetLink: 'https://meet.google.com/xyz',
    status: 'disputed',
  },
];

const mockDisputes: Dispute[] = [
  {
    id: '1',
    studentId: 's1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 500, balanceHours: 2.0, status: 'ongoing' },
    classDate: '2025-10-26',
    classId: '4',
    reason: 'Teacher did not join on time',
    ageHours: 24,
    status: 'open',
    createdAt: '2025-10-26T14:00:00Z',
  },
];

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/parent/dashboard' },
];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRecharge = () => {
    setRechargeDialogOpen(true);
  };

  const handleRaiseDispute = (classSession: ClassSession) => {
    setSelectedClass(classSession);
    setDisputeDialogOpen(true);
  };

  const handleJoinClass = (gmeetLink: string) => {
    window.open(gmeetLink, '_blank');
  };

  const handleCancelClass = (classId: string) => {
    // Implementation for cancelling class
    console.log('Cancelling class:', classId);
  };

  const balancePercentage = (mockBalance.hours / 5) * 100; // Assuming 5 hours is full

  return (
    <AuthGuard allowedRoles={[UserRole.PARENT]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Parent Dashboard
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Balance Summary" />
            <Tab label="Upcoming Classes" />
            <Tab label="Recent Attendance" />
            <Tab label="Dispute Center" />
            <Tab label="Feedback & Exams" />
          </Tabs>

          {/* Balance Summary Tab */}
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Current Balance
                          </Typography>
                          <Typography variant="h3" color="primary.main" fontWeight={600}>
                            ₹{mockBalance.amount}
                          </Typography>
                          <Typography variant="body1" color="textSecondary">
                            {mockBalance.hours.toFixed(1)} hours at ₹{mockBalance.hourlyRate}/hr
                          </Typography>
                        </Box>
                        <Button variant="contained" size="large" startIcon={<Payment />} onClick={handleRecharge}>
                          Recharge Now
                        </Button>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Balance Status</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {mockBalance.hours.toFixed(1)} / 5.0 hours
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={balancePercentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: mockBalance.status === 'low' ? 'warning.main' : 'success.main',
                            },
                          }}
                        />
                      </Box>

                      {mockBalance.status === 'low' && (
                        <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
                          Low Balance! Recharge to avoid automatic pause.
                        </Alert>
                      )}

                      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                        {mockBalance.status === 'active' && <StatusBadge status="active" label="Active" />}
                        {mockBalance.status === 'low' && <StatusBadge status="low" label="Low Balance (<2 hrs)" />}
                        {mockBalance.status === 'paused' && <StatusBadge status="paused" label="Paused" />}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Button variant="outlined" fullWidth startIcon={<Payment />} onClick={handleRecharge}>
                          Add Payment
                        </Button>
                        <Button variant="outlined" fullWidth startIcon={<Assignment />}>
                          View Timetable
                        </Button>
                        <Button variant="outlined" fullWidth startIcon={<FeedbackIcon />} onClick={() => setFeedbackDialogOpen(true)}>
                          Submit Feedback
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Upcoming Classes Tab */}
          {activeTab === 1 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Classes (Next 7 days)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockUpcomingClasses.map((classSession) => (
                          <TableRow key={classSession.id}>
                            <TableCell>{classSession.date}</TableCell>
                            <TableCell>{classSession.time}</TableCell>
                            <TableCell>{classSession.subject}</TableCell>
                            <TableCell>{classSession.teacher.name}</TableCell>
                            <TableCell>{classSession.duration} mins</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<VideoCall />}
                                  onClick={() => handleJoinClass(classSession.gmeetLink)}
                                >
                                  Join
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleCancelClass(classSession.id)}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Classes can only be cancelled ≥2 hours before start time
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Recent Attendance Tab */}
          {activeTab === 2 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Attendance (Last 5 classes)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockRecentClasses.map((classSession) => (
                          <TableRow key={classSession.id}>
                            <TableCell>{classSession.date}</TableCell>
                            <TableCell>{classSession.subject}</TableCell>
                            <TableCell>{classSession.teacher.name}</TableCell>
                            <TableCell>{classSession.duration} mins</TableCell>
                            <TableCell>
                              <StatusBadge status={classSession.status} />
                            </TableCell>
                            <TableCell>
                              {classSession.status === 'disputed' ? (
                                <Button variant="outlined" size="small" color="info">
                                  View Dispute
                                </Button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  startIcon={<ReportProblem />}
                                  onClick={() => handleRaiseDispute(classSession)}
                                >
                                  Raise Dispute
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

          {/* Dispute Center Tab */}
          {activeTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Your Disputes
                        </Typography>
                        <Button variant="contained" startIcon={<ReportProblem />}>
                          Raise New Dispute
                        </Button>
                      </Box>

                      {mockDisputes.length > 0 ? (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Dispute ID</TableCell>
                                <TableCell>Class Date</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {mockDisputes.map((dispute) => (
                                <TableRow key={dispute.id}>
                                  <TableCell>{dispute.id}</TableCell>
                                  <TableCell>{dispute.classDate}</TableCell>
                                  <TableCell>{dispute.reason}</TableCell>
                                  <TableCell>
                                    <StatusBadge status={dispute.status} />
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="outlined" size="small">
                                      View Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info">
                          No disputes found
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Feedback & Exams Tab */}
          {activeTab === 4 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Submit Feedback
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Share your experience after 2 weeks of first class
                      </Typography>
                      <Button variant="contained" startIcon={<FeedbackIcon />} onClick={() => setFeedbackDialogOpen(true)}>
                        Submit Feedback
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Exam Results
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        No exam results available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {/* Recharge Dialog */}
        <Dialog open={rechargeDialogOpen} onClose={() => setRechargeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Recharge Balance</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Hours"
                type="number"
                sx={{ mb: 2 }}
                helperText="Based on ₹250/hour rate"
              />
              <TextField
                fullWidth
                label="Payment Method"
                select
                SelectProps={{ native: true }}
              >
                <option value="upi">UPI</option>
                <option value="card">Credit/Debit Card</option>
                <option value="netbanking">Net Banking</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRechargeDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setRechargeDialogOpen(false)}>
              Proceed to Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Raise Dispute Dialog */}
        <Dialog open={disputeDialogOpen} onClose={() => setDisputeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Raise Dispute</DialogTitle>
          <DialogContent>
            {selectedClass && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Class: {selectedClass.subject} on {selectedClass.date}
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
                  Teacher: {selectedClass.teacher.name}
                </Typography>
                <TextField
                  fullWidth
                  label="Reason for Dispute"
                  multiline
                  rows={4}
                  placeholder="Describe the issue..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisputeDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={() => setDisputeDialogOpen(false)}>
              Submit Dispute
            </Button>
          </DialogActions>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Rating (1-5)"
                type="number"
                inputProps={{ min: 1, max: 5 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={4}
                placeholder="Share your feedback..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setFeedbackDialogOpen(false)}>
              Submit Feedback
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}
