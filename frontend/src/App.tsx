import Header from "./components/header/Header.tsx"
import Footer from "./components/footer/Footer.tsx"
import ClassBar from "./components/classbar/ClassBar.tsx"
import Calendar from "./components/calendar/Calendar.tsx"

function App() {
	
  return (
    <>
	<Header/>
	<div id="main">
		<ClassBar/>
		<Calendar/>
	</div>
	<Footer/>
    </>
  )
}

export default App
