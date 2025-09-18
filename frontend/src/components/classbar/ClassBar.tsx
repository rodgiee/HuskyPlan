import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import AddClassModal from "../modals/AddClassModal";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { DefaultApi, type CourseSchema } from "../../api-client";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import ClassInfoModal from "../modals/ClassInfoModal";

interface ClassBarProps {
  classes: CourseSchema[];
  setClasses: React.Dispatch<React.SetStateAction<any>>;
}

function ClassBar({ classes, setClasses }: ClassBarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [focusedClass, setFocusedClass] = useState<CourseSchema>();
  // Modals
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isClassInfoModalOpen, setIsClassInfoModalOpen] = useState(false);

  function handleRemoveClass(classToRemove: CourseSchema) {
    const filteredClasses = classes.filter(
      (classCurrent: CourseSchema) =>
        classCurrent.subject_code !== classToRemove.subject_code &&
        classCurrent.subject_code !== classToRemove.catalog_number
    );
    setClasses(filteredClasses);
  }

  function handleClassInfo(targetClass: CourseSchema) {
    setFocusedClass(targetClass);
    console.log(targetClass);
    setIsClassInfoModalOpen(true);
  }

  async function handleAddClass(courseSubject: string, courseCatalog: string) {
    if (courseSubject.trim() !== "") {
      const api = new DefaultApi();

      setLoading(true);
      setError(null);

      try {
        const response = await api.classesClassesGet(
          courseSubject,
          courseCatalog
        );

        if (response.status == 200) {
          const courseToAdd = response.data;
          setClasses([...classes, courseToAdd]);
          setIsAddClassModalOpen(false);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "An Unknown Error Occurred.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
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
      {/* Top */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          HuskyPlan
        </Typography>
        <Divider />
      </Box>

      {/* List of Classes */}
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
            classes.map((classCurrent: CourseSchema) => (
              <ListItem
                key={`${classCurrent.subject_code} ${classCurrent.catalog_number}`}
                secondaryAction={
                  <Box>
                    <IconButton
                      size="small"
                      color="info"
                      aria-label="info"
                      onClick={() => {
                        handleClassInfo(classCurrent);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <InfoIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      aria-label="delete"
                      onClick={() => {
                        handleRemoveClass(classCurrent);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={`${classCurrent.subject_code} ${classCurrent.catalog_number}`}
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>

      {/* Bottom Buttons */}
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
          onClick={() => setIsAddClassModalOpen(!isAddClassModalOpen)}
        >
          Add Class
        </Button>
        <Button fullWidth variant="outlined" color="secondary">
          Add Break
        </Button>
      </Box>

      {/* Modals */}
      <AddClassModal
        handleAddClass={handleAddClass}
        isAddClassModalOpen={isAddClassModalOpen}
        setIsAddClassModalOpen={setIsAddClassModalOpen}
      />
      <ClassInfoModal
        isClassInfoModalOpen={isClassInfoModalOpen}
        setIsClassInfoModalOpen={setIsClassInfoModalOpen}
        focusedClass={focusedClass}
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
