# Kwitch
A service for streaming on the modern web browser only.

Try it online at https://kwitch.online

# Prerequisites
- Node.js version >= v18.0.0
- pnpm for package management (Install via `npm install -g pnpm`)
- mediasoup requirements
  - Python version >= 3.7 with PIP
  - Linux, OSX and *NIX Systems
    - `gcc` and `g++` >= 8 or `clang` (with C++17 support)
    - `cc` and `c++` commands (symlinks) pointing to the corresponding `gcc`/`g++` or `clang`/`clang++` executables
  - Windows
    - Microsoft Visual Studio environment with MSVC compiler (with C++17 support).

> see in https://mediasoup.org/documentation/v3/mediasoup/installation/

# Installation and Running the Project
1. Clone the repository:
```bash
git clone https://github.com/team-kwitch/kwitch.git
cd kwitch
```

3. Install dependencies:
```bash
pnpm install
```

4. Running the Project
```bash
pnpm dev
```

# Related posts (in korean)
https://velog.io/@sukjuhong/series/Kwitch

# Licence
This project is licensed under the MIT License. See the [LICENSE](./LICENCE) file for more details.
