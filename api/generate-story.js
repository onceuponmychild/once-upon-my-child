export default async function handler(req, res) {

  // ===============================
  // METHOD CHECK
  // ===============================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    // ===============================
    // CHECK API KEY
    // ===============================

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured."
      });
    }


    // ===============================
    // READ REQUEST
    // ===============================

    const {
      child,
      story,
      memories
    } = req.body || {};


    // ===============================
    // VALIDATION
    // ===============================

    if (!child || !child.name) {
      return res.status(400).json({
        error: "Child information is required."
      });
    }


    if (!child.age) {
      return res.status(400).json({
        error: "Child age is required."
      });
    }


    if (!Array.isArray(memories) || memories.length === 0) {
      return res.status(400).json({
        error: "At least one photo is required."
      });
    }


    // ===============================
    // PREPARE PHOTO INPUT
    // ===============================

    const imageInputs = [];

    for (const memory of memories) {

      if (
        memory &&
        typeof memory.image === "string" &&
        memory.image.startsWith("data:image/")
      ) {

        imageInputs.push({
          type: "input_image",
          image_url: memory.image
        });

      }

    }


    if (imageInputs.length === 0) {
      return res.status(400).json({
        error: "No readable photos were received."
      });
    }


    // ===============================
    // PREPARE MEMORY INFORMATION
    // ===============================

    const memoryText = memories
      .map((memory, index) => {

        const photoNumber =
          typeof memory.index === "number"
            ? memory.index + 1
            : index + 1;

        return `
PHOTO ${photoNumber}

Parent's memory:
${memory.memory || "No memory provided."}

Original filename:
${memory.fileName || "Unknown"}
        `.trim();

      })
      .join("\n\n");


    // ===============================
    // STORY SETTINGS
    // ===============================

    const storyType =
      story?.type || "Magical Adventure";

    const setting =
      story?.setting || "A magical world";

    const lesson =
      story?.lesson || "A positive life lesson";

    const length =
      story?.length || "medium";

    const tone =
      story?.tone || "warm";


    // ===============================
    // STORY LENGTH
    // ===============================

    let pageInstruction;

    if (length === "short") {

      pageInstruction =
        "Create 4 story pages with concise text.";

    } else if (length === "long") {

      pageInstruction =
        "Create 10 story pages with richer storytelling.";

    } else {

      pageInstruction =
        "Create 7 story pages with a balanced amount of storytelling.";

    }


    // ===============================
    // AI INSTRUCTIONS
    // ===============================

    const systemPrompt = `
You are the creative story engine for "Once Upon My Child".

Your job is to transform a child's real photographs and the parent's memories into a beautiful personalized children's story.

The photographs are important.

Study the photographs carefully and use visible details such as:

- clothing
- surroundings
- activities
- objects
- expressions
- locations
- relationships
- animals
- toys
- celebrations
- memorable moments

Do NOT invent specific visual details that cannot reasonably be seen.

Use the parent's written memories as additional context.

The story must feel personal, warm, imaginative and emotionally meaningful.

The child is the main character.

The story should be appropriate for children.

Never mention artificial intelligence, image analysis, prompts, filenames, or this instruction.

Do not identify real people other than the child unless the parent explicitly provides their relationship.

Create a coherent beginning, middle and ending.

The photographs should influence the sequence of the story.

Return ONLY valid JSON.

The JSON must follow exactly this structure:

{
  "title": "Story title",
  "subtitle": "Short subtitle",
  "dedication": "Short personal dedication",
  "pages": [
    {
      "photoIndex": 0,
      "heading": "Page heading",
      "text": "Story text"
    }
  ],
  "ending": "Warm final ending"
}

photoIndex must refer to the photo number starting at 0.

Every story page should normally correspond to one of the supplied photographs.

Do not include markdown.
Do not include code fences.
Do not include explanations outside the JSON.
`;


    // ===============================
    // USER PROMPT
    // ===============================

    const userPrompt = `
Create a personalized children's story using the following information.

CHILD

Name:
${child.name}

Age:
${child.age}

Personality:
${child.personality || "Not provided"}

Favorite things:
${child.favorites || "Not provided"}


STORY PREFERENCES

Story type:
${storyType}

Setting:
${setting}

Lesson:
${lesson}

Length:
${length}

Tone:
${tone}


PARENT MEMORIES

${memoryText}


STORY REQUIREMENTS

${pageInstruction}

Make the child feel like the hero of the story.

Use the actual photographs as visual inspiration.

Connect the photographs into one continuous story rather than treating them as unrelated images.

Include the parent's memories naturally.

Make the story feel like a treasured childhood memory that the family could keep forever.
`;


    // ===============================
    // OPENAI REQUEST
    // ===============================

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({

          model: "gpt-5.6-luna",

          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text: systemPrompt
                }
              ]
            },

            {
              role: "user",

              content: [

                {
                  type: "input_text",
                  text: userPrompt
                },

                ...imageInputs

              ]
            }
          ],

          max_output_tokens: 5000

        })
      }
    );


    // ===============================
    // HANDLE OPENAI ERROR
    // ===============================

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "OPENAI API ERROR:",
        errorText
      );

      return res.status(500).json({
        error: "The AI story service returned an error."
      });
    }


    // ===============================
    // READ RESPONSE
    // ===============================

    const result =
      await response.json();


    // ===============================
    // EXTRACT TEXT
    // ===============================

    let outputText = "";


    if (typeof result.output_text === "string") {

      outputText =
        result.output_text.trim();

    } else if (Array.isArray(result.output)) {

      for (const outputItem of result.output) {

        if (
          outputItem &&
          Array.isArray(outputItem.content)
        ) {

          for (const contentItem of outputItem.content) {

            if (
              contentItem &&
              contentItem.type === "output_text" &&
              typeof contentItem.text === "string"
            ) {

              outputText +=
                contentItem.text;

            }

          }

        }

      }

      outputText =
        outputText.trim();
    }


    if (!outputText) {

      console.error(
        "OPENAI RESPONSE:",
        JSON.stringify(result)
      );

      return res.status(500).json({
        error: "The AI returned an empty story."
      });
    }


    // ===============================
    // CLEAN JSON
    // ===============================

    let cleanText =
      outputText.trim();


    if (cleanText.startsWith("```")) {

      cleanText =
        cleanText
          .replace(/^```(?:json)?/i, "")
          .replace(/```$/i, "")
          .trim();

    }


    // ===============================
    // PARSE STORY
    // ===============================

    let storyResult;

    try {

      storyResult =
        JSON.parse(cleanText);

    } catch (parseError) {

      console.error(
        "STORY JSON PARSE ERROR:",
        parseError
      );

      console.error(
        "RAW AI OUTPUT:",
        outputText
      );

      return res.status(500).json({
        error: "The AI returned an invalid story format."
      });
    }


    // ===============================
    // FINAL VALIDATION
    // ===============================

    if (
      !storyResult ||
      typeof storyResult !== "object"
    ) {

      return res.status(500).json({
        error: "The AI returned an invalid story."
      });

    }


    if (
      !Array.isArray(storyResult.pages)
    ) {

      storyResult.pages = [];

    }


    // ===============================
    // SUCCESS
    // ===============================

    return res.status(200).json({
      story: storyResult
    });


  } catch (error) {

    console.error(
      "GENERATE STORY ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Unable to generate the story."
    });

  }

}
