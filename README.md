# Kwitch
A service for streaming on the modern web browser only.

Try it online at https://kwitch.online

![vercel com_sukjuhongs-projects_kwitch-web](https://github.com/user-attachments/assets/c8c54442-d419-444d-b845-f0fdb11ee540)

## Showcase
- Stream manager screen
  ![image](https://github.com/user-attachments/assets/55ae2819-a2c1-4aaf-bee4-9f44009ea730)

- Viewer screen
  ![image](https://github.com/user-attachments/assets/4c275450-fc73-488c-b16e-b0795e4e4492)

# Prerequisites
> [!TIP]
> This project leverages Dev Containers to provide a consistent and automated development environment. By using Dev Containers, you can save time on setting up dependencies and ensure that all contributors are working within the same environment.

- Docker
- Visual Studio Code (VS Code)
  - Dev Containers Extension

# Running the Project with Dev Containers
1. Install Visual Studio Code (VS Code) and the Dev Containers Extension.

2. Clone the repository:
```bash
git clone https://github.com/team-kwitch/kwitch.git
cd kwitch
```

3. Open the project folder in VS Code.

4. Open the VS Code command palette (Ctrl+Shift+P) and select Dev Containers: Reopen in Container.

5. The Dev Container will be set up, and all necessary dependencies will be installed automatically.

6. Open a terminal within the Dev Container and run the project:
```bash
pnpm dev
```

> [!WARNING]
> If you are not using Dev Containers, you need to set up the environment with pnpm, PostgreSQL, and Redis. Additionally, you must follow the Prerequisites listed in the [mediasoup installation documentation](https://mediasoup.org/documentation/v3/mediasoup/installation/).

# Related posts (in korean)
https://velog.io/@sukjuhong/series/Kwitch

# Licence
This project is licensed under the MIT License. See the [LICENSE](./LICENCE) file for more details.
