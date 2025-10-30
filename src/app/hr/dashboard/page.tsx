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
  Rating,
} from '@mui/material';
import {
  Assignment,
  PersonAdd,
  Person,
  TrendingUp,
  CalendarMonth,
  Warning,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { UserRole } from '@/types/roles';
import { Teacher } from '@/types/dashboard';

// Mock data
const mockPendingTeachers: Teacher[] = [
  { id: '1', code: 'TCH101', name: 'Ramesh Kumar', subject: 'Mathematics', status: 'pending', hourlyRate: 250 },
  { id: '2', code: 'TCH102', name: 'Anitha Sharma', subject: 'Physics', status: 'interviewed', hourlyRate: 250 },
];

const mockActiveTeachers: Teacher[] = [
  {
    id: '3',
    code: 'TCH001',
    name: 'Rajesh Menon',
    subject: 'Mathematics',
    syllabus: 'CBSE, ICSE',
    medium: 'English, Malayalam',
    rating: 4.5,
    conversionRatio: 75,
    availability: true,
    status: 'active',
    hourlyRate: 250,
    teachingStyle: 'Interactive, focus on problem-solving',
  },
  {
    id: '4',
    code: 'TCH002',
    name: 'Lakshmi Nair',
    subject: 'Physics',
    syllabus: 'CBSE',
    medium: 'English',
    rating: 4.8,
    conversionRatio: 85,
    availability: true,
    status: 'active',
    hourlyRate: 300,
    teachingStyle: 'Concept-based learning',
  },
  {
    id: '5',
    code: 'TCH003',
    name: 'Suresh Babu',
    subject: 'Chemistry',
    syllabus: 'State Board',
    medium: 'Malayalam',
    rating: 4.2,
    conversionRatio: 65,
    availability: false,
    status: 'active',
    hourlyRate: 250,
  },
];

const mockPerformanceData = [
  { teacherId: 't3', teacher: 'Rajesh Menon', avgRating: 4.5, conversionRate: 75, noShows: 1, cancellations: 2, complaints: 0 },
  { teacherId: 't4', teacher: 'Lakshmi Nair', avgRating: 4.8, conversionRate: 85, noShows: 0, cancellations: 1, complaints: 0 },
  { teacherId: 't5', teacher: 'Suresh Babu', avgRating: 4.2, conversionRate: 65, noShows: 3, cancellations: 4, complaints: 2 },
];

const menuItems = [
  { label: 'Dashboard', icon: <Assignment />, href: '/hr/dashboard' },
];

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredTeachers = mockActiveTeachers.filter((teacher) => {
    const matchesSubject = subjectFilter === 'all' || teacher.subject === subjectFilter;
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    return matchesSubject && matchesStatus;
  });

  return (
    <AuthGuard allowedRoles={[UserRole.HR]}>
      <DashboardLayout menuItems={menuItems}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            HR Dashboard
          </Typography>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Teacher Pipeline" />
            <Tab label="Teacher List" />
            <Tab label="Performance Metrics" />
            <Tab label="Availability Management" />
          </Tabs>

          {/* Teacher Pipeline Tab */}
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Pending Onboarding
                        </Typography>
                        <Button variant="contained" startIcon={<PersonAdd />}>
                          Add New Teacher
                        </Button>
                      </Box>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Teacher Code</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Subject</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockPendingTeachers.map((teacher) => (
                              <TableRow key={teacher.id}>
                                <TableCell>{teacher.code}</TableCell>
                                <TableCell>{teacher.name}</TableCell>
                                <TableCell>{teacher.subject}</TableCell>
                                <TableCell>
                                  <StatusBadge status={teacher.status} />
                                </TableCell>
                                <TableCell>
                                  <Button variant="contained" size="small">
                                    Complete Onboarding
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
              </Grid>
            </Box>
          )}

          {/* Teacher List Tab */}
          {activeTab === 1 && (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Subject</InputLabel>
                      <Select
                        value={subjectFilter}
                        label="Subject"
                        onChange={(e) => setSubjectFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Subjects</MenuItem>
                        <MenuItem value="Mathematics">Mathematics</MenuItem>
                        <MenuItem value="Physics">Physics</MenuItem>
                        <MenuItem value="Chemistry">Chemistry</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="interviewed">Interviewed</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Teacher Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Medium</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Conversion</TableCell>
                          <TableCell>Availability</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTeachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell>{teacher.code}</TableCell>
                            <TableCell>{teacher.name}</TableCell>
                            <TableCell>{teacher.subject}</TableCell>
                            <TableCell>{teacher.medium}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Rating value={teacher.rating} precision={0.1} size="small" readOnly />
                                <Typography variant="body2">({teacher.rating})</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{teacher.conversionRatio}%</TableCell>
                            <TableCell>
                              {teacher.availability ? (
                                <Chip label="Available" color="success" size="small" />
                              ) : (
                                <Chip label="Busy" color="default" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="outlined" size="small">
                                View Profile
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

          {/* Performance Metrics Tab */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="Total Active Teachers"
                    value={mockActiveTeachers.length}
                    icon={<Person fontSize="large" />}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="Avg. Rating"
                    value="4.5"
                    icon={<TrendingUp fontSize="large" />}
                    color="success.main"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="Avg. Conversion"
                    value="75%"
                    icon={<TrendingUp fontSize="large" />}
                    color="primary.main"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard
                    title="Teachers with Issues"
                    value="1"
                    icon={<Warning fontSize="large" />}
                    color="warning.main"
                  />
                </Grid>
              </Grid>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Teacher Performance (Last 30 days)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Avg. Rating</TableCell>
                          <TableCell>Conversion Rate</TableCell>
                          <TableCell>No-shows</TableCell>
                          <TableCell>Cancellations</TableCell>
                          <TableCell>Complaints</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockPerformanceData.map((data) => (
                          <TableRow key={data.teacherId}>
                            <TableCell>{data.teacher}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Rating value={data.avgRating} precision={0.1} size="small" readOnly />
                                <Typography variant="body2">({data.avgRating})</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography color={data.conversionRate >= 70 ? 'success.main' : 'error.main'}>
                                {data.conversionRate}%
                              </Typography>
                            </TableCell>
                            <TableCell>{data.noShows}</TableCell>
                            <TableCell>{data.cancellations}</TableCell>
                            <TableCell>
                              <Typography color={data.complaints > 0 ? 'error.main' : 'textPrimary'}>
                                {data.complaints}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {data.complaints > 2 ? (
                                <Chip label="Action Required" color="error" size="small" icon={<Warning />} />
                              ) : (
                                <Chip label="Good" color="success" size="small" />
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

          {/* Availability Management Tab */}
          {activeTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Availability Overview
                        </Typography>
                        <Button variant="contained" startIcon={<CalendarMonth />}>
                          Bulk Update Availability
                        </Button>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Chip
                          label="Teachers with <10 available slots this week"
                          color="warning"
                          icon={<Warning />}
                        />
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          2 teachers need attention
                        </Typography>
                      </Box>

                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Teacher</TableCell>
                              <TableCell>Subject</TableCell>
                              <TableCell>Available Slots (This Week)</TableCell>
                              <TableCell>Booked Classes</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mockActiveTeachers.map((teacher) => {
                              const availableSlots = Math.floor(Math.random() * 20) + 5;
                              const bookedClasses = Math.floor(Math.random() * 15) + 3;
                              return (
                                <TableRow key={teacher.id}>
                                  <TableCell>{teacher.name}</TableCell>
                                  <TableCell>{teacher.subject}</TableCell>
                                  <TableCell>
                                    <Typography color={availableSlots < 10 ? 'error.main' : 'textPrimary'}>
                                      {availableSlots}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{bookedClasses}</TableCell>
                                  <TableCell>
                                    <Button variant="outlined" size="small">
                                      View Schedule
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
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
