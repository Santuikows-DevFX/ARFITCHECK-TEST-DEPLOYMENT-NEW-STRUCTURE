import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Box, Divider, TextField } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FilledButton } from '../UI/Buttons';
import StyledTextFields from '../UI/TextFields';

const UploadPhoto = ({ open, onClose }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUpload = () => {
    // Your upload logic here
    console.log('Uploading file:', file);
    // Clear selected file and close dialog
    setFile(null);
    setFileName('');
    onClose();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleChooseFileClick = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography sx={{ fontFamily: 'Inter', fontSize: 25, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
          Upload Your Photo
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{ 
            border: '2px dashed',
            borderColor: dragging ? 'primary.main' : 'text.secondary',
            borderRadius: '4px',
            padding: '20px',
            textAlign: 'center',
            transition: 'border-color 0.2s ease-in-out'
          }}
        >
          <IconButton color="black" aria-label="upload picture" component="span" onClick={handleChooseFileClick}>
            <CloudUploadIcon fontSize="large" />
          </IconButton>
          <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: '300', color: 'black' }}>
            Click to Upload A or Drag & Drop Here
          </Typography>
          <Divider style={{ margin: '10px 0', width: '100%' }} />
         
          <TextField
            label="File Name"
            variant="outlined"
            fullWidth
            size="small"
            style={{ marginBottom: '10px' }}
            value={fileName}
            disabled
          />
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={(event) => handleFileChange(event.target.files[0])}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} >
        <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'red' }}>
            Cancel
          </Typography>
        </Button>
        <Button onClick={handleUpload} color="primary" disabled={!file}>
        <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: file ? 'black' : 'gray' }}>
            Upload
          </Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadPhoto;