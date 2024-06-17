import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Typography } from '@mui/material';
import ReactJson from 'react-json-view-enhanced';
import styled from 'styled-components';

const ContentViewerContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
  font-family: 'Courier New', Courier, monospace;
`;

const FileContentViewer = ({ fileName, bucketName }) => {
  const [fileContent, setFileContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fileName || !bucketName) {
      setIsLoading(false);
      setError('File name or bucket name is not provided.');
      return;
    }

    const fetchFileContent = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5147/api/S3Bucket/${bucketName}/files/${fileName}`);
        setFileContent(response.data);
        setError('');
      } catch (error) {
        console.error('Failed to fetch file content:', error);
        setError('Failed to fetch file content. Please check the console for more details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileContent();
  }, [fileName, bucketName]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!fileContent) {
    return <Typography>No content to display</Typography>;
  }

  return (
    <ContentViewerContainer>
      <ReactJson src={fileContent} theme="rjv-default" collapsed={false} enableClipboard={false} displayDataTypes={false} />
    </ContentViewerContainer>
  );
};

export default FileContentViewer;