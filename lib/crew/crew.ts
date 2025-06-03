import { Crew, Agent, Task } from "crewai";
import { githubTool, trelloTool, linkedinTool, clickupTool } from "./tools";

// Define our specialized agents
const githubAgent = new Agent({
  name: "GitHub Expert",
  role: "GitHub Integration Specialist",
  goal: "Help users manage their GitHub repositories, issues, and pull requests effectively",
  backstory:
    "I am an expert in GitHub operations and can help with repository management, issue tracking, and code collaboration.",
  tools: [githubTool],
  verbose: true,
});

const trelloAgent = new Agent({
  name: "Trello Manager",
  role: "Project Management Specialist",
  goal: "Assist users in organizing their work using Trello boards and cards",
  backstory:
    "I specialize in project management and can help organize tasks, track progress, and manage workflows using Trello.",
  tools: [trelloTool],
  verbose: true,
});

const linkedinAgent = new Agent({
  name: "LinkedIn Professional",
  role: "Social Media Specialist",
  goal: "Help users manage their LinkedIn presence and professional networking",
  backstory:
    "I am an expert in professional networking and can help with profile management, content sharing, and connection building on LinkedIn.",
  tools: [linkedinTool],
  verbose: true,
});

const clickupAgent = new Agent({
  name: "ClickUp Organizer",
  role: "Task Management Specialist",
  goal: "Help users organize and track their work using ClickUp",
  backstory:
    "I specialize in task management and can help organize projects, track progress, and manage workflows using ClickUp.",
  tools: [clickupTool],
  verbose: true,
});

// Create a crew with all our agents
export const crew = new Crew({
  agents: [githubAgent, trelloAgent, linkedinAgent, clickupAgent],
  tasks: [], // Tasks will be added dynamically based on user requests
  verbose: true,
});

// Helper function to create tasks based on user requests
export const createTasksFromRequest = (userRequest: string): Task[] => {
  const tasks: Task[] = [];

  // Analyze the user request and create appropriate tasks
  if (userRequest.toLowerCase().includes("github")) {
    tasks.push(
      new Task({
        description: `Handle GitHub related request: ${userRequest}`,
        agent: githubAgent,
      })
    );
  }

  if (userRequest.toLowerCase().includes("trello")) {
    tasks.push(
      new Task({
        description: `Handle Trello related request: ${userRequest}`,
        agent: trelloAgent,
      })
    );
  }

  if (userRequest.toLowerCase().includes("linkedin")) {
    tasks.push(
      new Task({
        description: `Handle LinkedIn related request: ${userRequest}`,
        agent: linkedinAgent,
      })
    );
  }

  if (userRequest.toLowerCase().includes("clickup")) {
    tasks.push(
      new Task({
        description: `Handle ClickUp related request: ${userRequest}`,
        agent: clickupAgent,
      })
    );
  }

  return tasks;
};
