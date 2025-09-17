import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Modal from "./modal/Modal";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

interface ClassBarProps {
  classes: any;
  setClasses: React.Dispatch<React.SetStateAction<any>>;
}

const API_URL = "http://localhost:8080";

function ClassBar({ classes, setClasses }: ClassBarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  function removeClass(removeId: any) {
    const removedIdList = classes.filter(
      (classCurrent: any) => classCurrent.id !== removeId
    );
    setClasses(removedIdList);
  }

  // allow modal to be opened and closed
  const [isModalOpen, setIsModalOpen] = useState(false);

  function toggleModal() {
    setIsModalOpen(!isModalOpen);
  }

  async function fetchClassFromAPI(
    courseSubject: string,
    courseCatalog: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/classes?subject=${encodeURIComponent(
          courseSubject
        )}&catalog_number=${encodeURIComponent(courseCatalog)}`
      );
      if (!response.ok) throw new Error("Failed to fetch class");
      return await response.json();
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setSnackbarOpen(true);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleAddClass(courseSubject: string, courseCatalog: string) {
    if (courseSubject.trim() !== "") {
      const courseData = await fetchClassFromAPI(courseSubject, courseCatalog);
      if (courseData) {
        setClasses([
          ...classes,
          {
            name: courseSubject + " " + courseCatalog,
            id: courseSubject,
            data: courseData,
          },
        ]);
        setIsModalOpen(false);
      }
    }
  }

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      slotProps={{
        paper: {
          sx: {
            width: 300,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            position: "sticky",
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          HuskyPlan
        </Typography>
        <Divider />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
        <List>
          {classes.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography color="text.secondary">
                    No classes added
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            classes.map((classCurrent: any) => (
              <ListItem
                key={classCurrent.id}
                secondaryAction={
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => removeClass(classCurrent.id)}
                  >
                    Delete
                  </Button>
                }
              >
                <ListItemText primary={classCurrent.name} />
              </ListItem>
            ))
          )}
        </List>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mb: 1 }}
          onClick={toggleModal}
        >
          Add Class
        </Button>
        <Button fullWidth variant="outlined" color="secondary">
          Add Break
        </Button>
      </Box>
      <Modal
        handleAddClass={handleAddClass}
        toggleModal={toggleModal}
        isModalOpen={isModalOpen}
      />

      {/* for error handling */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            pointerEvents: "none",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Drawer>
  );
}

export default ClassBar;
