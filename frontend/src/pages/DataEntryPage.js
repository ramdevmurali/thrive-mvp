// src/pages/DataEntryPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Import Material-UI Components ---
// These are pre-built, professional-looking UI components
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
  Alert 
} from '@mui/material';

// The base URL of our Flask API
const API_URL = 'http://localhost:5001/api';

function DataEntryPage() {
  // --- State Management ---
  // We use 'useState' to store and manage data in our component
  const [clients, setClients] = useState([]); // To store the list of clients from the API
  const [selectedClient, setSelectedClient] = useState(''); // To store the ID of the selected client
  const [moodScore, setMoodScore] = useState(3); // To store the value from the slider (default to 3)
  const [note, setNote] = useState(''); // To store the text from the note field
  const [statusMessage, setStatusMessage] = useState(null); // To show success/error messages

  // --- Data Fetching ---
  // 'useEffect' runs code after the component mounts (loads).
  // The empty array [] means it will only run once.
  useEffect(() => {
    // Fetch the list of clients from our backend API
    axios.get(`${API_URL}/clients`)
      .then(response => {
        setClients(response.data); // Store the fetched clients in our state
      })
      .catch(error => {
        console.error('Error fetching clients:', error);
        setStatusMessage({ type: 'error', text: 'Could not load clients.' });
      });
  }, []);

  // --- Event Handlers ---
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the browser's default form submission
    
    // Basic validation
    if (!selectedClient) {
      setStatusMessage({ type: 'error', text: 'Please select a client.' });
      return;
    }

    // The data payload to send to the backend
    const newLog = {
      client_id: selectedClient,
      mood_score: moodScore,
      // In a real app, you would have a multi-select for activities
      activities: 'Medication Taken,Attended Group Therapy', 
      note: note,
    };

    // Use axios to send a POST request to our API
    axios.post(`${API_URL}/logs`, newLog)
      .then(response => {
        // Handle success
        setStatusMessage({ type: 'success', text: 'Log submitted successfully!' });
        // Reset the form fields
        setSelectedClient('');
        setMoodScore(3);
        setNote('');
      })
      .catch(error => {
        // Handle error
        console.error('Error submitting log:', error);
        setStatusMessage({ type: 'error', text: 'Failed to submit log.' });
      });
  };

  // --- JSX Rendering ---
  // This is what the user sees
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