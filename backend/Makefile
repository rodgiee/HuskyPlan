setup:
	source .venv/bin/activate && pip install -r requirements.txt

debug:
	fastapi run

docker:
	docker build -t husky-image . && docker run -d --name husky-container -p 80:80 husky-image