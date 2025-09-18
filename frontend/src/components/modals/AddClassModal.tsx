import { useState } from "react";
import MuiModal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface ModalProps {
  setIsAddClassModalOpen: any;
  isAddClassModalOpen: boolean;
  handleAddClass: any;
}

function AddClassModal({
  setIsAddClassModalOpen,
  isAddClassModalOpen,
  handleAddClass,
}: ModalProps) {
  const [courseSubject, setCourseSubject] = useState("");
  const [courseCatalog, setCourseCatalog] = useState("");

  const toggleModal = () => {
    setIsAddClassModalOpen(!isAddClassModalOpen);
  };

  return (
    <MuiModal
      open={isAddClassModalOpen}
      onClose={toggleModal}
      aria-labelledby="add-class-modal-title"
      aria-describedby="add-class-modal-description"
    >
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography id="add-class-modal-title" variant="h6" component="h2">
          Add Class
        </Typography>
        <TextField
          label="Course Catalog"
          value={courseSubject}
          placeholder="e.g. ACCT"
          onChange={(e) => setCourseSubject(e.target.value)}
          autoFocus
        />
        <TextField
          label="Course #"
          placeholder="e.g. 2001"
          value={courseCatalog}
          onChange={(e) => setCourseCatalog(e.target.value)}
          autoFocus
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            toggleModal();
            setCourseCatalog("");
            setCourseSubject("");
            handleAddClass(courseSubject, courseCatalog);
          }}
        >
          Add
        </Button>
        <Button variant="text" color="secondary" onClick={toggleModal}>
          Cancel
        </Button>
      </Paper>
    </MuiModal>
  );
}

export default AddClassModal;
