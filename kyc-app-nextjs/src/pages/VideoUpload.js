import React, { useState, useRef, useEffect } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../Layout';
import { getToken } from '@/pages/auth/config/keycloak';
import { useKeycloak } from '@/pages/auth/provider/KeycloakProvider';

const VideoUpload = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [randomMessage, setRandomMessage] = useState('');
    const [duration, setDuration] = useState(null); // To store the video duration
    const mediaRecorderRef = useRef(null);
    const videoChunks = useRef([]);
    const videoElementRef = useRef(null);
    const streamRef = useRef(null);
    const { user } = useKeycloak();

    const randomMessages = [
        "Let's capture this moment!",
        "Ready to record your video.",
        "Say cheese and start recording!",
        "Lights, camera, action!",
    ];

    const router = useRouter();


    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const startRecording = () => {
        setVideoUrl(null);
        setIsRecording(true);
        setDuration(null); // Reset duration at the start of recording

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    streamRef.current = stream;
                    if (videoElementRef.current) {
                        videoElementRef.current.srcObject = stream;
                    }

                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (event) => {
                        videoChunks.current.push(event.data);
                    };
                    mediaRecorderRef.current.onstop = () => {
                        const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' });
                        const videoUrl = URL.createObjectURL(videoBlob);
                        setVideoUrl(videoUrl);
                        videoChunks.current = [];
                    };
                    mediaRecorderRef.current.start();
                })
                .catch((err) => {
                    setError('Error accessing media devices: ' + err.message);
                    setIsRecording(false);
                });
        } else {
            setError('Your browser does not support media devices');
            setIsRecording(false);
        }
    };

    const handleStartRecording = () => {
        setCountdown(3);
        setRandomMessage(randomMessages[Math.floor(Math.random() * randomMessages.length)]); // Choose random message
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(countdownInterval);
                    startRecording();
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current.stop();

        if (videoElementRef.current) {
            videoElementRef.current.srcObject = null;
        }

        // توقف ترک‌های ویدیو و صدا
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null; // پاک کردن مرجع به استریم
        }
    };

    const handleUpload = async () => {
        if (!videoUrl) {
            setError('No video to upload');
            return;
        }
        setIsUploading(true);
        setError('');

        try {
            const token = await getToken();
            const response = await fetch(videoUrl);
            const videoBlob = await response.blob();
            const formData = new FormData();
            formData.append('video', videoBlob, 'recorded-video.mp4'); // Rename file to .mp4
            formData.append('document_id', 'DOCUMENT_ID'); // Replace with appropriate value
            formData.append('user_email', user.email); // Replace with appropriate value

            const res = await axios.post('http://172.31.13.30:5000/api/kyc/upload-video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Upload Response:', res.data);
            alert('Video uploaded successfully!');
            setVideoUrl(null);
            setCountdown(0);
            setIsRecording(false);
        } catch (err) {
            console.error(err);
            setError('Failed to upload video');
        } finally {
            setIsUploading(false);
        }
    };

    const handleVideoLoaded = () => {
        if (videoElementRef.current) {
            setDuration(videoElementRef.current.duration); // Get video duration when metadata is loaded
        }
    };

    return (
        <Layout>
            <Container maxWidth="sm" style={{ textAlign: 'center', paddingTop: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Video Recorder
                </Typography>

                {videoUrl && !isRecording && (
                    <Box marginBottom={2}>
                        <video
                            src={videoUrl}
                            controls
                            style={{ width: '100%', height: 'auto' }}
                            onLoadedMetadata={handleVideoLoaded} // Load metadata to get duration
                        />
                    </Box>
                )}

                {isRecording && countdown === 0 && (
                    <Box marginBottom={2}>
                        <video ref={videoElementRef} autoPlay muted style={{ width: '100%', height: 'auto' }} />
                    </Box>
                )}

                {countdown > 0 && (
                    <Typography variant="h2" color="primary" gutterBottom>
                        {countdown}
                    </Typography>
                )}

                {!isRecording && !videoUrl && countdown === 0 && (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleStartRecording}
                            style={{ padding: '10px 20px', margin: '20px' }}
                        >
                            Start Recording
                        </Button>
                    </>
                )}

                {isRecording && countdown === 0 && (
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleStopRecording}
                        style={{ padding: '10px 20px', margin: '20px' }}
                    >
                        Stop Recording
                    </Button>
                )}

                {isRecording && countdown === 0 && (
                    <>
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            Please say the following text in the video:
                        </Typography>
                        <Typography variant="h6" color="textSecondary" style={{ fontWeight: 'bold', color: 'black' }}>
                            {randomMessage}
                        </Typography>
                    </>
                )}

                {videoUrl && !isRecording && (
                    <Button
                        variant="outlined"
                        color="error"
                        size="large"
                        onClick={() => {
                            setVideoUrl(null);
                            setCountdown(0);
                            setIsRecording(false);
                        }}
                        style={{ padding: '10px 20px', margin: '20px' }}
                    >
                        Retake Video
                    </Button>
                )}

                {videoUrl && !isRecording && (
                    <>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={handleUpload}
                            style={{ padding: '10px 20px', margin: '20px' }}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Video'}
                        </Button>
                    </>
                )}

                {duration && (
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                        Video Duration: {duration.toFixed(2)} seconds
                    </Typography>
                )}

                {error && <Typography variant="body1" color="error">{error}</Typography>}
            </Container>
        </Layout>
    );
};

export default VideoUpload;
