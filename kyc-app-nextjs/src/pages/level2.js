import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import {getToken} from "@/pages/auth/config/keycloak";

export default function Level2() {
    const [identityType, setIdentityType] = useState("");
    const [identityFile, setIdentityFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!identityType || !identityFile) {
            setMessage("Please select an identity type and upload a file.");
            return;
        }
        const token = await getToken();

        const formData = new FormData();
        formData.append("identityType", identityType);
        formData.append("identity", identityFile);

        try {
            const response = await axios.post("http://172.31.13.30:5000/api/kyc/level2", formData, {
                headers: { 'Content-Type': 'multipart/form-data' ,  Authorization: `Bearer ${token}`},
            });
            setMessage("Identity document uploaded successfully!");
        } catch (error) {
            setMessage(error.response?.data?.message || "Upload failed!");
        }
    };

    return (
        <Layout>
        <Box sx={{ maxWidth: 500, margin: "0 auto", padding: 2 }}>
            <Typography variant="h5">Level 2 Verification</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    select
                    label="Identity Type"
                    value={identityType}
                    onChange={(e) => setIdentityType(e.target.value)}
                    SelectProps={{ native: true }}
                    fullWidth
                    margin="normal"
                >
                    <option value="">Select Identity Type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                </TextField>
                <Button variant="contained" component="label" fullWidth>
                    Upload Identity Document
                    <input
                        type="file"
                        hidden
                        onChange={(e) => setIdentityFile(e.target.files[0])}
                    />
                </Button>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Submit
                </Button>
            </form>
            {message && <Typography color="error" sx={{ mt: 2 }}>{message}</Typography>}
        </Box>
        </Layout>
    );
}
