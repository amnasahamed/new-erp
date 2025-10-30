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
import { Student, DemoRequest, Dispute } from '@/types/dashboard';

// Mock data
const mockStudents: Student[] = [
  { id: '1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 1250, balanceHours: 5.0, status: 'ongoing', classSyllabus: 'CBSE Class 10', nextClass: '2025-10-29 10:00 AM' },
  { id: '2', code: 'STU002', name: 'Priya Sharma', department: 'AA', balance: 375, balanceHours: 1.5, status: 'ongoing', classSyllabus: 'ICSE Class 9', nextClass: '2025-10-29 2:00 PM' },
  { id: '3', code: 'STU003', name: 'Rahul Verma', department: 'AA', balance: 2500, balanceHours: 10.0, status: 'paused', classSyllabus: 'State Board Class 8' },
];

const mockDemos: DemoRequest[] = [
  { id: '1', parentName: 'Mr. Suresh', studentName: 'Ananya', preferredTime: '2025-10-29 11:00 AM', subject: 'Mathematics', status: 'pending' },
  { id: '2', parentName: 'Mrs. Lakshmi', studentName: 'Karthik', preferredTime: '2025-10-29 3:00 PM', subject: 'Physics', status: 'pending' },
];

const mockDisputes: Dispute[] = [
  {
    id: '1',
    studentId: 's1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 1250, balanceHours: 5.0, status: 'ongoing' },
    classDate: '2025-10-25',
    classId: 'c1',
    reason: 'Internet connectivity issue',
    ageHours: 48,
    status: 'open',
    createdAt: '2025-10-25T10:00:00Z',
  },
];

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/coordinator/dashboard' },
];

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolveDisputeOpen, setResolveDisputeOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const { user } = useAppSelector((state) => state.auth);
  const department = user?.department || 'AA';

  const filteredStudents = statusFilter === 'all'
    ? mockStudents
    : mockStudents.filter(s => s.status === statusFilter);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleResolveDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolveDisputeOpen(true);
  };

  const handleCloseResolveDispute = () => {
    setResolveDisputeOpen(false);
    setSelectedDispute(null);
  };

  return (
    <AuthGuard allowedRoles={[UserRole.COORDINATOR]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Coordinator Dashboard - Department {department}
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Student List" />
            <Tab label="Demo Pipeline" />
            <Tab label="Dispute Queue" />
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
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.code}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.classSyllabus}</TableCell>
                            <TableCell>
                              ₹{student.balance} ({student.balanceHours}h)
                            </TableCell>
                            <TableCell>{student.nextClass || '-'}</TableCell>
                            <TableCell>
                              <StatusBadge status={student.status} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" startIcon={<Schedule />}>
                                  Timetable
                                </Button>
                                <Button size="small" startIcon={<Edit />}>
                                  Edit
                                </Button>
                                <Button size="small" startIcon={<Payment />}>
                                  Payment
                                </Button>
                                {student.status === 'ongoing' ? (
                                  <Button size="small" startIcon={<PauseCircle />} color="warning">
                                    Pause
                                  </Button>
                                ) : student.status === 'paused' ? (
                                  <Button size="small" startIcon={<PlayCircle />} color="success">
                                    Resume
                                  </Button>
                                ) : null}
                              </Box>
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
                            {mockDemos.filter(d => d.status === 'pending').map((demo) => (
                              <TableRow key={demo.id}>
                                <TableCell>{demo.parentName}</TableCell>
                                <TableCell>{demo.studentName}</TableCell>
                                <TableCell>{demo.preferredTime}</TableCell>
                                <TableCell>{demo.subject}</TableCell>
                                <TableCell>
                                  <Button variant="contained" size="small">
                                    Assign Teacher + GMeet
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
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
                        {mockDisputes.map((dispute) => (
                          <TableRow key={dispute.id}>
                            <TableCell>{dispute.student.name}</TableCell>
                            <TableCell>{dispute.classDate}</TableCell>
                            <TableCell>{dispute.reason}</TableCell>
                            <TableCell>{dispute.ageHours}h</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleResolveDispute(dispute)}
                              >
                                Resolve Dispute
                              </Button>
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
                label="Teacher Response"
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Resolution Notes"
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Final Adjustment (hours)"
                type="number"
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResolveDispute}>Cancel</Button>
            <Button variant="contained" onClick={handleCloseResolveDispute}>
              Resolve
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
