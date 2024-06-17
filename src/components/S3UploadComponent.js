import React, { useState } from 'react';
import { Button, TextField, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useJsonData } from '../JsonDataContext'; // Import the hook for accessing JSON data context
import { sanitizeInput } from '../utils/sanitizeInput'; // Import the sanitize function

const S3UploadComponent = () => {
  const { jsonData } = useJsonData(); // Use the hook to access jsonData
  const [bucketName, setBucketName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const uploadJsonToS3 = async () => {
    const sanitizedBucketName = sanitizeInput(bucketName); // Sanitize the bucket name
    if (!sanitizedBucketName) {
      console.log('Bucket name is required');
      setSnackbarMessage('Bucket name is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const apiEndpoint = 'http://localhost:5298/api/S3Bucket/'+bucketName+'/files'; // Ensure API communication over HTTPS
    const payload = {
      bucketName: sanitizedBucketName,
      jsonData
    };

    try {
      const response = await axios.post(apiEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('JSON uploaded to S3 successfully via API', response.data);
      setSnackbarMessage('JSON uploaded to S3 successfully!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('S3 upload error via API:', error.message, error.stack);
      setSnackbarMessage('Failed to upload JSON to S3. Check console for details.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <TextField label="Bucket Name" value={bucketName} onChange={(e) => setBucketName(e.target.value)} fullWidth margin="normal" />
      <Button variant="contained" color="primary" onClick={uploadJsonToS3}>Upload to S3</Button>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default S3UploadComponent;