import { useState } from "react";
import "./ClassBar.css"
import Modal from "../modal/Modal.tsx"

function ClassBar(){

	const [isModalOpen, setModal] = useState(false)

	function toggleModal(){
		setModal(!isModalOpen);
	}

	return(
		<>
			<div className="classbar">
				<button onClick={toggleModal} className="button"> Add Class</button>
				{isModalOpen && <Modal setModal={toggleModal}/>}
			</div>
		</>
	);
}

export default ClassBar
