import "./Modal.css"

function Modal(props: any){

	const toggleModal = props.setModal;

	return(
		<>
			<div className="overlay">
				<div className="modal-box">
					<h3 className="modal-header">HuskyPlan Classes</h3>
					<button onClick={toggleModal} className="modal-close">Close</button>
				</div>
			</div>
		</>
	);

}

export default Modal
