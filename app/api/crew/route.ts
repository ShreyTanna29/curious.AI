import { NextResponse } from "next/server";
import { crew, createTasksFromRequest } from "@/lib/crew/crew";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Create tasks based on the user's request
    const tasks = createTasksFromRequest(prompt);

    if (tasks.length === 0) {
      return new NextResponse("No relevant tasks found for the given request", {
        status: 400,
      });
    }

    // Update crew with new tasks and user ID
    crew.tasks = tasks.map((task) => ({
      ...task,
      context: { userId: session.user.id },
    }));

    // Execute the crew's tasks
    const result = await crew.kickoff();

    return NextResponse.json({ response: result });
  } catch (error: any) {
    console.error("[CREW_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
