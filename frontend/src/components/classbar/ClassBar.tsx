import { useState } from "react";
import "./ClassBar.css"
import Modal from "./modal/Modal";

function ClassBar(){
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

	const mappedClasses = classes.map(classCurrent => 
						<li>
							<p>{classCurrent.name}</p>
							<button className="delete-class" onClick={() => removeClass(classCurrent.id)}>delete</button>
						</li>
					 );

	function removeClass(removeId : any){
		const removedIdList = classes.filter(classCurrent => classCurrent.id !== removeId);

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
				<ul>{mappedClasses}</ul>
				<button onClick={toggleModal} className="button"> Add Class</button>
				{isModalOpen && <Modal classes={classes} setClasses={setClasses} setModal={toggleModal}/>}
			</div>
		</>
	);
}

export default ClassBar
