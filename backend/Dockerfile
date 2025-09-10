
FROM python:3.13.6


WORKDIR /code

# note to self: this is a pre optimization we can make to cache the requirements and therefore package dependencies 
# works in layers
COPY ./requirements.txt /code/requirements.txt


RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


COPY ./ /code/backend


CMD ["fastapi", "run", "backend/main.py", "--port", "80"]