import React, { Suspense, lazy } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { JsonDataProvider } from './JsonDataContext'; // Import the provider
import { S3BucketProvider } from './S3BucketContext'; // Import the S3BucketProvider
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationMenu from './components/NavigationMenu';

const PdfUploadComponent = lazy(() => import('./components/PdfUploadComponent'));
const JsonViewerComponent = lazy(() => import('./components/JsonViewerComponent'));
const S3UploadComponent = lazy(() => import('./components/S3UploadComponent'));
const ConfigGenerator = lazy(() => import('./components/ConfigGenerator')); // Lazy load the ConfigGenerator component

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff9800', // Orange
    },
    secondary: {
      main: '#2196f3', // Blue
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavigationMenu />
        <S3BucketProvider> {/* Wrap the components with S3BucketProvider */}
          <JsonDataProvider> {/* Keep JsonDataProvider inside S3BucketProvider */}
            <Suspense fallback={<div>Loading...</div>}>
              <div style={{ margin: '20px' }}>
                <Routes>
                  <Route path="/" element={<div>Select an option from the menu</div>} />
                  <Route path="/pdf-upload" element={<PdfUploadComponent />} />
                  <Route path="/json-viewer" element={<JsonViewerComponent />} />
                  <Route path="/s3-upload" element={<S3UploadComponent />} />
                  <Route path="/config-generator" element={<ConfigGenerator />} /> {/* Add route for Config Generator */}
                  {/* Add other routes as needed */}
                </Routes>
              </div>
            </Suspense>
          </JsonDataProvider>
        </S3BucketProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;