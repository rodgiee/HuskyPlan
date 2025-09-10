# Local Dev Setup

1. Activate pyvenv & install dependencies: `make setup`
2. To run: `make debug`

# Docker

1. `cd backend`
2. Build image: `docker build -t huskyI .`
3. Run image: `docker run -d --name huskyC -p 80:80 huskyI`
