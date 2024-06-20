# pdftojson

The pdftojson project is a comprehensive web-based application designed for converting PDF documents into JSON format. It caters to users needing to process or analyze the content of PDF documents in a structured and accessible format. Through a user-friendly web interface, it allows for the uploading of PDF files, which are then processed server-side to extract text and convert it into JSON, along with basic metadata.

## Overview

Built using the ASP.NET Core framework on .NET 8.0, pdftojson is designed for cross-platform compatibility, ensuring it runs seamlessly on Windows, Linux, and macOS. The application's architecture revolves around a RESTful API that accepts PDF files via multipart/form-data, processes these files server-side by extracting text, and converts it to JSON format using iText7 for PDF processing and Newtonsoft.Json for JSON serialization. Swashbuckle.AspNetCore is utilized for API documentation, enhancing developer interaction and integration. The project also includes a React-based frontend, employing Material UI for a responsive and intuitive user interface.

## Features

- **PDF File Upload**: Users can upload PDF files, which are validated and processed by the server.
- **PDF to JSON Conversion**: Extracted text from PDFs is converted into JSON format, including basic document metadata.
- **JSON Response**: Users receive the JSON representation of the uploaded PDF, facilitating further processing or analysis.
- **Frontend Interaction**: A React frontend with Material UI components offers a seamless user experience for uploading PDFs, viewing converted JSON, and managing uploads to AWS S3 buckets.
- **API Documentation**: Automatically generated Swagger documentation simplifies understanding and utilizing the application's API.
- **Error Handling**: Comprehensive error handling mechanisms ensure reliability and user feedback on issues such as upload failures or processing errors.
- **Security and Performance**: Strict file validation, temporary secure storage for processed files, and optimizations for handling multiple uploads concurrently ensure both security and high performance.

## Getting Started

### Requirements

- .NET 8.0 SDK
- Node.js (for running the React frontend)
- An AWS account and an S3 bucket (for S3 upload functionality)

### Quickstart

1. **Clone the repository**:
   ```
   git clone https://github.com/your-repository/pdftojson.git
   ```
2. **Navigate to the project directory**:
   ```
   cd pdftojson
   ```
3. **Install backend dependencies**:
   ```
   dotnet restore
   ```
4. **Start the ASP.NET Core backend**:
   ```
   dotnet run --project FileUpload_JSONConvert
   ```
5. **Navigate to the frontend directory**:
   ```
   cd src
   ```
6. **Install frontend dependencies**:
   ```
   npm install
   ```
7. **Start the React frontend**:
   ```
   npm start
   ```
   The application should now be running and accessible in your web browser.

### License

Copyright (c) 2024.

All rights reserved. The pdftojson project is proprietary software, not open source. Unauthorized copying of files, via any medium, is strictly prohibited without the owner's permission.