import React from "react"
import { useState } from "react"
import Header from "./components/header/Header.tsx"
import Footer from "./components/footer/Footer.tsx"
import ClassBar from "./components/classbar/ClassBar.tsx"
import CalendarBar from "./components/calendarbar/CalendarBar.tsx"

function App() {

	// track user entries 
	const [classes, setClasses] = useState(
		[
			{
				name: "CSE3300",
				id: "CSE3300"
			},
			{
				name: "MATH2210Q",
				id: "MATH2210Q"
			}

		
		]
	);
	
  return (
    <>
	<Header/>
	<div id="main">
		<ClassBar test={[classes, setClasses]} classes={classes} setClasses={setClasses}/>
		<CalendarBar/>
	</div>
	<Footer/>
    </>
  )
}

export default App
