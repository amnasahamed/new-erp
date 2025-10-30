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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Assignment,
  Add,
  GetApp,
  AccountBalance,
  Receipt,
  TrendingUp,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatCard from '@/components/common/StatCard';
import { UserRole } from '@/types/roles';
import { LedgerEntry, SalaryRecord, Dispute } from '@/types/dashboard';

// Mock data
const mockLedgerEntries: LedgerEntry[] = [
  {
    id: '1',
    date: '2025-10-28',
    studentId: 's1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 1250, balanceHours: 5.0, status: 'ongoing' },
    particulars: 'Payment received',
    credit: 2500,
    debit: 0,
    balance: 1250,
    invoiceNo: 'INV-001',
    narration: 'Online payment via UPI',
    paymentOrigin: 'domestic',
  },
  {
    id: '2',
    date: '2025-10-27',
    studentId: 's1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 1250, balanceHours: 5.0, status: 'ongoing' },
    particulars: 'Class conducted',
    credit: 0,
    debit: 250,
    balance: -1250,
    narration: 'Math class - 1 hour',
  },
  {
    id: '3',
    date: '2025-10-26',
    studentId: 's2',
    student: { id: 's2', code: 'STU002', name: 'Priya Sharma', department: 'BB', balance: 375, balanceHours: 1.5, status: 'ongoing' },
    particulars: 'Payment received',
    credit: 1000,
    debit: 0,
    balance: 375,
    invoiceNo: 'INV-002',
    narration: 'Bank transfer',
    paymentOrigin: 'domestic',
  },
];

const mockSalaryData: SalaryRecord[] = [
  {
    id: '1',
    teacherId: 't1',
    teacher: { id: 't1', code: 'TCH001', name: 'Rajesh Menon', subject: 'Mathematics', hourlyRate: 250, status: 'active' },
    month: '2025-10',
    hoursTaught: 45,
    hourlyRate: 250,
    grossSalary: 11250,
    gst: 2025,
    netSalary: 13275,
  },
  {
    id: '2',
    teacherId: 't2',
    teacher: { id: 't2', code: 'TCH002', name: 'Lakshmi Nair', subject: 'Physics', hourlyRate: 300, status: 'active' },
    month: '2025-10',
    hoursTaught: 38,
    hourlyRate: 300,
    grossSalary: 11400,
    gst: 2052,
    netSalary: 13452,
  },
];

const mockResolvedDisputes: Dispute[] = [
  {
    id: '1',
    studentId: 's1',
    student: { id: 's1', code: 'STU001', name: 'Arjun Kumar', department: 'AA', balance: 1250, balanceHours: 5.0, status: 'ongoing' },
    classDate: '2025-10-25',
    classId: 'c1',
    reason: 'Internet connectivity issue',
    ageHours: 72,
    status: 'resolved',
    finalAdjustment: 250,
    resolutionNotes: 'Full refund approved',
    createdAt: '2025-10-25T10:00:00Z',
  },
];

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/accountant/dashboard' },
];

export default function AccountantDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [addEntryDialogOpen, setAddEntryDialogOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const totalRevenue = mockLedgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const totalExpenses = mockSalaryData.reduce((sum, salary) => sum + salary.netSalary, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <AuthGuard allowedRoles={[UserRole.ACCOUNTANT]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Accountant Dashboard
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Ledger Overview" />
            <Tab label="Student Balance Audit" />
            <Tab label="Salary Processing" />
            <Tab label="GST Compliance" />
            <Tab label="Dispute Adjustments" />
          </Tabs>

          {/* Ledger Overview Tab */}
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Total Revenue (This Month)"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    icon={<TrendingUp fontSize="large" />}
                    color="success.main"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Total Expenses"
                    value={`₹${totalExpenses.toLocaleString()}`}
                    icon={<Receipt fontSize="large" />}
                    color="error.main"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Net Profit"
                    value={`₹${netProfit.toLocaleString()}`}
                    icon={<AccountBalance fontSize="large" />}
                    color="primary.main"
                  />
                </Grid>
              </Grid>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Recent Ledger Entries (Last 7 days)
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setAddEntryDialogOpen(true)}>
                      Add Manual Entry
                    </Button>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Particulars</TableCell>
                          <TableCell>Credit</TableCell>
                          <TableCell>Debit</TableCell>
                          <TableCell>Balance</TableCell>
                          <TableCell>Invoice No</TableCell>
                          <TableCell>Narration</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockLedgerEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.student.name}</TableCell>
                            <TableCell>{entry.particulars}</TableCell>
                            <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>
                              {entry.credit > 0 ? `₹${entry.credit}` : '-'}
                            </TableCell>
                            <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>
                              {entry.debit > 0 ? `₹${entry.debit}` : '-'}
                            </TableCell>
                            <TableCell>₹{entry.balance}</TableCell>
                            <TableCell>{entry.invoiceNo || '-'}</TableCell>
                            <TableCell>{entry.narration}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Student Balance Audit Tab */}
          {activeTab === 1 && (
            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="h6">
                        Student Balances
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Department</InputLabel>
                        <Select
                          value={departmentFilter}
                          label="Department"
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Departments</MenuItem>
                          <MenuItem value="AA">AA</MenuItem>
                          <MenuItem value="BB">BB</MenuItem>
                          <MenuItem value="CC">CC</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Button variant="outlined" startIcon={<GetApp />}>
                      Export All Balances
                    </Button>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Balance (₹)</TableCell>
                          <TableCell>Balance (hrs)</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Transaction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockLedgerEntries
                          .filter((entry, index, self) =>
                            index === self.findIndex((e) => e.studentId === entry.studentId)
                          )
                          .map((entry) => (
                            <TableRow key={entry.studentId}>
                              <TableCell>{entry.student.code}</TableCell>
                              <TableCell>{entry.student.name}</TableCell>
                              <TableCell>{entry.student.department}</TableCell>
                              <TableCell>₹{entry.student.balance}</TableCell>
                              <TableCell>{entry.student.balanceHours.toFixed(1)}h</TableCell>
                              <TableCell>
                                <Typography
                                  color={
                                    entry.student.balance < 500
                                      ? 'error.main'
                                      : entry.student.balance < 1000
                                      ? 'warning.main'
                                      : 'success.main'
                                  }
                                  fontWeight={600}
                                >
                                  {entry.student.balance < 500 ? 'Low' : entry.student.balance < 1000 ? 'Medium' : 'Good'}
                                </Typography>
                              </TableCell>
                              <TableCell>{entry.date}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Salary Processing Tab */}
          {activeTab === 2 && (
            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      This Month's Salary Preview
                    </Typography>
                    <Button variant="contained" startIcon={<GetApp />}>
                      Export Salary Sheet
                    </Button>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Hours Taught</TableCell>
                          <TableCell>Hourly Rate</TableCell>
                          <TableCell>Gross Salary</TableCell>
                          <TableCell>GST (18%)</TableCell>
                          <TableCell>Net Salary</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockSalaryData.map((salary) => (
                          <TableRow key={salary.id}>
                            <TableCell>{salary.teacher.name}</TableCell>
                            <TableCell>{salary.hoursTaught}h</TableCell>
                            <TableCell>₹{salary.hourlyRate}</TableCell>
                            <TableCell>₹{salary.grossSalary.toLocaleString()}</TableCell>
                            <TableCell>₹{salary.gst.toLocaleString()}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                              ₹{salary.netSalary.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={5} sx={{ fontWeight: 600, textAlign: 'right' }}>
                            Total:
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1.1rem' }}>
                            ₹{mockSalaryData.reduce((sum, s) => sum + s.netSalary, 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* GST Compliance Tab */}
          {activeTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">
                          GST Report
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button variant="contained" startIcon={<GetApp />}>
                            Export Excel
                          </Button>
                          <Button variant="outlined" startIcon={<GetApp />}>
                            Export PDF
                          </Button>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Total Revenue (GST Inclusive)
                              </Typography>
                              <Typography variant="h4" color="primary.main" fontWeight={600}>
                                ₹{totalRevenue.toLocaleString()}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                GST Collected (18%)
                              </Typography>
                              <Typography variant="h4" color="success.main" fontWeight={600}>
                                ₹{Math.round(totalRevenue * 0.18).toLocaleString()}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                GST Payable
                              </Typography>
                              <Typography variant="h4" color="error.main" fontWeight={600}>
                                ₹{Math.round(totalRevenue * 0.18).toLocaleString()}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                          Breakdown by Department
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Department</TableCell>
                                <TableCell>Revenue</TableCell>
                                <TableCell>GST (18%)</TableCell>
                                <TableCell>Net Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {['AA', 'BB', 'CC'].map((dept) => {
                                const deptRevenue = Math.floor(Math.random() * 50000) + 20000;
                                const deptGst = Math.round(deptRevenue * 0.18);
                                return (
                                  <TableRow key={dept}>
                                    <TableCell>Department {dept}</TableCell>
                                    <TableCell>₹{deptRevenue.toLocaleString()}</TableCell>
                                    <TableCell>₹{deptGst.toLocaleString()}</TableCell>
                                    <TableCell>₹{(deptRevenue - deptGst).toLocaleString()}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Dispute Adjustments Tab */}
          {activeTab === 4 && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resolved Disputes with Financial Impact
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Dispute ID</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Class Date</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Adjustment</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockResolvedDisputes.map((dispute) => (
                          <TableRow key={dispute.id}>
                            <TableCell>{dispute.id}</TableCell>
                            <TableCell>{dispute.student.name}</TableCell>
                            <TableCell>{dispute.classDate}</TableCell>
                            <TableCell>{dispute.reason}</TableCell>
                            <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>
                              +₹{dispute.finalAdjustment}
                            </TableCell>
                            <TableCell>
                              <Typography color="success.main" fontWeight={600}>
                                Balance Restored
                              </Typography>
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
        </Box>

        {/* Add Manual Entry Dialog */}
        <Dialog open={addEntryDialogOpen} onClose={() => setAddEntryDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Manual Ledger Entry</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select label="Student">
                  <MenuItem value="s1">STU001 - Arjun Kumar</MenuItem>
                  <MenuItem value="s2">STU002 - Priya Sharma</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Invoice Number" />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  <MenuItem value="credit">Credit (Payment In)</MenuItem>
                  <MenuItem value="debit">Debit (Class Charge)</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Amount (₹)" type="number" />
              <TextField fullWidth label="Narration" multiline rows={3} required helperText="Required for audit" />
              <FormControl fullWidth>
                <InputLabel>Payment Origin</InputLabel>
                <Select label="Payment Origin">
                  <MenuItem value="domestic">Domestic</MenuItem>
                  <MenuItem value="international">International</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddEntryDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setAddEntryDialogOpen(false)}>
              Add Entry
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  );
}
