````javascript
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured."
      });
    }

    const body = req.body || {};

    const child = body.child || {};
    const story = body.story || {};
    const memories = body.memories || [];

    if (!child.name) {
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


    // ============================================================
    // PREPARE MEMORIES
    // ============================================================

    const usableMemories = memories
      .map((memory, originalIndex) => {

        if (!memory || typeof memory !== "object") {
          return null;
        }

        if (
          typeof memory.image !== "string" ||
          !memory.image.startsWith("data:image/")
        ) {
          return null;
        }

        return {
          originalIndex,
          memory:
            typeof memory.memory === "string"
              ? memory.memory.trim()
              : "",
          fileName:
            typeof memory.fileName === "string"
              ? memory.fileName
              : "",
          image: memory.image
        };

      })
      .filter(Boolean);


    if (usableMemories.length === 0) {
      return res.status(400).json({
        error: "No readable photos were received."
      });
    }


    // ============================================================
    // STORY SETTINGS
    // ============================================================

    const storyType =
      story.type || "Magical Adventure";

    const setting =
      story.setting || "A magical world";

    const lesson =
      story.lesson || "A positive life lesson";

    const length =
      story.length || "medium";

    const tone =
      story.tone || "warm";


    let pageCount;

    if (length === "short") {
      pageCount = 5;
    } else if (length === "long") {
      pageCount = 10;
    } else {
      pageCount = 8;
    }

    pageCount =
      Math.min(
        pageCount,
        usableMemories.length
      );


    // ============================================================
    // BUILD PHOTO INPUTS
    // ============================================================

    const photoInputs = [];

    usableMemories.forEach((memory, index) => {

      photoInputs.push({
        type: "input_text",
        text: `
PHOTO ${index + 1}

This is real photograph ${index + 1}.

Parent's memory:
${memory.memory || "No written memory was provided."}

Filename:
${memory.fileName || "Not provided."}

Treat this photograph and this memory as one specific
real-life memory. Do not mix it with another photograph.
        `.trim()
      });

      photoInputs.push({
        type: "input_image",
        image_url: memory.image
      });

    });


    // ============================================================
    // SYSTEM PROMPT
    // ============================================================

    const systemPrompt = `
You are the professional children's story engine for
"Once Upon My Child".

Create a personalized children's story using:

1. The child's information.
2. The parent's memories.
3. The actual photographs.
4. The selected story preferences.

The photographs are extremely important.

Study the photographs and use visible details such as:

- surroundings
- activities
- clothing
- toys
- objects
- animals
- scenery
- expressions
- celebrations
- visible actions

Do not invent specific real-world facts that cannot be
supported by the parent's memories or photographs.

Imagination is allowed.

For example:

"Emma imagined the waves were whispering a secret."

This is appropriate.

But do not invent specific family members, resorts,
locations, events or relationships unless provided by
the parent.

The child must remain the main character.

The story must be one continuous adventure rather than
a collection of unrelated photo descriptions.

The selected adventure type must influence the story.

The selected setting must influence the story.

The child's personality should influence their actions.

Favorite things should be included naturally.

The special lesson should emerge naturally through the
adventure.

============================================================

PHOTO MAPPING RULE

Each photograph has a unique number.

PHOTO 1 = first supplied photograph
PHOTO 2 = second supplied photograph
PHOTO 3 = third supplied photograph
and so on.

Never confuse photographs.

Never assign the same photograph to two story pages.

Use the photographs in their original order whenever
possible.

Each story page must correspond to a different supplied
photograph.

============================================================

STORY STRUCTURE

Create:

- an engaging beginning
- an adventure
- a challenge
- discovery
- courage or problem solving
- resolution
- warm emotional ending

The story should feel like a treasured family memory
that has become a magical children's adventure.

============================================================

CHILD

Name: ${child.name}

Age: ${child.age}

Personality:
${child.personality || "Not provided"}

Favorite things:
${child.favorites || "Not provided"}

============================================================

STORY

Adventure:
${storyType}

Setting:
${setting}

Lesson:
${lesson}

Length:
${length}

Tone:
${tone}

============================================================

STORY LENGTH

Create exactly ${pageCount} story pages.

Each page should contain approximately 60–110 words.

Keep the language appropriate for the child's age.

============================================================

OUTPUT FORMAT

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "Story title",
  "subtitle": "Short subtitle",
  "dedication": "Short dedication",
  "pages": [
    {
      "photoIndex": 0,
      "heading": "Page heading",
      "text": "Story text"
    }
  ],
  "ending": "Warm final ending"
}

photoIndex must start at 0.

Each photoIndex must be unique.

Do not use markdown.

Do not use code fences.

Do not include explanations outside the JSON.
`;


    // ============================================================
    // USER PROMPT
    // ============================================================

    const userPrompt = `
Create the personalized story now.

The child is ${child.name}, age ${child.age}.

Adventure:
${storyType}

Setting:
${setting}

Lesson:
${lesson}

Story length:
${length}

Tone:
${tone}

There are ${usableMemories.length} real photographs.

Each photograph is supplied with its matching parent
memory immediately before the photograph.

Use the photographs as visual inspiration.

Make the photographs influence what happens in the
story.

Do not simply describe each photograph.

Connect all selected photographs into one continuous
adventure.

The story should feel personal, magical and emotionally
meaningful.

Return only the JSON requested in the system instructions.
`;


    // ============================================================
    // OPENAI REQUEST
    // ============================================================

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

                ...photoInputs

              ]
            }

          ],

          max_output_tokens: 7000

        })
      }
    );


    // ============================================================
    // OPENAI ERROR
    // ============================================================

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "OPENAI API ERROR:",
        errorText
      );

      return res.status(500).json({
        error:
          "The AI story service returned an error."
      });

    }


    // ============================================================
    // READ RESPONSE
    // ============================================================

    const result =
      await response.json();


    let outputText = "";


    if (
      typeof result.output_text === "string"
    ) {

      outputText =
        result.output_text.trim();

    }


    if (
      !outputText &&
      Array.isArray(result.output)
    ) {

      for (
        const item of result.output
      ) {

        if (
          item &&
          Array.isArray(item.content)
        ) {

          for (
            const content of item.content
          ) {

            if (
              content &&
              content.type === "output_text" &&
              typeof content.text === "string"
            ) {

              outputText += content.text;

            }

          }

        }

      }

      outputText =
        outputText.trim();

    }


    if (!outputText) {

      console.error(
        "EMPTY OPENAI RESPONSE:",
        JSON.stringify(result)
      );

      return res.status(500).json({
        error:
          "The AI returned an empty story."
      });

    }


    // ============================================================
    // CLEAN POSSIBLE MARKDOWN
    // ============================================================

    let cleanText =
      outputText.trim();

    if (cleanText.startsWith("```")) {

      cleanText =
        cleanText
          .replace(/^```(?:json)?/i, "")
          .replace(/```$/i, "")
          .trim();

    }


    // ============================================================
    // PARSE JSON
    // ============================================================

    let storyResult;

    try {

      storyResult =
        JSON.parse(cleanText);

    } catch (error) {

      console.error(
        "JSON PARSE ERROR:",
        error
      );

      console.error(
        "RAW AI OUTPUT:",
        outputText
      );

      return res.status(500).json({
        error:
          "The AI returned an invalid story format."
      });

    }


    // ============================================================
    // VALIDATE STORY
    // ============================================================

    if (
      !storyResult ||
      typeof storyResult !== "object"
    ) {

      return res.status(500).json({
        error:
          "The AI returned an invalid story."
      });

    }


    if (
      !Array.isArray(storyResult.pages)
    ) {

      return res.status(500).json({
        error:
          "The AI did not return story pages."
      });

    }


    // ============================================================
    // REMOVE DUPLICATE PHOTO ASSIGNMENTS
    // ============================================================

    const usedPhotoIndexes =
      new Set();

    const cleanPages = [];


    for (
      const page of storyResult.pages
    ) {

      if (
        !page ||
        typeof page !== "object"
      ) {
        continue;
      }

      const photoIndex =
        Number(page.photoIndex);

      if (
        !Number.isInteger(photoIndex)
      ) {
        continue;
      }

      if (
        photoIndex < 0 ||
        photoIndex >= usableMemories.length
      ) {
        continue;
      }

      if (
        usedPhotoIndexes.has(photoIndex)
      ) {
        continue;
      }

      usedPhotoIndexes.add(
        photoIndex
      );

      cleanPages.push({

        photoIndex,

        heading:
          typeof page.heading === "string"
            ? page.heading
            : "A Special Moment",

        text:
          typeof page.text === "string"
            ? page.text
            : ""

      });

    }


    storyResult.pages =
      cleanPages;


    if (
      storyResult.pages.length === 0
    ) {

      return res.status(500).json({
        error:
          "The AI created a story without usable photo pages."
      });

    }


    // ============================================================
    // SUCCESS
    // ============================================================

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
````
