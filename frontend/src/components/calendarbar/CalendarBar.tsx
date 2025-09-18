import React, { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import type { CourseSchema } from "../../api-client";
import {
  DAYS,
  formatTimeAMPM,
  generateAllSchedules,
  getDayIndex,
  getRandomColor,
  parseEventsFromSections,
  TIME_SLOTS,
  timeToIndex,
  type CalendarEvent,
} from "../../helpers/calendarUtils";

interface CalendarBarProps {
  classes: CourseSchema[];
}

function CalendarBar({ classes }: CalendarBarProps) {
  const allSchedules = useMemo(() => generateAllSchedules(classes), [classes]);
  const [scheduleIdx, setScheduleIdx] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const scheduleCount = allSchedules.length;
  const currentSections = allSchedules[scheduleIdx] || [];
  const events = useMemo(
    () => parseEventsFromSections(currentSections, classes),
    [currentSections, classes]
  );

  // Handlers for flipping schedules
  const handlePrev = () =>
    setScheduleIdx((idx) => (idx - 1 + scheduleCount) % scheduleCount);
  const handleNext = () => setScheduleIdx((idx) => (idx + 1) % scheduleCount);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      {/* Schedule navigation */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: 2, mt: 1, justifyContent: "center" }}
      >
        <Button
          variant="outlined"
          onClick={handlePrev}
          disabled={scheduleCount === 0}
        >
          Previous
        </Button>
        <Typography variant="subtitle1">
          {scheduleCount === 0
            ? "No valid schedules"
            : `Schedule ${scheduleIdx + 1} of ${scheduleCount}`}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleNext}
          disabled={scheduleCount === 0}
        >
          Next
        </Button>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `80px repeat(5, 1fr)`,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            borderRight: 1,
            borderColor: "divider",
            bgcolor: "grey.100",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        {DAYS.map((day) => (
          <Box
            key={day}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              bgcolor: "grey.100",
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontWeight={600}>{day}</Typography>
          </Box>
        ))}
        {/* Time slots and grid */}
        {TIME_SLOTS.map((slot, rowIdx) => (
          <React.Fragment key={slot}>
            {/* Time label */}
            <Box
              sx={{
                borderTop: 1,
                borderRight: 1,
                borderColor: "divider",
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="body2">{formatTimeAMPM(slot)}</Typography>
            </Box>
            {/* Day columns */}
            {DAYS.map((_, colIdx) => {
              // Only render events that start at this cell
              const cellEvents = events.filter(
                (ev: CalendarEvent) =>
                  getDayIndex(ev.day) === colIdx &&
                  timeToIndex(ev.start) === rowIdx
              );
              return (
                <Box
                  key={colIdx}
                  sx={{
                    borderTop: 1,
                    borderRight: 1,
                    borderColor: "divider",
                    height: 40,
                    position: "relative",
                  }}
                >
                  {cellEvents.map((ev: CalendarEvent) => {
                    // Calculate height based on true minute duration
                    function toMin(t: string): number {
                      const [h, m] = t.split(":").map(Number);
                      return h * 60 + m;
                    }
                    const startMin = toMin(ev.start);
                    const endMin = toMin(ev.end);
                    const durationMin = Math.max(endMin - startMin, 20); // fallback min height
                    const slotHeight = 40; // px per 30 min
                    const height = (durationMin / 30) * slotHeight - 4;
                    return (
                      <Tooltip
                        key={ev.id}
                        title={`${ev.subject_code} ${
                          ev.catalog_number
                        }\n${formatTimeAMPM(ev.start)} - ${formatTimeAMPM(
                          ev.end
                        )}`}
                        placement="right"
                        arrow
                      >
                        <Paper
                          elevation={3}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 4,
                            right: 4,
                            height,
                            bgcolor: getRandomColor(
                              ev.subject_code,
                              ev.catalog_number
                            ),
                            color: "#222",
                            zIndex: 2,
                            cursor: "pointer",
                            p: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <Typography fontWeight={700} variant="body2">
                            {ev.subject_code} {ev.catalog_number}
                          </Typography>
                          <Typography variant="caption">
                            {formatTimeAMPM(ev.start)} -{" "}
                            {formatTimeAMPM(ev.end)}
                          </Typography>
                        </Paper>
                      </Tooltip>
                    );
                  })}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
      {/* Modal for event info */}
      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            minWidth: 300,
          }}
        >
          {selectedEvent && (
            <>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {selectedEvent.subject_code} {selectedEvent.catalog_number}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {formatTimeAMPM(selectedEvent.start)} -{" "}
                {formatTimeAMPM(selectedEvent.end)} (
                {DAYS[getDayIndex(selectedEvent.day)]})
              </Typography>
              {/* Add more info here if needed */}
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "inline-block",
                    px: 2,
                    py: 1,
                    bgcolor: getRandomColor(
                      selectedEvent.subject_code,
                      selectedEvent.catalog_number
                    ),
                  }}
                >
                  <Typography variant="caption">Event Color</Typography>
                </Paper>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default CalendarBar;
