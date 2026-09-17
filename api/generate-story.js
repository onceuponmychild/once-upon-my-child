```javascript
export default async function handler(req, res) {

  // ============================================================
  // METHOD CHECK
  // ============================================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    // ============================================================
    // API KEY
    // ============================================================

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured."
      });
    }


    // ============================================================
    // READ REQUEST
    // ============================================================

    const {
      child,
      story,
      memories
    } = req.body || {};


    // ============================================================
    // VALIDATION
    // ============================================================

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


    // ============================================================
    // NORMALIZE MEMORIES
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
          index: originalIndex,
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
      story?.type ||
      "Magical Adventure";

    const setting =
      story?.setting ||
      "A magical world";

    const lesson =
      story?.lesson ||
      "A positive life lesson";

    const length =
      story?.length ||
      "medium";

    const tone =
      story?.tone ||
      "warm";


    // ============================================================
    // DETERMINE PAGE COUNT
    //
    // We want the story to use the actual photos instead of
    // repeatedly assigning the same photo to multiple pages.
    // ============================================================

    let maxPages;

    if (length === "short") {

      maxPages = 5;

    } else if (length === "long") {

      maxPages = 10;

    } else {

      maxPages = 8;

    }


    const pageCount =
      Math.min(
        usableMemories.length,
        maxPages
      );


    // ============================================================
    // PREPARE PHOTO + MEMORY INPUTS
    //
    // Each photo is immediately preceded by its identity and
    // parent's memory so the model knows exactly which text
    // belongs to which image.
    // ============================================================

    const photoInputs = [];

    usableMemories.forEach((memory, index) => {

      const photoNumber = index + 1;

      photoInputs.push({
        type: "input_text",
        text: `
PHOTO ${photoNumber}

This is the child's real photograph number ${photoNumber}.

Parent's memory for this photograph:
${memory.memory || "No written memory was provided."}

Filename:
${memory.fileName || "Not provided."}

IMPORTANT:
Treat this photograph and its accompanying memory as one
specific real-life memory. Do not mix it with another photo.
        `.trim()
      });


      photoInputs.push({
        type: "input_image",
        image_url: memory.image,
        detail: "high"
      });

    });


    // ============================================================
    // SYSTEM INSTRUCTIONS
    // ============================================================

    const systemPrompt = `
You are the professional children's story engine for
"Once Upon My Child".

Your job is to transform a child's REAL photographs,
their parent's REAL memories, and the parent's selected
story preferences into a beautiful personalized children's
storybook.

The result should feel like a treasured family story.

============================================================
CORE PRINCIPLE
============================================================

REAL MEMORY + REAL PHOTO + IMAGINATION = PERSONAL STORY

The parent's memories and the visible content of the
photographs are the foundation.

You may add imaginative elements to turn the memory into
a magical children's story.

However, you must NOT invent specific real-world facts
about the family.

For example:

Allowed:
"Emma imagined that the waves were whispering a secret."

Not allowed:
"Emma stayed at the Ocean View Resort with her grandparents."

unless the parent actually provided that information.

============================================================
PHOTO UNDERSTANDING
============================================================

Study every supplied photograph carefully.

Use visible details when appropriate, including:

- surroundings
- beach, park, home or other visible setting
- clothing
- toys
- objects
- animals
- activities
- visible expressions
- scenery
- weather
- celebrations
- visible relationships
- actions
- colors
- recognizable physical elements

Do NOT claim to know someone's identity, relationship,
location or private information solely from appearance.

If something is uncertain, keep the description general.

============================================================
MEMORY MAPPING
============================================================

Each supplied photo has a unique PHOTO NUMBER.

PHOTO 1 must remain PHOTO 1.

PHOTO 2 must remain PHOTO 2.

PHOTO 3 must remain PHOTO 3.

And so on.

Never confuse one photograph with another.

The parent's memory associated with a photograph belongs
only to that photograph.

============================================================
STORY STRUCTURE
============================================================

Create one continuous story.

Do NOT write disconnected descriptions of photographs.

The story should have:

1. A strong opening
2. A reason for the adventure
3. A developing adventure
4. A meaningful challenge
5. A moment of discovery or courage
6. A satisfying resolution
7. A warm emotional ending

The child must remain the central character.

The selected adventure type should influence the world,
events and style of the story.

============================================================
CHILD AGE
============================================================

Adapt the vocabulary, sentence length and complexity to
the child's age.

Younger children:
- simple vocabulary
- short sentences
- repetition
- playful descriptions

Older children:
- richer descriptions
- more developed dialogue
- more sophisticated adventure

Never make the story frightening or inappropriate for
the child's age.

============================================================
PERSONALITY
============================================================

Use the child's personality naturally.

Do not simply repeat the personality words.

Instead, demonstrate them through actions.

For example:

If the child is described as curious,
show them exploring.

If they are described as funny,
give them playful moments.

If they are adventurous,
let them make brave choices.

============================================================
FAVORITE THINGS
============================================================

Use favorite things naturally.

Do not force every favorite into the story.

Only include them when they fit organically.

============================================================
SPECIAL MESSAGE
============================================================

The parent's lesson should emerge naturally from the
story.

Do not turn the story into a lecture.

The child should discover the lesson through the adventure.

============================================================
PHOTO USAGE RULE
============================================================

Each story page must use a DIFFERENT supplied photograph.

Never assign the same photoIndex to two different pages.

Use photos in a logical narrative sequence.

Prefer the original upload order unless the visible
content strongly suggests another sequence.

Every selected photograph should meaningfully influence
the story.

If there are more photographs than the selected story
length allows, choose the photographs that contribute
most strongly to the narrative.

Never invent additional photographs.

============================================================
STORY LENGTH
============================================================

The requested story should contain exactly the requested
number of story pages.

The number of pages is:

${pageCount}

Each page should contain approximately 90–150 words,
depending on the child's age.

Do not make every page the same length.

============================================================
TONE
============================================================

Requested tone:

${tone}

Keep the story:

- warm
- emotionally positive
- imaginative
- playful
- family-friendly
- suitable for a keepsake book

============================================================
OUTPUT
============================================================

Return ONLY the structured JSON requested by the schema.

Do not return:

- markdown
- code fences
- explanations
- commentary
- notes
- analysis
- extra fields

The story should feel professionally written and
publication-ready.
`;


    // ============================================================
    // USER PROMPT
    // ============================================================

    const userPrompt = `
Create a personalized children's storybook using the
child information, story preferences, parent memories,
and photographs provided below.

============================================================
CHILD
============================================================

Name:
${child.name}

Age:
${child.age}

Personality:
${child.personality || "Not provided"}

Favorite things:
${child.favorites || "Not provided"}


============================================================
STORY PREFERENCES
============================================================

Adventure:
${storyType}

Setting:
${setting}

Special message:
${lesson}

Story length:
${length}

Tone:
${tone}


============================================================
PHOTOGRAPHIC MEMORIES
============================================================

There are ${usableMemories.length} real photographs.

Each photograph is labeled PHOTO 1, PHOTO 2, PHOTO 3,
and so on in the visual input.

Use those photographs together with their matching
parent memories to create one continuous story.

Do not duplicate a photograph across story pages.

The story should feel as though the child's real day
has become a magical adventure.

The magical elements should enhance the real memories,
not replace them.

Make the ending emotionally connect back to the
special message:

${lesson}
`;


    // ============================================================
    // STRUCTURED OUTPUT SCHEMA
    // ============================================================

    const storySchema = {

      type: "object",

      additionalProperties: false,

      properties: {

        title: {
          type: "string"
        },

        subtitle: {
          type: "string"
        },

        dedication: {
          type: "string"
        },

        pages: {

          type: "array",

          minItems: pageCount,

          maxItems: pageCount,

          items: {

            type: "object",

            additionalProperties: false,

            properties: {

              photoIndex: {
                type: "integer",
                minimum: 0,
                maximum: usableMemories.length - 1
              },

              heading: {
                type: "string"
              },

              text: {
                type: "string"
              }

            },

            required: [
              "photoIndex",
              "heading",
              "text"
            ]

          }

        },

        ending: {
          type: "string"
        }

      },

      required: [
        "title",
        "subtitle",
        "dedication",
        "pages",
        "ending"
      ]

    };


    // ============================================================
    // OPENAI REQUEST
    // ============================================================

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "Authorization":
            `Bearer ${apiKey}`

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


          text: {

            format: {

              type: "json_schema",

              name: "once_upon_my_child_story",

              description:
                "A personalized children's storybook based on real family memories and photographs.",

              strict: true,

              schema: storySchema

            }

          },


          max_output_tokens: 7000

        })

      }
    );


    // ============================================================
    // OPENAI ERROR HANDLING
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
    // READ OPENAI RESPONSE
    // ============================================================

    const result =
      await response.json();


    // ============================================================
    // EXTRACT OUTPUT TEXT
    // ============================================================

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
        const outputItem of result.output
      ) {

        if (
          outputItem &&
          Array.isArray(outputItem.content)
        ) {

          for (
            const contentItem
              of outputItem.content
          ) {

            if (
              contentItem &&
              contentItem.type ===
                "output_text" &&
              typeof contentItem.text ===
                "string"
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


    // ============================================================
    // EMPTY RESPONSE
    // ============================================================

    if (!outputText) {

      console.error(
        "OPENAI RESPONSE:",
        JSON.stringify(result)
      );

      return res.status(500).json({
        error:
          "The AI returned an empty story."
      });

    }


    // ============================================================
    // PARSE JSON
    // ============================================================

    let storyResult;

    try {

      storyResult =
        JSON.parse(outputText);

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
        error:
          "The AI returned an invalid story format."
      });

    }


    // ============================================================
    // FINAL STORY VALIDATION
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
    //
    // This is an additional safety layer. The AI is instructed
    // not to duplicate photos, but the server also checks.
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


    // ============================================================
    // FINAL RESPONSE
    // ============================================================

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
```
