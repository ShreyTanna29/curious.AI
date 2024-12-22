## Contributing to Curious.AI

contributers are what makes open source systems beautiful, we are glad that you want to be a part of it. Please follow this guide to contribute in curious.AI

## setup

### docker setup (recommended)

1. ** Fork this Repository**
2. **Clone the Repository**

````bash
git clone https://github.com/yourusername/curious.ai.git
cd curious.ai
```
3. **Fill the appropriate Environment Variables in the docker-compose.yml and environment file, with the help of .env.example**
   you will need all api keys mentioned in .env.example except postgres url.

4.**Run**
```bash
docker-compose up --build
````

OR

```bash
docker compose up --build
```

Sometimes you might face some unusual issue with Docker. In that case, go to `package.json` and change the Next.js version from `15.0.4` to `14.2.18`, as the error is from Next.js itself. Then, rerun the command:

```bash
docker-compose up --build
```

Visit http://localhost:3000 to see the application.

### Manual Setup

1. Frok this Repository
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

5. Set up environment variables:

```bash
GEMINI_API_KEY="Your Gemini API Key"
HIVE_IMAGE_API_KEY="Your Hive AI Key for flux model"
CLERK_SECRET_KEY"Your clerk secret key"
CLERK_PUBLISHABLE_KEY="your clerk publishable key"
POSTGRES_URL="Your Postgres DB url"
```

6. Run the development server:

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
