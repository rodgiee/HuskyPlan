import "./Modal.css";

function Modal(props: any){
	// class useState passed in to add more classes from modal input
	const classes = props.classes;
	const setClasses = props.setClasses;


	// to callback to close out modal
	const toggleModal = props.setModal;

	function handleSubmit(e : any) {
		// Prevent the browser from reloading the page
		e.preventDefault();

		// Read the form data
		const form = e.target;
		const formData = new FormData(form);

		// You can pass formData as a fetch body directly:
		//fetch('/some-api', { method: form.method, body: formData });

		// Or you can work with it as a plain object:
		const formJson = Object.fromEntries(formData.entries());


		// add new class entry to existing list
		const formInput = String(formJson.classInput)
		setClasses(classes.concat(
			{
				name: formInput,
				id: Math.random() * 100 // placeholder, DO NOT USE MATH.random in FINAL PRODUCT
			}
		));

		// clear form input afer submission
		//setInput("");
	  }
	return(
		<>
			<div className="overlay">
				<div className="modal-box">
					<h3 className="modal-header">HuskyPlan Classes</h3>
					<form method="post" onSubmit={handleSubmit}>
						<label>
							Class: <input name="classInput"/>
						</label>
					</form>
					<button onClick={toggleModal} className="modal-close">Close</button>
				</div>
			</div>
		</>
	);

}

export default Modal
