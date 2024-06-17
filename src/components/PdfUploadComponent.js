import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert, TextField } from '@mui/material';
import axios from 'axios';
import { useJsonData } from '../JsonDataContext';
import FilePondUploader from './FilePondUploader';

const PdfUploadComponent = () => {
  const { setJson } = useJsonData();
  const [bucketName, setBucketName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFilesChange = (newFiles) => {
    setSelectedFiles(newFiles);
  };

  const handleConvertAndUpload = async () => {
    if (!bucketName) {
      setSnackbarMessage('Bucket name is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('bucketName', bucketName);

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:5147/api/S3Bucket/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      setUploading(false);
      setSnackbarMessage('Files successfully uploaded and converted.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setJson(response.data); // Assuming the backend returns the conversion result directly
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setSnackbarMessage('Error uploading and converting files.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <TextField
        label="S3 Bucket Name"
        value={bucketName}
        onChange={(e) => setBucketName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <FilePondUploader onFilesChange={handleFilesChange} />
      <Button variant="contained" color="primary" onClick={handleConvertAndUpload} disabled={uploading}>
        {uploading ? <CircularProgress size={24} /> : 'Convert and Upload'}
      </Button>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PdfUploadComponent;