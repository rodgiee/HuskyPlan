import { useState } from "react";
import ClassBar from "./components/classbar/ClassBar.tsx";
import CalendarBar from "./components/calendarbar/CalendarBar.tsx";
import type { CourseSchema } from "./api-client/api.ts";

function App() {
  // track user entries
  const [classes, setClasses] = useState<CourseSchema[]>([]);

  return (
    <div className="flex flex-col min-h-screen w-screen">
      <div className="flex-grow flex min-h-0">
        <ClassBar classes={classes} setClasses={setClasses} />
        <CalendarBar classes={classes} />
      </div>

      {/* <Footer /> */}
    </div>
  );
}

export default App;
