
# Qsofte Website Development

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Description

![Architecture Diagram](./Flowcharts.png)

## Table of Contents

- [Setup Local Dev Environment](#setup-local-dev-environment)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)


## Setup Local Dev Environment

1. **Prerequisites**:
    - **Install an IDE**: We recommend [VS Code](https://code.visualstudio.com/).
    - **Install Node.js**: Download and install it from [nodejs.org](https://nodejs.org/).
    - **Install Git**: Download and install Git from [git-scm.com](https://git-scm.com/).

2. **Steps**:

    1. Clone the repository:
        ```bash
        git clone <repository-link>
        ```
    2. Navigate to the repository directory:
        ```bash
        cd <repository-directory>
        ```
    3. Install npm dependencies:
        ```bash
        npm install
        ```
    4. Create a new branch:
        ```bash
        git checkout -b <branch-name>
        ```
    5. Make changes to the repository.

    6. Stage changes for commit:
        ```bash
        git add <file-name>
        ```
    7. Commit changes:
        ```bash
        git commit -m "Your commit message"
        ```
    8. Run the project:
        ```bash
        npm start
        ```
    9. Push changes to the remote repository:
        ```bash
        git push origin <branch-name>
        ```
    10. Create a pull request with the branch.

### Explanation of Commands

1. **Clone the repository**:
    ```bash
    git clone <repository-link>
    ```
    This command copies the remote repository to your local machine.

2. **Navigate to the repository directory**:
    ```bash
    cd <repository-directory>
    ```
    Changes the current directory to the repository directory.

3. **Install npm dependencies**:
    ```bash
    npm install
    ```
    Installs all the dependencies listed in the `package.json` file.

4. **Create a new branch**:
    ```bash
    git checkout -b <branch-name>
    ```
    Creates a new branch and switches to it.

5. **Make changes to the repository**: Modify the files as needed.

6. **Stage changes for commit**:
    ```bash
    git add <file-name>
    ```
    Adds the specified file(s) to the staging area, preparing them for a commit.

7. **Commit changes**:
    ```bash
    git commit -m "Your commit message"
    ```
    Commits the staged changes with a descriptive message.

8. **Run the project**:
    ```bash
    npm start
    ```
    Starts the application.

9. **Push changes to the remote repository**:
    ```bash
    git push origin <branch-name>
    ```
    Pushes the committed changes to the remote repository.

10. **Create a pull request**: Use GitHub or another Git hosting service to create a pull request from the new branch.

## Dockerize Node.js (React App)

1. **Create a Dockerfile**: Ensure you have an appropriate Dockerfile for your project.

2. **Build the Docker image**:
    ```bash
    ild --platform="linux/amd64" -tdocker bu qsofte:<version> .
    ```

    - Replace `<version>` with the version you are building, e.g., `v0.10`.

    This command is used to build a Docker image from a Dockerfile. Here's what each part of the command does:
    - `docker build`: This is the command to build a Docker image.
    - `--platform="linux/amd64"`: This option specifies the platform the Docker image is built for. In this case, it's built for Linux systems with AMD64 architecture.
    - `-t qsofte:<version>`: This option is used to tag the Docker image with a name and a version. In this case, the name of the image is `qsofte` and the version is `<version>`.
    - `.`: This specifies the build context, which is the location of the Dockerfile and any files that are being copied into the Docker image. In this case, it's the current directory.

3. **Tag the Docker image**:
    ```bash
    docker tag qsofte:<version> qsofte/qsofte:<version>
    ```

    - Replace `<version>` with your image version, e.g., `v0.10`.

4. **Push the Docker image to Docker Hub**:
    ```bash
    docker push qsofte/qsofte:<version>
    ```

    - Replace `<version>` with your image version, e.g., `v0.11`.

## Testing the Docker Image on a VPS Server

1. **SSH into your VPS and sudo**:
    ```bash
    ssh user@TestBoxIp
    sudo su 
    ```

2. **Pull the Docker image from Docker Hub**:
    ```bash
    docker pull qsofte/qsofte:<version>
    ```

    - Replace `<version>` with the version you want to pull, e.g., `v0.11`.

3. **Run the Docker container**:
    ```bash
    docker run -p 8443:5000 -it qsofte/qsofte:<version>
    ```

4. **Verify the container is running**:
    ```bash
    docker ps
    ```

    - This command lists all running containers. You should see `qsofte-container` in the list.

5. **Access your application**:
    - Open a web browser and go to `http://testboxip`. You should see your application running.

## Deploying the Docker Image on a Production Box

Repeat the all steps done for test box but use qsoft.com as the ip instead 

## Usage

Instructions on how to use your project and any relevant examples.

## Contributing

Guidelines on how to contribute to your project and how others can get involved.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

If you have any questions or feedback, feel free to reach out to me at [email@example.com](mailto:email@example.com).
