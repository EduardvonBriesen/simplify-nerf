# Simplify NeRF

## About The Project

This project wraps [Nerfstudio](https://github.com/nerfstudio-project/nerfstudio/), a tool for training and rendering NeRF models, into a simple web interface. It allows users to upload their own images and generate 3D models from them. The project is built using React, tRPC, and Docker.

## Quick Start

The quickstart will guide you through setting up the project on your local machine and train a NeRF model.

### 1. Setup and Installation

#### Prerequisites

The project requires Docker to be installed on your machine. You can download [Docker](https://www.docker.com/products/docker-desktop) or use an alternative such as [Podman](https://podman.io/).

#### Installation

You can clone the repository and navigate to the project directory using the following commands:

```sh
  git clone https://github.com/Simplifying-NeRF/Simplifying-NeRF.git
  cd Simplifying-NeRF
```

Then you can build the Docker image using the following command:

```sh
  docker compose build
```

#### Starting the Project

You can start the project using the following command:

```sh
  docker compose up -d
```

This will start the project and you can access it at [http://localhost:4173](http://localhost:4173).

### 2. Training a NeRF Model

You can train a NeRF model by following these steps:

1. Create a new project.
2. Upload a set of images or a video.
3. Start the pre-processing.
4. Train the model.
5. Explore the Viewer.

## Supported Features

<!-- TODO -->

TBD

## Contributing

<!-- TODO -->

TBD
