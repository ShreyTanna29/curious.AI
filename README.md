![Screenshot from 2025-03-29 00-36-59](https://github.com/user-attachments/assets/450875aa-acc5-42cd-9f1a-8551261400d5)

# 🤖 curious.ai

A powerful AI platform that combines conversation, code generation, and image generation capabilities using cutting-edge AI models. Visit: https://curiousai.vercel.app

## ✨ Features

- **AI Conversation**: Engage in natural conversations using Google's Gemini Pro model
- **Code Generation**: Generate code snippets with detailed explanations
- **Image Generation**: Create images from text descriptions
- **Authentication**: Secure user authentication with next-auth
- **Modern UI**: Beautiful interface built with Next.js 14 and Tailwind CSS
- **24X7 Customer Support**: resolve doubts or report issues with our dedicated chat support

## 🚀 Getting Started

### Setup using Docker. (Recommended)

1.  Fork this repository
2. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/curious.ai.git
   cd curious.ai
3. Copy <mark>.env.example</mark> in your root folder and rename it to <mark>.env</mark>
4. For the models to work you will need your keys from their respective website, which is easy and free to get. If your work does not include need of api response that this keys are not necceesary to get. If you want google auth to work you need to get your own secret and client Id from their site ( google auth is optional, regular sign in and signup would work just fine, do it only your work is related to it.) 
5. In your terminal, paste this command
   ```bash
   openssl rand -base64 32
   ```
   copy the result and paste it under <mark>NEXT_AUTH_SECRET</mark>
6. **Run**
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

   
Visit http://localhost:3000 to see the application.

🛠️ Built With
- Next.js 15
- TypeScript
- Tailwind CSS
- ShadCN ui
- Next Auth
- Google Generative AI (Gemini)
- Hive AI API
- Zod
- Crisp for customer support
- Postgres database
- Prisma

Don't forget to star ⭐ the repo. <br>
Made with ❤️ by Shrey Tanna
