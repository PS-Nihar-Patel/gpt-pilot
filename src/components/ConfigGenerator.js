import React, { useState, useEffect } from 'react';
import { CircularProgress, TextField, Button, Grid, Typography, Paper, Snackbar, Alert, Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box } from '@mui/material';
import axios from 'axios';

const llmConfig = {
  application: "generic",
  chat_mode: "context",
  chat_context_qa_prompt_str: "Context information is below.\n---------------------\n{context_str}\n---------------------\nGiven the context information and not prior knowledge, answer the question\n",
  query_context_qa_prompt_str: "Context information is below.\n---------------------\n{context_str}\n---------------------\nGiven the context information and not prior knowledge, answer the question: {query_str}\n",
  enable_chat: false,
  openai_qa_prompt_str: "Context information is below.\n---------------------\n{context_str}\n---------------------\nGiven the context information and not prior knowledge, answer the question: {query_str}\n",
  similarity_cutoff: 0.5,
  temperature: 0.8,
  top_n_results: 10
};

const ConfigGenerator = () => {
  const [vectorConfig, setVectorConfig] = useState({
    application_name: "generic",
    metadata_keys_to_include_in_embedding: [],
    metadata_keys_to_include_in_LLM_calls: [],
    metadata_schema: [],
    number_of_dimensions:"",
    metadata_seperator: "",
    metadata_template: "{key}: {value}",
    paragraph_separator: "\n",
    text_template: "{metadata_str}\n\n{content}",
    sentence_window_split_size: ""
  });

  const [inputValues, setInputValues] = useState({
    metadata_keys_to_include_in_embedding: '',
    metadata_keys_to_include_in_LLM_calls: '',
    metadata_schema: ''
  });

  const [selectedMetadataKeysToIncludeInEmbeddings, setSelectedMetadataKeysToIncludeInEmbeddings] = useState([]);
  const [selectedMetadataKeysToIncludeInLLMCalls, setSelectedMetadataKeysToIncludeInLLMCalls] = useState([]);

  const [s3BucketName, setS3BucketName] = useState(""); // State for storing S3 bucket name
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues({ ...inputValues, [name]: value });
  };

  const handleKeyDown = (event) => {
    const { name, value } = event.target;
    if (event.key === 'Enter' && value.trim() !== "") {
      event.preventDefault(); // Prevent form submission on Enter
      const newValues = value.split(',').map(v => v.trim()).filter(v => v);
      setVectorConfig(prevState => ({
        ...prevState,
        [name]: [...prevState[name], ...newValues]
      }));
      setInputValues({ ...inputValues, [name]: '' }); // Clear input field after adding
    }
  };

  const handleDeleteChip = (chipToDelete, fieldName) => {
    setVectorConfig(prevState => ({
      ...prevState,
      [fieldName]: prevState[fieldName].filter(chip => chip !== chipToDelete)
    }));
  };

  const validateForm = () => {
    if (!vectorConfig.application_name.trim() || vectorConfig.sentence_window_split_size === "" || !s3BucketName.trim()) {
      setSnackbarMessage('Please fill in all required fields including the S3 bucket name.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  const validateSelectedMetadataKeys = () => {
    const isValidEmbeddings = selectedMetadataKeysToIncludeInEmbeddings.every(key => vectorConfig.metadata_schema.includes(key));
    const isValidLLMCalls = selectedMetadataKeysToIncludeInLLMCalls.every(key => vectorConfig.metadata_schema.includes(key));

    if (!isValidEmbeddings || !isValidLLMCalls) {
      setSnackbarMessage('Selected metadata keys must be part of the metadata schema.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  const handleSubmitVectorConfig = async () => {
    if (!validateForm() || !validateSelectedMetadataKeys()) return;
    setIsLoading(true);
    try {
      console.log("Submitting vector config...");
      const apiEndpoint = `http://localhost:5147/api/S3Bucket/vector/${encodeURIComponent(s3BucketName)}`;
      const payload = {
        ...vectorConfig,
        metadata_keys_to_include_in_embedding: selectedMetadataKeysToIncludeInEmbeddings,
        metadata_keys_to_include_in_LLM_calls: selectedMetadataKeysToIncludeInLLMCalls
      };
      console.log("Payload:", payload);
      const response = await axios.post(apiEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        console.log("Vector config uploaded successfully");
        setSnackbarMessage('Vector config uploaded successfully');
        setSnackbarSeverity('success');
      } else {
        setIsLoading(false);
        throw new Error(`Failed to upload vector config. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error uploading vector config:", error);
      setSnackbarMessage('Error uploading vector config: ' + error.message);
      setSnackbarSeverity('error');
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSubmitLlmConfig = async () => {
    if (!s3BucketName.trim()) {
      setSnackbarMessage('S3 bucket name is required for uploading LLM config.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const apiEndpoint = `http://localhost:5147/api/S3Bucket/llm?bucketName=${encodeURIComponent(s3BucketName)}`;
      const response = await axios.get(apiEndpoint);
      if (response.status === 200) {
        setSnackbarMessage('LLM config uploaded successfully to S3.');
        setSnackbarSeverity('success');
      } else {
        throw new Error(`Failed to upload LLM config. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error uploading LLM config:", error);
      setSnackbarMessage('Error uploading LLM config: ' + error.message);
      setSnackbarSeverity('error');
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const metadataSchema = vectorConfig.metadata_schema;
    setSelectedMetadataKeysToIncludeInEmbeddings(prev => prev.filter(key => metadataSchema.includes(key)));
    setSelectedMetadataKeysToIncludeInLLMCalls(prev => prev.filter(key => metadataSchema.includes(key)));
  }, [vectorConfig.metadata_schema]);

  return (
    <Grid container spacing={2} component={Paper} padding={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          margin="normal"
          label="S3 Bucket Name"
          value={s3BucketName}
          onChange={(e) => setS3BucketName(e.target.value)}
          placeholder="Enter the S3 bucket name here"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant='h6'>Vector Config</Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Application Name"
          name="application_name"
          value={vectorConfig.application_name}
          onChange={(e) => setVectorConfig({ ...vectorConfig, application_name: e.target.value })}
        />
        {['metadata_schema'].map((field) => (
          <div key={field}>
            <TextField
              fullWidth
              margin="normal"
              label={field.replace(/_/g, ' ')}
              name={field}
              value={inputValues[field]}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type values separated by commas and press enter to add"
            />
            {vectorConfig[field].map((chip, index) => (
              <Chip
                key={index}
                label={chip}
                onDelete={() => handleDeleteChip(chip, field)}
                style={{ margin: '5px' }}
              />
            ))}
          </div>
        ))}
        <FormControl fullWidth margin="normal">
          <InputLabel>Metadata Keys for Embeddings</InputLabel>
          <Select
            multiple
            value={selectedMetadataKeysToIncludeInEmbeddings}
            onChange={(event) => setSelectedMetadataKeysToIncludeInEmbeddings(event.target.value)}
            input={<OutlinedInput label="Metadata Keys for Embeddings" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {vectorConfig.metadata_schema.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Metadata Keys for LLM Calls</InputLabel>
          <Select
            multiple
            value={selectedMetadataKeysToIncludeInLLMCalls}
            onChange={(event) => setSelectedMetadataKeysToIncludeInLLMCalls(event.target.value)}
            input={<OutlinedInput label="Metadata Keys for LLM Calls" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {vectorConfig.metadata_schema.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          label="Number of Dimensions"
          name="number_of_dimensions"
          value={vectorConfig.number_of_dimensions}
          onChange={(e) => setVectorConfig({ ...vectorConfig, number_of_dimensions: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Metadata Separator"
          name="metadata_seperator"
          value={vectorConfig.metadata_seperator}
          onChange={(e) => setVectorConfig({ ...vectorConfig, metadata_seperator: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Metadata Template"
          name="metadata_template"
          value={vectorConfig.metadata_template}
          onChange={(e) => setVectorConfig({ ...vectorConfig, metadata_template: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Paragraph Separator"
          name="paragraph_separator"
          value={vectorConfig.paragraph_separator}
          onChange={(e) => setVectorConfig({ ...vectorConfig, paragraph_separator: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Text Template"
          name="text_template"
          value={vectorConfig.text_template}
          onChange={(e) => setVectorConfig({ ...vectorConfig, text_template: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Sentence Window Split Size"
          name="sentence_window_split_size"
          value={vectorConfig.sentence_window_split_size}
          onChange={(e) => setVectorConfig({ ...vectorConfig, sentence_window_split_size: e.target.value })}
        />
        <Button variant="contained" color="primary" style={{ marginTop: '20px' }} onClick={handleSubmitVectorConfig} disabled={isLoading}>
          Upload Vector Config
        </Button>{isLoading && <CircularProgress />}
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant='h6'>LLM Config (Read-only)</Typography>
        <TextField
          fullWidth
          multiline
          rows={10}
          margin="normal"
          value={JSON.stringify(llmConfig, null, 2)}
          InputProps={{
            readOnly: true,
          }}
        />
        <Button variant="contained" color="primary" style={{ marginTop: '20px' }} onClick={handleSubmitLlmConfig} disabled={isLoading}>
          Upload LLM Config
        </Button>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default ConfigGenerator;