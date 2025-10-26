// src/pages/DataEntryPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Import Material-UI Components ---
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  OutlinedInput, // NEW: Import for the multi-select box
  Checkbox,       // NEW: Import for checkboxes in the dropdown
  ListItemText  // NEW: Import to show text next to checkboxes
} from '@mui/material';

const API_URL = 'http://localhost:5001/api';

// NEW: Define the list of possible activities
const activityOptions = [
  'Medication Taken',
  'Attended Group Therapy',
  'Went for a Walk',
  'Family Visit',
  'Art Class',
  'Read a Book',
  'Watched a Movie'
];

function DataEntryPage() {
  // --- State Management ---
  const [clients, setClients] = useState([]); 
  const [selectedClient, setSelectedClient] = useState(''); 
  const [moodScore, setMoodScore] = useState(3);
  const [note, setNote] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]); // NEW: State for activities

  // --- Data Fetching ---
  useEffect(() => {
    axios.get(`${API_URL}/clients`)
      .then(response => {
        setClients(response.data); 
      })
      .catch(error => {
        console.error('Error fetching clients:', error);
        setStatusMessage({ type: 'error', text: 'Could not load clients.' });
      });
  }, []);

  // --- Event Handlers ---
  const handleSubmit = (event) => {
    event.preventDefault(); 
    
    if (!selectedClient) {
      setStatusMessage({ type: 'error', text: 'Please select a client.' });
      return;
    }

    const newLog = {
      client_id: selectedClient,
      mood_score: moodScore,
      activities: selectedActivities.join(','), // CHANGED: Join the array into a string
      note: note,
    };

    axios.post(`${API_URL}/logs`, newLog)
      .then(response => {
        setStatusMessage({ type: 'success', text: 'Log submitted successfully!' });
        // Reset the form fields
        setSelectedClient('');
        setMoodScore(3);
        setNote('');
        setSelectedActivities([]); // NEW: Reset activities
      })
      .catch(error => {
        console.error('Error submitting log:', error);
        setStatusMessage({ type: 'error', text: 'Failed to submit log.' });
      });
  };

  // --- JSX Rendering ---
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Caregiver Data Entry
      </Typography>
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        {/* Client Selection Dropdown */}
        <FormControl fullWidth required>
          <InputLabel id="client-select-label">Select Client</InputLabel>
          <Select
            labelId="client-select-label"
            value={selectedClient}
            label="Select Client"
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* NEW: Activities Multi-Select Dropdown */}
        <FormControl fullWidth>
          <InputLabel id="activities-select-label">Select Activities</InputLabel>
          <Select
            labelId="activities-select-label"
            multiple
            value={selectedActivities}
            onChange={(e) => setSelectedActivities(e.target.value)}
            input={<OutlinedInput label="Select Activities" />}
            renderValue={(selected) => selected.join(', ')} // How the selected values look in the box
          >
            {activityOptions.map((activity) => (
              <MenuItem key={activity} value={activity}>
                <Checkbox checked={selectedActivities.indexOf(activity) > -1} />
                <ListItemText primary={activity} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Mood Score Slider */}
        <Typography gutterBottom>Mood Score: {moodScore}</Typography>
        <Slider
          aria-label="Mood Score"
          value={moodScore}
          onChange={(e, newValue) => setMoodScore(newValue)}
          step={1}
          marks
          min={1}
          max={5}
          valueLabelDisplay="auto"
        />

        {/* Notes Text Field */}
        <TextField
          label="Notes"
          multiline
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          variant="outlined"
          fullWidth
          required
        />

        {/* Submit Button */}
        <Button type="submit" variant="contained" size="large">
          Submit Log
        </Button>
        
        {/* Status Message Alert */}
        {statusMessage && (
            <Alert 
                severity={statusMessage.type} 
                onClose={() => setStatusMessage(null)}
                sx={{ mt: 2 }}
            >
                {statusMessage.text}
            </Alert>
        )}
      </Box>
    </Container>
  );
}

export default DataEntryPage;