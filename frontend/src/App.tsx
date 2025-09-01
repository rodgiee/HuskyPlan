import Header from "./components/Header.tsx"
import Footer from "./components/Footer.tsx"
import ClassBar from "./components/ClassBar.tsx"
import Calendar from "./components/Calendar.tsx"

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
