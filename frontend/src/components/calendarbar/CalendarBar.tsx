import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css"

// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment) // or globalizeLocalizer
import "./CalendarBar.css"



const myEventsList : any = [
	{
		title: "CSE3300 Exam",
		start: new Date(2025, 8, 10, 13, 0), 
		end: new Date(2025, 8, 10, 15, 0),  
	}
]
function CalendarBar(){
	
	return(
		<>
			<div className="calendar">
				<div style= {{height: '500px', width: '800px'}}>
					<Calendar
					localizer={localizer}
					events={myEventsList}
					startAccessor="start"
					endAccessor="end"
					defaultView='week'
					/>
				</div>
			</div>
		</>
	);
}

export default CalendarBar
