import { BaseTool } from "langchain/tools";
import prismadb from "@/packages/api/prismadb";

// Define types for tool parameters
type ToolParams = {
  action: string;
  params: Record<string, any>;
  userId: string;
};

// Helper function to get user credentials
async function getUserCredentials(userId: string, service: string) {
  const credentials = await prismadb.userServiceCredentials.findUnique({
    where: {
      userId_service: {
        userId,
        service,
      },
    },
  });

  if (!credentials) {
    throw new Error(`No credentials found for ${service}`);
  }

  return JSON.parse(credentials.credentials as string);
}

// GitHub Tool using LangChain's BaseTool
export const githubTool = new BaseTool({
  name: "github",
  description: "Interact with GitHub repositories, issues, and pull requests",
  func: async ({ action, params, userId }: ToolParams) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const credentials = await getUserCredentials(userId, "github");
    // Use CrewAI's built-in GitHub tool with user credentials
    return await BaseTool.github({
      token: credentials.token,
      action,
      params,
    });
  },
});

// Trello Tool using LangChain's BaseTool
export const trelloTool = new BaseTool({
  name: "trello",
  description: "Manage Trello boards, lists, and cards",
  func: async ({ action, params, userId }: ToolParams) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const credentials = await getUserCredentials(userId, "trello");
    // Use CrewAI's built-in Trello tool with user credentials
    return await BaseTool.trello({
      apiKey: credentials.apiKey,
      token: credentials.token,
      action,
      params,
    });
  },
});

// LinkedIn Tool using LangChain's BaseTool
export const linkedinTool = new BaseTool({
  name: "linkedin",
  description: "Interact with LinkedIn profiles and posts",
  func: async ({ action, params, userId }: ToolParams) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const credentials = await getUserCredentials(userId, "linkedin");
    // Use CrewAI's built-in LinkedIn tool with user credentials
    return await BaseTool.linkedin({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      accessToken: credentials.accessToken,
      action,
      params,
    });
  },
});

// ClickUp Tool using LangChain's BaseTool
export const clickupTool = new BaseTool({
  name: "clickup",
  description: "Manage ClickUp tasks, spaces, and folders",
  func: async ({ action, params, userId }: ToolParams) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const credentials = await getUserCredentials(userId, "clickup");
    // Use CrewAI's built-in ClickUp tool with user credentials
    return await BaseTool.clickup({
      token: credentials.token,
      action,
      params,
    });
  },
});
