## Contributing to Curious.AI

contributers are what makes open source systems beautiful, we are glad that you want to be a part of it. Please follow this guide to contribute in curious.AI

## setup

### Setup using Docker. (Recommended)

1.  Fork this repository
2.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/curious.ai.git
    cd curious.ai
    ```
3.  Copy <mark>.env.example</mark> in your root folder and rename it to <mark>.env</mark>
4.  For the models to work you will need your keys from their respective website, which is easy and free to get. If your work does not include need of api response that this keys are not necceesary to get. If you want google auth to work you need to get your own secret and client Id from their site ( google auth is optional, regular sign in and signup would work just fine, do it only your work is related to it.)
5.  In your terminal, paste this command
    ```bash
    openssl rand -base64 32
    ```
    copy the result and paste it under <mark>NEXT_AUTH_SECRET</mark>
6.  **Run**

    ```bash
    docker-compose up --build
    ```

    OR

    ```bash
    docker compose up --build
    ```

    Sometimes you might face some unusual issue with Docker. In that case, go to `package.json` and change the Next.js version from `15.0.4` to `14.2.18`, as the error is from Next.js itself. Then, rerun the command:

    ```bash
    docker-compose up --build
    ```

### Manual Setup

1. Fork this reopository
2. Clone the repository:

```bash
git clone https://github.com/yourusername/curious.ai.git
```

3. Go to the cloned repo.

```bash
cd curious.ai
```

4. Install the dependencies.

```bash
npm install
```

5. Copy <mark>.env.example</mark> in your root folder and rename it to <mark>.env</mark>
6. For the models to work you will need your keys from their respective website, which is easy and free to get. If your work does not include need of api response that this keys are not necceesary to get. you will also need your postgresql DB url. If you want google auth to work you need to get your own secret and client Id from their site ( google auth is optional, regular sign in and signup would work just fine, do it only your work is related to it.)
7. In your terminal, paste this command
   ```bash
   openssl rand -base64 32
   ```
   copy the result and paste it under <mark>NEXT_AUTH_SECRET</mark>
8. Run the development server:

```bash
npm run dev
```

## Guide on solving issue and Creating a Pull Request

- Before starting to work on any issue, please mention that you are working on that issue in comments of that issue, writing "working on it" is enough, so that maintainers and other contributors don't start to work on it.

- Please don't push code on main branch of your fork, create a new branch and push to it.

## Testing your code before creating a Pull Request

- Before commiting or pushing your code make sure you build the application and have no errors shown, ignore the warnings that show up but make sure errors does not appear.

  run this in command before pushing to github

```bash
npm run build
```

- more on tests comming soon.

### solving doubts

- If you have any doubt regarding issue then ask it on its comments
- If you have any doubt regarding code or setup than ask it in discussion section.
