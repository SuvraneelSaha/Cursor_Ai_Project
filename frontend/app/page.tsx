"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TextField from "@mui/material/TextField";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import jsPDF from "jspdf";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const jdFileInputRef = useRef<HTMLInputElement>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tailoredResume, setTailoredResume] = useState("");
  const [formError, setFormError] = useState("");

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f7f7fa', minHeight: '100vh' }}>
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1200 }} />}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TailorMyResume
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: '#fff' }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Welcome to TailorMyResume
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Instantly customize your resume for every job you apply to! Upload your resume and a job description, and let our AI tailor your resume to fit the role.
          </Typography>
        </Paper>
      </Container>
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: '#fff' }}>
          <Typography variant="h5" gutterBottom>
            Upload Your Resume (PDF Only)
          </Typography>
          <input
            accept="application/pdf"
            style={{ display: "none" }}
            id="resume-upload"
            type="file"
            onChange={e => {
              setFormError("");
              if (e.target.files && e.target.files[0]) {
                if (e.target.files[0].type !== "application/pdf") {
                  setFormError("Please upload a valid PDF file.");
                  setSelectedFile(null);
                  return;
                }
                setSelectedFile(e.target.files[0]);
              }
            }}
            ref={fileInputRef}
          />
          <label htmlFor="resume-upload">
            <Button
              variant="contained"
              color="primary"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              Choose PDF
            </Button>
          </label>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Only PDF files are supported. Max size: 5MB.
          </Typography>
          {selectedFile && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </Paper>
      </Container>
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: '#fff' }}>
          <Typography variant="h5" gutterBottom>
            Job Description (JD)
          </Typography>
          <TextField
            label="Paste Job Description"
            multiline
            minRows={4}
            maxRows={10}
            fullWidth
            value={jdText}
            onChange={e => {
              setFormError("");
              setJdText(e.target.value);
            }}
            sx={{ mb: 2 }}
            helperText="Paste the job description here or upload a .txt file."
          />
          <input
            accept=".txt"
            style={{ display: "none" }}
            id="jd-upload"
            type="file"
            onChange={e => {
              setFormError("");
              if (e.target.files && e.target.files[0]) {
                setJdFile(e.target.files[0]);
                // Read file content and set to jdText
                const reader = new FileReader();
                reader.onload = (event) => {
                  setJdText(event.target?.result as string);
                };
                reader.readAsText(e.target.files[0]);
              }
            }}
            ref={jdFileInputRef}
          />
          <label htmlFor="jd-upload">
            <Button
              variant="outlined"
              color="secondary"
              component="span"
              startIcon={<UploadFileIcon />}
              sx={{ mt: 2 }}
              onClick={() => jdFileInputRef.current && jdFileInputRef.current.click()}
            >
              Upload JD (.txt)
            </Button>
          </label>
          {jdFile && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Selected JD file: {jdFile.name}
            </Typography>
          )}
        </Paper>
      </Container>
      {formError && (
        <Container maxWidth="sm" sx={{ mt: 2 }}>
          <Alert severity="error">{formError}</Alert>
        </Container>
      )}
      <Container maxWidth="sm" sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tooltip
            title={
              !selectedFile
                ? "Please upload your resume PDF."
                : !jdText
                ? "Please provide the job description."
                : ""
            }
            arrow
            disableHoverListener={!!(selectedFile && jdText)}
          >
            <span>
              <Button
                variant="contained"
                color="success"
                size="large"
                disabled={!selectedFile || !jdText || loading}
                sx={{ mt: 2, minWidth: 220 }}
                onClick={async () => {
                  setFormError("");
                  if (!selectedFile) {
                    setFormError("Please upload your resume PDF.");
                    return;
                  }
                  if (!jdText) {
                    setFormError("Please provide the job description.");
                    return;
                  }
                  setLoading(true);
                  try {
                    const formData = new FormData();
                    if (selectedFile) formData.append('resume', selectedFile);
                    if (jdFile) {
                      formData.append('jd', jdFile);
                    } else {
                      formData.append('jdText', jdText);
                    }
                    const res = await fetch('http://localhost:5000/api/tailor-resume', {
                      method: 'POST',
                      body: formData,
                    });
                    if (!res.ok) {
                      const errData = await res.json();
                      throw new Error(errData.error || 'Failed to process');
                    }
                    const data = await res.json();
                    setTailoredResume(data.tailoredResume || "");
                    setSnackbar({ open: true, message: 'Resume and JD uploaded successfully!', severity: 'success' });
                  } catch (err: any) {
                    setFormError(err.message || 'Error uploading files. Please try again.');
                    setSnackbar({ open: true, message: 'Error uploading files. Please try again.', severity: 'error' });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Tailor My Resume"}
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="text"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={() => {
              setSelectedFile(null);
              setJdText("");
              setJdFile(null);
              setTailoredResume("");
              setFormError("");
            }}
          >
            Reset
          </Button>
        </Box>
      </Container>
      {tailoredResume && (
        <Container maxWidth="md" sx={{ mb: 8 }}>
          <Paper elevation={4} sx={{ p: 4, mt: 4, bgcolor: '#f5faff', border: '2px solid #1976d2' }}>
            <Typography variant="h5" gutterBottom color="primary">
              Tailored Resume
            </Typography>
            <TextField
              label="Edit Tailored Resume"
              multiline
              minRows={12}
              maxRows={30}
              fullWidth
              value={tailoredResume}
              onChange={e => setTailoredResume(e.target.value)}
              sx={{ mb: 3, fontFamily: 'monospace', bgcolor: '#fff' }}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 1, fontWeight: 600, fontSize: 18, px: 4, py: 1.5, boxShadow: 2 }}
              onClick={() => {
                const doc = new jsPDF({ unit: 'pt', format: 'a4' });
                const lines = doc.splitTextToSize(tailoredResume, 500);
                doc.setFont('courier', 'normal');
                doc.setFontSize(12);
                doc.text(lines, 40, 60);
                doc.save('tailored_resume.pdf');
              }}
            >
              Download as PDF
            </Button>
          </Paper>
        </Container>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity as any} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
