// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Import Material-UI Components ---
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert
} from '@mui/material';

// --- Import Recharts Components for the Chart ---
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = 'http://localhost:5001/api';

function DashboardPage() {
  // --- State Management ---
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false); // To show a loading spinner
  const [error, setError] = useState(null); // To show error messages

  // --- Initial Data Fetching (Clients) ---
  useEffect(() => {
    axios.get(`${API_URL}/clients`)
      .then(response => {
        setClients(response.data);
      })
      .catch(error => {
        console.error('Error fetching clients:', error);
        setError('Could not load clients.');
      });
  }, []);

  // --- Handler for Client Selection ---
  const handleClientChange = (event) => {
    const clientId = event.target.value;
    setSelectedClient(clientId);

    if (clientId) {
      setLoading(true);
      setError(null);
      setLogs([]); // Clear previous logs
      setSummary(''); // Clear previous summary

      // Fetch both logs and summary for the selected client concurrently
      const requestLogs = axios.get(`${API_URL}/logs?client_id=${clientId}`);
      const requestSummary = axios.get(`${API_URL}/generate-summary?client_id=${clientId}`);

      Promise.all([requestLogs, requestSummary])
        .then(([logsResponse, summaryResponse]) => {
          setLogs(logsResponse.data);
          setSummary(summaryResponse.data.summary);
        })
        .catch(error => {
          console.error('Error fetching client data:', error);
          setError('Could not load data for the selected client.');
        })
        .finally(() => {
          setLoading(false); // Stop loading spinner
        });
    } else {
      // Clear data if no client is selected
      setLogs([]);
      setSummary('');
    }
  };

  // --- Helper to format date for the chart ---
  const formatChartData = (data) => {
    // API returns logs newest first, so we reverse for chronological order in the chart
    return data.slice().reverse().map(log => ({
      ...log,
      // Format the date to be more readable on the X-axis
      date: new Date(log.timestamp).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    }));
  };

  // --- JSX Rendering ---
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Manager's Dashboard
      </Typography>
      
      {/* Client Filter Dropdown */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="client-select-label">Select Client to View</InputLabel>
        <Select
          labelId="client-select-label"
          value={selectedClient}
          label="Select Client to View"
          onChange={handleClientChange}
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Conditional Rendering based on state */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      
      {selectedClient && !loading && !error && (
        <>
          {/* Section for AI Summary and Chart */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>AI Weekly Summary</Typography>
              <Typography variant="body1">{summary}</Typography>
            </Paper>
            <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6" gutterBottom>Mood Trend (Last 15 logs)</Typography>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={formatChartData(logs)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="mood_score" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
          </Box>
          
          {/* Section for Data Table */}
          <TableContainer component={Paper}>
            <Table aria-label="client logs table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Mood Score</TableCell>
                  <TableCell>Activities</TableCell>
                  <TableCell>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell align="center">{log.mood_score}</TableCell>
                    <TableCell>{log.activities}</TableCell>
                    <TableCell>{log.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}

export default DashboardPage;