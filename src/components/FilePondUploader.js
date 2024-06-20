import React, { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Register the PDF validation plugin
registerPlugin(FilePondPluginFileValidateType);

const FilePondUploader = ({ onFilesChange }) => {
  const [files, setFiles] = useState([]);

  return (
    <FilePond
      files={files}
      allowMultiple={true}
      acceptedFileTypes={['application/pdf']}
      onupdatefiles={(fileItems) => {
        // Set current file objects to the state
        setFiles(fileItems.map(fileItem => fileItem.file));
        if (onFilesChange) {
          onFilesChange(fileItems.map(fileItem => fileItem.file));
        }
      }}
      labelIdle='Drag & Drop your PDF files or <span class="filepond--label-action">Browse</span>'
      onprocessfiles={() => console.log('Files processed')}
      onerror={(error) => console.error('FilePond error:', error.message)}
    />
  );
};

export default FilePondUploader;