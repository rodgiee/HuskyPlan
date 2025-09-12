setup:
	source .venv/bin/activate && pip install -r requirements.txt

debug:
	fastapi dev

docker:
	docker build -t husky-image . && docker run -d --name husky-container -p 8080:80 husky-image