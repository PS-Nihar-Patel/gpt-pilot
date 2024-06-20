import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Snackbar, Alert, TextField, Box, Typography, Grid, IconButton, Modal } from '@mui/material';
import axios from 'axios';
import { useJsonData } from '../JsonDataContext';
import FilePondUploader from './FilePondUploader';
import DeleteIcon from '@mui/icons-material/Delete';

const PdfUploadComponent = () => {
  const { setJson } = useJsonData();
  const [bucketName, setBucketName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileMetadata, setFileMetadata] = useState([]);
  const [vectorConfig, setVectorConfig] = useState(null);
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = useState(true);
  const [vectorConfigModalOpen, setVectorConfigModalOpen] = useState(false);

  const fetchVectorConfig = () => {
    setFetching(true);
    axios.get(`http://localhost:5147/api/S3Bucket/vectorConfig?bucketName=${encodeURIComponent(bucketName)}`)
      .then(response => {
        setVectorConfig(response.data);
        setIsUploadButtonDisabled(false);
        setVectorConfigModalOpen(false);
        // Initialize metadata for each file based on vectorConfig
        const initialFileMetadata = selectedFiles.map(file => {
          const metadataObject = { "File_Name": file.name };
          response.data.metadata_schema.forEach(key => {
            if (key !== "File_Name") { // Exclude File_Name from metadata_schema
              metadataObject[key] = '';
            }
          });
          return metadataObject;
        });
        setFileMetadata(initialFileMetadata);
        setFetching(false);
      })
      .catch(error => {
        console.error('Error fetching vector config:', error);
        setFetching(false);
        setSnackbarMessage('Please upload vector_config.json to the S3 bucket.');
        setSnackbarOpen(true);
        setIsUploadButtonDisabled(true);
        setVectorConfigModalOpen(true);
      });
  };

  const isValidInput = (input) => {
    const maxLength = 255;
    const regex = /^[-a-zA-Z0-9_.]+$/;
    return regex.test(input) && input.length <= maxLength;
  };

  const handleFilesChange = (newFiles) => {
    setSelectedFiles(newFiles);
    const initialFileMetadata = newFiles.map(file => {
      const metadataObject = { "File_Name": file.name };
      if (vectorConfig && vectorConfig.metadata_schema) {
        vectorConfig.metadata_schema.forEach(key => {
          if (key !== 'File_Name') { // Include File_Name in metadata_schema
            metadataObject[key] = '';
          }
        });
      }
      return metadataObject;
    });
    setFileMetadata(initialFileMetadata);
  };

  const handleMetadataChange = (index, key, value) => {
    const updatedFileMetadata = [...fileMetadata];
    updatedFileMetadata[index][key] = value;
    setFileMetadata(updatedFileMetadata);
  };

  const validateMetadataBeforeUpload = () => {
    for (let metadata of fileMetadata) {
      for (let key in metadata) {
        if (!isValidInput(metadata[key])) {
          setSnackbarMessage(`Invalid metadata for ${key}. Ensure values are alphanumeric, underscore, space, hyphen and do not exceed 255 characters.`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return false;
        }
      }
    }
    return true;
  };

  const handleConvertAndUpload = async () => {
    if (!bucketName) {
      setSnackbarMessage('Bucket name is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!validateMetadataBeforeUpload()) {
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append('files', file);
      formData.append('metadataJson', JSON.stringify(fileMetadata[index]));
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

  const handleCloseModal = () => {
    setVectorConfigModalOpen(false);
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
      <Button onClick={fetchVectorConfig} variant="contained" style={{ marginBottom: '10px' }} disabled={fetching}>{fetching ? <CircularProgress size={24} /> : 'Load Vector Config'}</Button>
      <FilePondUploader onFilesChange={handleFilesChange} disabled={isUploadButtonDisabled} />
      {selectedFiles.map((file, index) => (
        <Box key={index} sx={{ my: 2 }}>
          <Typography variant="subtitle1">{file.name}</Typography>
          {vectorConfig && vectorConfig.metadata_schema && vectorConfig.metadata_schema.map((key) => (
            <TextField
              key={key}
              label={`${key} (Metadata)`}
              value={fileMetadata[index] ? fileMetadata[index][key] : ''}
              onChange={(e) => handleMetadataChange(index, key, e.target.value)}
              fullWidth
              margin="normal"
            />
          ))}
        </Box>
      ))}
      <Button variant="contained" color="primary" onClick={handleConvertAndUpload} disabled={uploading || isUploadButtonDisabled}>
        {uploading ? <CircularProgress size={24} /> : 'Convert and Upload'}
      </Button>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Modal
        open={vectorConfigModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Vector Config Missing
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            The vector_config.json file is not found in the specified bucket. Please upload it before proceeding.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCloseModal} style={{ marginTop: '10px' }}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default PdfUploadComponent;