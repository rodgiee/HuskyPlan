import { useState } from "react";
import MuiModal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type {
  CourseSchema,
  MeetingSchema,
  SectionProfessorSchema,
  SectionSchema,
} from "../../api-client";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

interface ModalProps {
  setIsClassInfoModalOpen: any;
  isClassInfoModalOpen: boolean;
  focusedClass?: CourseSchema | undefined;
}

function ClassInfoModal({
  setIsClassInfoModalOpen,
  focusedClass,
  isClassInfoModalOpen,
}: ModalProps) {
  const toggleModal = () => {
    setIsClassInfoModalOpen(!isClassInfoModalOpen);
  };

  return (
    <MuiModal
      open={isClassInfoModalOpen}
      onClose={toggleModal}
      aria-labelledby="add-class-modal-title"
      aria-describedby="add-class-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography
          id="focusedClass?-info-title"
          variant="h5"
          fontWeight={700}
          gutterBottom
        >
          {focusedClass?.subject_code} {focusedClass?.catalog_number}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {focusedClass?.subject_desc}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {focusedClass?.description}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Credits: {focusedClass?.min_credits}
          {focusedClass?.max_credits !== focusedClass?.min_credits
            ? ` - ${focusedClass?.max_credits}`
            : ""}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Sections
        </Typography>
        <List>
          {focusedClass?.sections && focusedClass?.sections.length > 0 ? (
            focusedClass?.sections.map((section: SectionSchema) => (
              <Box
                key={section.id}
                sx={{ mb: 2, border: "1px solid #eee", borderRadius: 1, p: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Section: {section.section_catalog}{" "}
                  {section.instruction_type
                    ? `(${section.instruction_type})`
                    : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enrollment: {section.enrollment_total ?? "-"} /{" "}
                  {section.enrollment_cap ?? "-"} | Waitlist:{" "}
                  {section.waitlist_total ?? "-"} /{" "}
                  {section.waitlist_cap ?? "-"}
                </Typography>
                {/* Professors */}
                {section.professors && section.professors.length > 0 && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Professors:
                    </Typography>
                    <List dense>
                      {section.professors.map(
                        (sp: SectionProfessorSchema, idx: number) => (
                          <ListItem key={idx} sx={{ pl: 2 }}>
                            <ListItemText
                              primary={sp.professor?.name || "Unknown"}
                              secondary={
                                sp.role ? `Role: ${sp.role}` : undefined
                              }
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </>
                )}
                {/* Meetings */}
                {section.meetings && section.meetings.length > 0 && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Meetings:
                    </Typography>
                    <List dense>
                      {section.meetings.map(
                        (meeting: MeetingSchema, idx: number) => (
                          <ListItem key={idx} sx={{ pl: 2 }}>
                            <ListItemText
                              primary={
                                meeting.days_of_week &&
                                meeting.days_of_week.length > 0
                                  ? meeting.days_of_week.join(", ")
                                  : "No days"
                              }
                              secondary={[
                                meeting.time_start && meeting.time_end
                                  ? `${meeting.time_start} - ${meeting.time_end}`
                                  : null,
                                meeting.location,
                              ]
                                .filter(Boolean)
                                .join(" | ")}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </>
                )}
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">
              No sections available.
            </Typography>
          )}
        </List>
        <Button
          onClick={toggleModal}
          variant="contained"
          color="primary"
          sx={{ mt: 2, position: "sticky", bottom: "0" }}
          fullWidth
        >
          Close
        </Button>
      </Box>
    </MuiModal>
  );
}

export default ClassInfoModal;
