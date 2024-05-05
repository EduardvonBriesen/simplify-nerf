# Simplify NeRF

## About The Project

Simplify NeRF provides a straightforward web interface to use [Nerfstudio](https://github.com/nerfstudio-project/nerfstudio/), a platform for training and rendering NeRF models. Users can upload images to generate 3D models seamlessly. The project is developed with React, tRPC, and Docker.

## Quick Start

Follow these steps to set up the project on your local machine and start training your NeRF model.

### 1. Setup and Installation

#### Prerequisites

Ensure Docker is installed on your machine. Download it from [Docker](https://www.docker.com/products/docker-desktop), or consider alternatives like [Podman](https://podman.io/).

#### Installation

Clone the repository and navigate to the project directory:

```sh
git clone https://github.com/Simplifying-NeRF/Simplifying-NeRF.git
cd Simplifying-NeRF
```

Build the Docker image:

```sh
docker compose build
```

#### Starting the Project

Launch the project with:

```sh
docker compose up -d
```

Access the web interface at [http://localhost:4173](http://localhost:4173).

### 2. Training a NeRF Model

To train a NeRF model, proceed with the following:

1. Create a new project.
2. Upload your images or a video.
3. Initiate pre-processing.
4. Begin model training.
5. Utilize the Viewer to explore the model.

## Development

Start by installing project dependencies:

```sh
pnpm install
```

To launch the development server:

```sh
pnpm dev
```

You can now access the project at [http://localhost:5173](http://localhost:5173).

### Configuration

Configure the project by creating a `.env` file at the root. The following environment variables are customizable:

- `VITE_PORT_SERVER`: HTTP server port (default: 3000).
- `VITE_PORT_SOCKET`: WebSocket server port (default: 3001).
- `PORT_FRONTEND`: Frontend server port (default: 5173).
- `WORKSPACE`: Directory for project workspace (default: `/workspace`).

For production settings, use a `.env.prod` file.

### Project Structure

#### Frontend

Built with React and Tailwind CSS, the frontend includes:

- `src/assets`: Project assets.
- `src/components`: React components.
- `src/config`: Configuration for training and pre-processing parameters.
- `src/layouts`: Layout components.
- `src/routes`: Application routes.
- `src/utils`: tRPC setup.

#### Backend

The backend, powered by tRPC, manages API requests and interfaces with Nerfstudio CLI:

- `src/router`: API request routers.
- `src/utils`: Utility functions for API management.

### Docker

The application utilizes Docker for deployment:

- **Dockerfile**: Constructs the project's Docker image.
- **docker-compose.yml**: Manages project startup, including volume mounts and port configurations.

The base image is [dromni/nerfstudio:1.0.2](https://hub.docker.com/r/dromni/nerfstudio/), enhanced with patches from the `./patches` directory for improved project compatibility.
