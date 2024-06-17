# PDF to JSON Converter

The PDF to JSON Converter is a web-based application designed to convert PDF documents into JSON format, facilitating easy extraction and analysis of PDF content in a structured form. This tool provides a user-friendly web interface for uploading PDF files, which are then processed server-side to generate JSON output containing the text along with basic metadata from the PDF documents.

## Overview

The application is built using the ASP.NET Core framework on .NET 8.0, ensuring cross-platform compatibility. It incorporates a RESTful API for receiving PDF files via multipart/form-data. These files are processed using the iText7 library for PDF manipulation and the Newtonsoft.Json library for JSON serialization. The project also leverages Swashbuckle.AspNetCore for generating Swagger API documentation. The front end is developed using React, employing Material UI for the user interface design, providing a modern and responsive experience across various devices and browsers.

## Features

- **PDF File Upload**: Users can upload PDF files through a web interface. The application includes validation to confirm file formats before processing.
- **PDF to JSON Conversion**: Extracts text from PDF files and converts it into JSON format, including document metadata.
- **JSON Format Verification and Editing**: After conversion, users can verify the JSON format, make necessary edits, and prepare the data for further use.
- **S3 Bucket Integration**: Allows users to upload the converted JSON directly to an AWS S3 bucket.
- **API Documentation**: The application offers Swagger documentation for easy integration and usage of the API.

## Getting started

### Requirements

- .NET 8.0 SDK
- Node.js and npm (for React frontend development)
- An AWS account (for S3 bucket integration)

### Quickstart

1. **Clone the repository**:
   ```
   git clone <repository-url>
   ```
2. **Install backend dependencies**:
   Navigate to the project's root directory and restore the .NET dependencies:
   ```
   dotnet restore
   ```
3. **Run the backend**:
   Still in the root directory, launch the ASP.NET Core application:
   ```
   dotnet run --project FileUpload_JSONConvert
   ```
4. **Install frontend dependencies**:
   Change to the `frontend` directory (assuming a standard structure) and install the required npm packages:
   ```
   cd src/frontend
   npm install
   ```
5. **Run the frontend**:
   Start the React development server:
   ```
   npm start
   ```
   The application should now be accessible at `http://localhost:3000`.

### License

Copyright (c) 2024.

This software is proprietary and is not open source. Unauthorized copying of this file, via any medium, is strictly prohibited. Proprietary and confidential.