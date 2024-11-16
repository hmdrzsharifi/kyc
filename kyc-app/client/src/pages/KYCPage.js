import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import axios from 'axios';

const KYCPage = () => {
  const [status, setStatus] = useState('');
  const [documents, setDocuments] = useState([]);

  const handleDocumentUpload = async (e) => {
    const formData = new FormData();

    // Append each selected file to the FormData
    Array.from(e.target.files).forEach((file) => {
      formData.append('documents', file);  // 'documents' matches the field in your backend
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:9090/kyc/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Ensure that the correct content-type is set for file uploads
        },
      });
      setStatus('Documents uploaded, KYC status is pending');
      console.log('Response:', response.data); // For debugging
    } catch (error) {
      setStatus('Error uploading documents');
      console.error('Error:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4">KYC Upload</Typography>
      <input
        type="file"
        multiple
        onChange={handleDocumentUpload}
      />
      {status && <Typography>{status}</Typography>}
    </Container>
  );
};

export default KYCPage;
