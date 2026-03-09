import Groq from "groq-sdk";
import prismadb from "@/packages/api/prismadb";

type GenerateImageInput = {
  prompt: string;
  userId: string;
};

const GROQ_API_KEY =
  (process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "").trim();

const HIVE_API_KEY =
  (process.env.HIVE_API_KEY || process.env.EXPO_PUBLIC_HIVE_API_KEY || "").trim();

const HIVE_IMAGE_MODEL = process.env.HIVE_IMAGE_MODEL || "";

const HIVE_MODELS = [
  HIVE_IMAGE_MODEL,
  "black-forest-labs/flux-schnell",
  "black-forest-labs/flux-schnell-enhanced",
  "stabilityai/stable-diffusion-xl-base-1.0",
].filter(Boolean);

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function enhancePromptWithGroq(userPrompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: `You are an expert AI image prompt engineer.
Rewrite the user's idea as a rich, detailed prompt for a diffusion image model.

Rules:
- Describe the subject with specific visual detail
- Include art style (e.g. photorealistic, cinematic, digital art, oil painting, concept art)
- Mention lighting (e.g. golden hour, dramatic rim lighting, soft diffused light, neon glow)
- Add atmosphere/mood (e.g. epic, serene, mystical, gritty)
- Add camera/lens details if relevant (e.g. 35mm lens, wide angle, shallow depth of field, bokeh)
- Keep it under 200 words
- Return ONLY the enhanced prompt. No explanations, no labels, no preamble.`,
      },
      { role: "user", content: userPrompt },
    ],
  });

  const enhanced = completion.choices[0]?.message?.content?.trim();
  if (!enhanced) throw new Error("Groq returned an empty prompt.");
  return enhanced;
}

async function tryHiveModel(model: string, enhancedPrompt: string): Promise<string> {
  const response = await fetch(`https://api.thehive.ai/api/v3/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HIVE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        prompt: enhancedPrompt,
        image_size: { width: 1024, height: 1024 },
        num_inference_steps: 4,
        num_images: 1,
        output_format: "jpeg",
        output_quality: 90,
        seed: Math.floor(Math.random() * 1_000_000),
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hive API error (${response.status}) for ${model}: ${errText}`);
  }

  const data = await response.json();
  const imageUrl: string | undefined = data?.output?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`Hive API returned no image URL for ${model}.`);
  }

  return imageUrl;
}

async function generateWithHive(enhancedPrompt: string): Promise<string> {
  const errors: string[] = [];

  for (const model of HIVE_MODELS) {
    try {
      console.log(`Generating image with Hive AI (${model})...`);
      return await tryHiveModel(model, enhancedPrompt);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Hive error";
      errors.push(message);
      console.warn(`Hive model failed (${model}): ${message}`);
    }
  }

  throw new Error(`All Hive models failed. ${errors.slice(0, 3).join(" | ")}`);
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from CDN: ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

export async function generateAndStoreImage({
  prompt,
  userId,
}: GenerateImageInput): Promise<string> {
  if (!prompt?.trim()) throw new Error("Prompt is required.");
  if (!userId) throw new Error("Unauthorized");
  if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
  if (!HIVE_API_KEY) throw new Error("Missing HIVE_API_KEY");

  console.log("Enhancing prompt with Groq LLaMA 3...");
  const enhancedPrompt = await enhancePromptWithGroq(prompt);
  console.log("Enhanced prompt:", enhancedPrompt);

  const cdnUrl = await generateWithHive(enhancedPrompt);
  console.log("Hive image URL:", cdnUrl);

  const imgBase64 = await fetchImageAsBase64(cdnUrl);

  await prismadb.image.create({
    data: {
      userId,
      url: imgBase64,
      prompt,
    },
  });

  return imgBase64;
}
