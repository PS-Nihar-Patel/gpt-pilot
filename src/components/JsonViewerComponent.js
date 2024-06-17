import React, { useEffect, useState } from 'react';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Grid, Box, Paper } from '@mui/material';
import axios from 'axios';
import { useJsonData } from '../JsonDataContext';
import FileContentViewer from './FileContentViewer';
import { FixedSizeList as List } from 'react-window';
import { Label } from '@mui/icons-material';

const JsonViewerComponent = () => {
  const { setJsonData } = useJsonData();
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedJson, setSelectedJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  useEffect(() => {
    const fetchBuckets = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://automationdev.3ecompany.com/rage-machines-workflow-engine/RageMachines/Indices');
        const bucketList = response.data.map(item => item.dataLocation);
        setBuckets(bucketList);
      } catch (error) {
        console.error('Failed to fetch buckets:', error);
        setSnackbarOpen(true);
        setSnackbarMessage('Failed to fetch buckets');
        setSnackbarSeverity('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuckets();
  }, []);

  const handleBucketChange = async (event) => {
    const bucketName = event.target.value;
    setSelectedBucket(bucketName);
    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:5147/api/S3Bucket/files`, {
        bucketName: bucketName,
      });

      setJsonFiles(response.data);
      setSnackbarOpen(true);
      setSnackbarMessage('JSON files fetched from S3 successfully!');
      setSnackbarSeverity('success');
      console.log('JSON files fetched from S3 successfully via API', response.data);
    } catch (error) {
      console.error('Failed to fetch json files:', error);
      setSnackbarOpen(true);
      setSnackbarMessage('Failed to fetch JSON files');
      setSnackbarSeverity('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (fileName) => {
    setSelectedJson(fileName);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const FileRenderer = ({ index, style }) => (
    <div
      style={{ ...style, display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 10px' }}
      onClick={() => handleFileSelect(jsonFiles[index])}
    >
      {jsonFiles[index]}
    </div>
  );

  return (
    <div>
      {isLoading && <CircularProgress />}
      <Grid container spacing={2} alignItems="stretch" justifyContent="center">
        <Grid item xs={12} md={6} display="flex" flexDirection="column">
          <Box width="100%">
            <FormControl fullWidth margin="normal">
              <InputLabel id="bucket-select-label">S3 Bucket</InputLabel>
              <Select
                labelId="bucket-select-label"
                id="bucket-select"
                value={selectedBucket}
                label="S3 Bucket"
                onChange={handleBucketChange}
              >
                {buckets.map((bucket) => (
                  <MenuItem key={bucket} value={bucket}>{bucket}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Paper style={{ height: 400, overflow: 'auto', flexGrow: 1 }}>
              <List
                height={400}
                itemCount={jsonFiles.length}
                itemSize={50}
                width="100%"
              >
                {FileRenderer}
              </List>
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          {selectedJson && (
            <Box width="100%">
              <h2>{selectedJson}</h2>
              <FileContentViewer fileName={selectedJson} bucketName={selectedBucket} />
            </Box>
          )}
        </Grid>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default JsonViewerComponent;
