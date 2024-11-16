import React, { useState, useRef, useEffect } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// تم شخصی‌سازی شده
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

const VideoUpload = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef(null);
    const videoChunks = useRef([]);
    const videoElementRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleStartRecording = () => {
        setVideoUrl(null);
        setIsRecording(true);

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
                setError("Error accessing media devices: " + err.message);
                setIsRecording(false);
            });
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current.stop();
        if (videoElementRef.current) {
            videoElementRef.current.srcObject = null;
        }
    };

    const handleRecordAgain = () => {
        setVideoUrl(null);
        setIsRecording(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" style={{ textAlign: 'center', paddingTop: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Video Recorder
                </Typography>

                {/* نمایش ویدیو ضبط‌شده */}
                {videoUrl && !isRecording && (
                    <Box marginBottom={2}>
                        <video src={videoUrl} controls style={{ width: '100%', height: 'auto' }} />
                    </Box>
                )}

                {/* نمایش ویدیو در هنگام ضبط */}
                {isRecording && (
                    <Box marginBottom={2}>
                        <video ref={videoElementRef} autoPlay muted style={{ width: '100%', height: 'auto' }} />
                    </Box>
                )}

                {/* دکمه‌ها برای شروع و توقف ضبط */}
                {!isRecording && !videoUrl && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleStartRecording}
                        style={{ padding: '10px 20px', margin: '20px' }}
                    >
                        Start Recording
                    </Button>
                )}

                {isRecording && (
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

                {/* دکمه ضبط مجدد پس از اتمام ضبط */}
                {videoUrl && !isRecording && (
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={handleRecordAgain}
                        style={{ padding: '10px 20px', margin: '20px' }}
                    >
                        Record Again
                    </Button>
                )}

                {/* نمایش خطا در صورت وجود */}
                {error && <Typography variant="body1" color="error">{error}</Typography>}
            </Container>
        </ThemeProvider>
    );
};

export default VideoUpload;
