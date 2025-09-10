import { useState } from "react";
import "./ClassBar.css"
import Modal from "./modal/Modal";

function ClassBar(props : any){

	// passed from parent App.tsx
	// classbar has classes to display user added classes on classbar
	const classes = props.classes
	const setClasses = props.setClasses

	// for each inputted class wrap in HTML 
	// allow delete for each button (deletes are based on class id) 
	const mappedClasses = classes.map((classCurrent : any) => 
						<li className="class">
							<p className="class name">{classCurrent.name}</p>
							<button onClick={() => removeClass(classCurrent.id)}>delete</button>
						</li>
					 );

	function removeClass(removeId : any){
		const removedIdList = classes.filter((classCurrent : any) => classCurrent.id !== removeId);

		setClasses(removedIdList);
	}

	// allow modal to be opened and closed
	const [isModalOpen, setModal] = useState(false)
	function toggleModal(){
		setModal(!isModalOpen);
	}

	return(
		<>
			<div className="classbar">
				<div>{mappedClasses}</div>
				<button onClick={toggleModal} className="button"> Add Class</button>
				{isModalOpen && <Modal classes={classes} setClasses={setClasses} setModal={toggleModal}/>}
			</div>
		</>
	);
}

export default ClassBar
