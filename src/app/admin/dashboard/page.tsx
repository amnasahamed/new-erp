'use client';

import { useState, useEffect } from 'react';
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
  Paper,
  Tabs,
  Tab,
  IconButton,
  Alert,
} from '@mui/material';
import {
  People,
  School,
  AttachMoney,
  Warning,
  Refresh,
  GetApp,
  WhatsApp,
  Assignment,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { UserRole } from '@/types/roles';
import { Student, ClassSession, Dispute, DepartmentSummary } from '@/types/dashboard';

// Mock data - replace with API calls
const mockLowBalanceStudents: Student[] = [
  { id: '1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 250, balanceHours: 1.0, status: 'ongoing', classSyllabus: 'CBSE Class 10' },
  { id: '2', code: 'STU002', name: 'Priya Sharma', department: 'BB', balance: 375, balanceHours: 1.5, status: 'ongoing', classSyllabus: 'ICSE Class 9' },
];

const mockTodayClasses: ClassSession[] = [
  {
    id: '1',
    date: '2025-10-28',
    time: '10:00 AM',
    subject: 'Mathematics',
    teacher: { id: 't1', code: 'TCH001', name: 'Rajesh Menon', subject: 'Mathematics', hourlyRate: 250, status: 'active' },
    teacherId: 't1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 250, balanceHours: 1.0, status: 'ongoing' },
    studentId: 's1',
    duration: 60,
    gmeetLink: 'https://meet.google.com/abc',
    status: 'ongoing',
    teacherJoined: true,
    studentJoined: true,
  },
];

const mockDepartmentSummary: DepartmentSummary[] = [
  { department: 'AA', activeStudents: 45, activeTeachers: 12, todayClasses: 15, conversionRate: 68.5, revenue: 125000 },
  { department: 'BB', activeStudents: 38, activeTeachers: 10, todayClasses: 12, conversionRate: 72.3, revenue: 98000 },
  { department: 'CC', activeStudents: 52, activeTeachers: 15, todayClasses: 18, conversionRate: 65.8, revenue: 145000 },
];

const mockDisputes: Dispute[] = [
  {
    id: '1',
    studentId: 's1',
    student: { id: 's1', code: 'STU101', name: 'Arjun Kumar', department: 'AA', balance: 250, balanceHours: 1.0, status: 'ongoing' },
    classDate: '2025-10-26',
    classId: 'c1',
    reason: 'Teacher did not join',
    ageHours: 36,
    status: 'open',
    createdAt: '2025-10-26T10:00:00Z',
  },
];

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/admin/dashboard' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Refresh live class data
        console.log('Auto-refreshing...');
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
            Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Daily Cross-Check" />
            <Tab label="Live Classes" />
            <Tab label="Department Summary" />
            <Tab label="System Alerts" />
            <Tab label="Reports" />
          </Tabs>

          {/* Daily Cross-Check Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Low Balance Students */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Low Balance Students
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Balance</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockLowBalanceStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.code}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              ₹{student.balance} ({student.balanceHours.toFixed(1)} hrs)
                            </TableCell>
                            <TableCell>{student.department}</TableCell>
                            <TableCell>
                              <Button variant="contained" size="small" color="primary">
                                Recharge Now
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* First Class Not Started */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    First Class Not Started (≥3 days after demo)
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No students found matching this criteria.
                  </Alert>
                </CardContent>
              </Card>

              {/* Feedback Pending */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Feedback Pending (2-week rule)
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No pending feedback found.
                  </Alert>
                </CardContent>
              </Card>

              {/* Unresolved Disputes */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Unresolved Disputes (&gt;24h)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Dispute ID</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Age (hrs)</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockDisputes.map((dispute) => (
                          <TableRow key={dispute.id}>
                            <TableCell>{dispute.id}</TableCell>
                            <TableCell>{dispute.student.name}</TableCell>
                            <TableCell>{dispute.reason}</TableCell>
                            <TableCell>{dispute.ageHours}h</TableCell>
                            <TableCell>
                              <Button variant="outlined" size="small" color="error">
                                Escalate to Coordinator
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

          {/* Live Classes Tab */}
          {activeTab === 1 && (
            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Today's Classes (Real-time)
                    </Typography>
                    <Box>
                      <Button
                        variant={autoRefresh ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<Refresh />}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        sx={{ mr: 1 }}
                      >
                        Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                      </Button>
                      <Typography variant="caption" color="textSecondary">
                        Updates every 30s
                      </Typography>
                    </Box>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockTodayClasses.map((classSession) => (
                          <TableRow key={classSession.id}>
                            <TableCell>{classSession.time}</TableCell>
                            <TableCell>{classSession.subject}</TableCell>
                            <TableCell>{classSession.teacher.name}</TableCell>
                            <TableCell>{classSession.student.name}</TableCell>
                            <TableCell>
                              {classSession.teacherJoined && classSession.studentJoined && (
                                <StatusBadge status="active" label="Both joined" />
                              )}
                              {classSession.teacherJoined && !classSession.studentJoined && (
                                <StatusBadge status="warning" label="Student missing" />
                              )}
                              {!classSession.teacherJoined && !classSession.studentJoined && (
                                <StatusBadge status="error" label="Neither joined" />
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

          {/* Department Summary Tab */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                {mockDepartmentSummary.map((dept) => (
                  <Grid item xs={12} md={6} lg={4} key={dept.department}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom fontWeight={600}>
                          Department {dept.department}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Active Students:</Typography>
                            <Typography variant="body2" fontWeight={600}>{dept.activeStudents}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Active Teachers:</Typography>
                            <Typography variant="body2" fontWeight={600}>{dept.activeTeachers}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Today's Classes:</Typography>
                            <Typography variant="body2" fontWeight={600}>{dept.todayClasses}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Conversion Rate:</Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {dept.conversionRate}%
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Revenue (Last 7d):</Typography>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              ₹{dept.revenue.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* System Alerts Tab */}
          {activeTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="warning" icon={<Warning />}>
                    <Typography variant="body2" fontWeight={600}>
                      3 Failed WhatsApp notifications
                    </Typography>
                    <Typography variant="body2">
                      Review and resend failed messages
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="error">
                    <Typography variant="body2" fontWeight={600}>
                      5 Ledger entries without narration
                    </Typography>
                    <Typography variant="body2">
                      These entries need proper narration for audit compliance
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2" fontWeight={600}>
                      2 Teachers with &gt;3 last-minute cancellations
                    </Typography>
                    <Typography variant="body2">
                      Review teacher performance and take action
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Reports Tab */}
          {activeTab === 4 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Daily Report
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Export today's activities and statistics
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" startIcon={<GetApp />}>
                          Export CSV
                        </Button>
                        <Button variant="outlined" startIcon={<GetApp />}>
                          Export PDF
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Monthly Analytics
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Department-wise revenue, conversion, disputes
                      </Typography>
                      <Button variant="contained" startIcon={<GetApp />}>
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
}
