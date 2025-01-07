import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import {getToken} from "@/pages/auth/config/keycloak";

export default function Level3() {
    const [billFile, setBillFile] = useState(null);
    const [address, setAddress] = useState({
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!billFile || !address.addressLine1 || !address.city || !address.state || !address.postalCode || !address.country) {
            setMessage("Please fill all address fields and upload a bill.");
            return;
        }

        const formData = new FormData();
        formData.append("bill", billFile);
        Object.keys(address).forEach((key) => {
            formData.append(key, address[key]);
        });

        const token = await getToken();

        try {
            const response = await axios.post("http://172.31.13.30:5000/api/kyc/level3", formData, {
                headers: { 'Content-Type': 'multipart/form-data' ,  Authorization: `Bearer ${token}`},
            });
            setMessage("Address and bill uploaded successfully!");
        } catch (error) {
            setMessage(error.response?.data?.message || "Upload failed!");
        }
    };

    return (
        <Box sx={{ maxWidth: 500, margin: "0 auto", padding: 2 }}>
            <Typography variant="h5">Level 3 Verification</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Address Line 1"
                    name="addressLine1"
                    value={address.addressLine1}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Address Line 2"
                    name="addressLine2"
                    value={address.addressLine2}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="State"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Postal Code"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Country"
                    name="country"
                    value={address.country}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" component="label" fullWidth>
                    Upload Bill Document
                    <input
                        type="file"
                        hidden
                        onChange={(e) => setBillFile(e.target.files[0])}
                    />
                </Button>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Submit
                </Button>
            </form>
            {message && <Typography color="error" sx={{ mt: 2 }}>{message}</Typography>}
        </Box>
    );
}
