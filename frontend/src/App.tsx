import { useState } from "react";
import Header from "./components/header/Header.tsx";
import Footer from "./components/footer/Footer.tsx";
import ClassBar from "./components/classbar/ClassBar.tsx";
import CalendarBar from "./components/calendarbar/CalendarBar.tsx";

function App() {
  // track user entries
  const [classes, setClasses] = useState([
    {
      name: "CSE3300",
      id: "CSE3300",
      data: null,
    },
    {
      name: "MATH2210Q",
      id: "MATH2210Q",
      data: null,
    },
  ]);

  return (
    <div className="flex flex-col min-h-screen w-screen">
      <div className="flex-grow flex min-h-0">
        <ClassBar classes={classes} setClasses={setClasses} />
        <CalendarBar />
      </div>

      {/* <Footer /> */}
    </div>
  );
}

export default App;
