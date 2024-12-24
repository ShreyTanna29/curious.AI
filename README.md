
![Screenshot from 2024-12-14 20-12-14](https://github.com/user-attachments/assets/d5cc08b7-49c0-47b6-a8a3-2102304df2dc)

# 🤖 curious.ai

A powerful AI platform that combines conversation, code generation, and image generation capabilities using cutting-edge AI models. Visit: https://curiousai.vercel.app

## ✨ Features

- **AI Conversation**: Engage in natural conversations using Google's Gemini Pro model
- **Code Generation**: Generate code snippets with detailed explanations
- **Image Generation**: Create images from text descriptions
- **Authentication**: Secure user authentication with Clerk
- **Modern UI**: Beautiful interface built with Next.js 14 and Tailwind CSS
- **24X7 Customer Support**: resolve doubts or report issues with our dedicated chat support

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/curious.ai.git
```

2. Go to the cloned repo.
```bash
cd curious.ai
```
3. Install the dependencies.
```bash
npm install
```

4. Set up environment variables:
```bash
GEMINI_API_KEY="Your Gemini API Key"
HIVE_IMAGE_API_KEY="Your Hive AI Key for flux model"
CLERK_SECRET_KEY"Your clerk secret key"
CLERK_PUBLISHABLE_KEY="your clerk publishable key"
POSTGRES_URL="Your Postgres DB url"
```
5. Run the development server:
```bash
npm run dev
```

### Steps (Docker)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/curious.ai.git
   cd curious.ai
2. **Fill the appropriate Environment Variables in the docker-compose.yml and environment file, with the help of .env.example**
3. **Run**
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

   
Visit http://localhost:3000 to see the application.

🛠️ Built With
- Next.js 15
- TypeScript
- Tailwind CSS
- ShadCN ui
- Clerk Authentication
- Google Generative AI (Gemini)
- Hive AI API
- Zod
- Crisp for customer support
- Postgres database
- Prisma

Don't forget to star ⭐ the repo. <br>
Made with ❤️ by Shrey Tanna
