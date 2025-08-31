## Abstract
Host a schedule builder that allows users to input their classes into the schedule and visualize what their schedule looks like. 

It should also allow users to select UConn classes from a database, these classes will be scraped from course catalogs snapshot website.

## Minimum Viable Product
- Visual Calendar
- manual class input
	- class name
	- location
	- time/date
- Integrate uconn class database
	- https://scheduling.uconn.edu/class-schedule-snapshot
## Technologies
- Front-End
	- React/Typescript
- Back-End
	- FastAPI
	- python
- Database
	- SQLite (store client data locally)
	- maybe PostgresSQL?
## Extra Features
- auto-generate schedules
- hosting (vercel/aws/self-host?)
	- database of uconn classes
- Filters
	- specifications when to not book classes (ex. no 8ams!)
- pdf schedule importer
	- Extract a user's classes with associated time and location
	- Convert into an importable format `.ics` file
	- Allow users to import their classroom schedules into their own respective calendars
- Add assignment 
- Front-end & Interface
- Website?
- accounts
## Process
- Extract
	- 
- Store
	- 
- Convert
	- `ICS` file

### Extraction
`pdfplumber`
https://www.youtube.com/watch?v=ZEaEH_aQcBE




## Name Ideas
skeduler

HuskyPlan

