````javascript
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      child,
      story,
      memories
    } = req.body || {};

    /* ---------------------------------------------------------
       1. BASIC VALIDATION
    --------------------------------------------------------- */

    if (!child || !child.name) {
      return res.status(400).json({
        error: "Child information is required."
      });
    }

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OpenAI API key is not configured."
      });
    }

    /* ---------------------------------------------------------
       2. NORMALIZE PHOTO MEMORIES
    --------------------------------------------------------- */

    let photoMemories = [];

    if (Array.isArray(memories)) {

      photoMemories = memories;

    } else if (
      memories &&
      Array.isArray(memories.photos)
    ) {

      photoMemories =
        memories.photos;

    }

    if (photoMemories.length === 0) {
      return res.status(400).json({
        error: "At least one photo is required.",
        details:
          "The story generator did not receive any photo records."
      });
    }

    /* ---------------------------------------------------------
       3. CHECK THAT ACTUAL IMAGE DATA EXISTS
    --------------------------------------------------------- */

    const usablePhotos =
      photoMemories.filter(function(photo) {

        return (
          photo &&
          typeof photo.image === "string" &&
          photo.image.length > 0
        );

      });

    console.log(
      "Received photo count:",
      photoMemories.length
    );

    console.log(
      "Usable photo count:",
      usablePhotos.length
    );

    console.log(
      "Photo keys:",
      photoMemories.map(function(photo) {
        return photo
          ? Object.keys(photo)
          : [];
      })
    );

    if (usablePhotos.length === 0) {
      return res.status(400).json({
        error:
          "No usable image data was received by the story generator.",
        details:
          "The API received the photo records but no image data was found.",
        receivedPhotoKeys:
          photoMemories.map(function(photo) {
            return photo
              ? Object.keys(photo)
              : [];
          })
      });
    }

    /* ---------------------------------------------------------
       4. STORY SETTINGS
    --------------------------------------------------------- */

    const childName =
      child.name || "the child";

    const childAge =
      child.age || "unknown";

    const personality =
      child.personality ||
      "not specified";

    const favorites =
      child.favorites ||
      "not specified";

    const storyType =
      story && story.type
        ? story.type
        : "Magical Adventure";

    const setting =
      story && story.setting
        ? story.setting
        : "a wonderful place";

    const lesson =
      story && story.lesson
        ? story.lesson
        : "trying again and believing in yourself";

    const length =
      story && story.length
        ? story.length
        : "medium";

    const tone =
      story && story.tone
        ? story.tone
        : "warm";

    const generalMemory =
      memories &&
      !Array.isArray(memories)
        ? (
            memories.general ||
            ""
          )
        : "";

    /* ---------------------------------------------------------
       5. DETERMINE PAGE LIMIT
    --------------------------------------------------------- */

    let maxPages = 8;

    if (length === "short") {
      maxPages = 5;
    }

    if (length === "long") {
      maxPages = 10;
    }

    /*
      We normally want one story page for each photo.
      However, we never exceed the selected story length.
    */

    const targetPages =
      Math.min(
        usablePhotos.length,
        maxPages
      );

    /* ---------------------------------------------------------
       6. BUILD PHOTO INFORMATION
    --------------------------------------------------------- */

    let photoSummary = "";

    usablePhotos.forEach(
      function(photo, index) {

        photoSummary +=
          "\n\nPHOTO " +
          (index + 1) +
          ":\n" +
          "Parent memory: " +
          (
            photo.memory ||
            "No written memory was provided."
          ) +
          "\n";

      }
    );

    /* ---------------------------------------------------------
       7. STORY ENGINE V2 PROMPT
    --------------------------------------------------------- */

    const prompt = `
You are the core storytelling engine for "Once Upon My Child."

Your job is to transform a child's REAL photographs and the parent's REAL memories into one emotionally meaningful children's story.

This is not a generic AI story.

The photographs and memories are the heart of the story.

==================================================
CHILD
==================================================

Name: ${childName}
Age: ${childAge}
Personality: ${personality}
Favorite things: ${favorites}

==================================================
STORY PREFERENCES
==================================================

Adventure type: ${storyType}
Setting: ${setting}
Lesson/theme: ${lesson}
Length: ${length}
Tone: ${tone}

==================================================
GENERAL FAMILY MEMORY
==================================================

${generalMemory || "No general memory was provided."}

==================================================
PHOTO MEMORIES
==================================================

${photoSummary}

==================================================
YOUR PRIMARY OBJECTIVE
==================================================

Create a coherent, personalized children's story based on the actual photographs and memories supplied.

The child must be the central character.

The story should feel like something this particular family experienced together, transformed into a magical story.

Do NOT simply write a generic adventure and attach the photographs afterward.

Instead:

REAL MEMORY
+
REAL PHOTO DETAILS
+
CHILD PERSONALITY
+
IMAGINATION
=
PERSONALIZED STORY

==================================================
PHOTO ANALYSIS RULES
==================================================

Before writing each page, carefully examine the corresponding photograph.

Identify useful visible details such as:

- location
- environment
- clothing
- objects
- people
- animals
- activities
- expressions
- weather
- colors
- surroundings
- actions
- relationships
- notable visual details

Only describe visible details when they are reasonably clear.

Never invent specific factual details and present them as though they definitely happened.

For example, do NOT assume:

- a child was wearing a particular item
- someone said something
- a specific person was present
- an animal existed
- a location was a particular place

unless that information comes from the photo or the parent's memory.

==================================================
MEMORY-FIRST RULE
==================================================

Parent memories are extremely important.

If a parent's written memory says what happened, treat that as the strongest factual source.

You may add imagination around the memory.

You may turn ordinary events into magical events.

But do not contradict the parent's memory.

Example:

Parent memory:
"Emma kept trying to build the sandcastle after it fell down."

Good transformation:

"The little sandcastle collapsed with a soft poof. Emma brushed the sand from her hands and tried again."

Bad transformation:

"Emma gave up and went home."

The magical elements should enhance the memory rather than replace it.

==================================================
PERSONALIZATION
==================================================

Use the child's personality naturally.

If the child is described as:

curious → show curiosity

brave → show courage

funny → allow playful moments

kind → show kindness

adventurous → allow exploration

shy → make courage meaningful

Do not repeatedly state the personality.

Demonstrate it through actions.

Use favorite things naturally when appropriate.

Do not force every favorite into the story.

==================================================
STORY STRUCTURE
==================================================

Create one connected narrative.

The story should have:

1. Opening
   Establish the child, setting and situation.

2. Discovery
   Something interesting or magical begins.

3. Exploration
   The child experiences events connected to the photographs.

4. Challenge
   The child encounters an obstacle.

5. Growth
   The child uses a personal quality or lesson to overcome it.

6. Resolution
   The adventure reaches a satisfying conclusion.

7. Emotional ending
   End with a warm thought connected to the child's real experience.

Do not make every page feel like an independent caption.

Each page should lead naturally into the next.

==================================================
PHOTO ORDER
==================================================

Respect the original photo order.

Photo 1 should normally become page 1.

Photo 2 should normally become page 2.

Photo 3 should normally become page 3.

Continue in order.

Do not reorder photographs unless absolutely necessary for narrative continuity.

Never use the same photo twice.

Every generated page must reference a unique photo.

==================================================
IMAGINATION
==================================================

Imagination is encouraged.

Ordinary objects may become magical.

Examples:

A shell can whisper.

A tree can become a doorway.

A puddle can become an ocean.

A blanket can become a spaceship.

A beach can hide a magical kingdom.

However, magical elements should grow naturally from what the child actually experienced.

The reader should still recognize the real memory underneath the fantasy.

==================================================
WRITING STYLE
==================================================

Write for a child around the supplied age.

Use:

- simple but beautiful language
- short readable paragraphs
- sensory details
- gentle humor
- emotional warmth
- wonder
- age-appropriate vocabulary

Avoid:

- frightening violence
- mature themes
- overly complicated vocabulary
- long exposition
- repetitive descriptions
- generic filler

The tone should feel like a professionally written children's story.

==================================================
PAGE LENGTH
==================================================

Each page should contain approximately 90–160 words.

Short stories may be slightly shorter.

Long stories may be slightly longer.

Do not make pages extremely short.

Do not create huge blocks of text.

==================================================
TITLE
==================================================

Create a memorable title that feels specific to the child's adventure.

Avoid generic titles such as:

"My Magical Adventure"

"Emma's Adventure"

"The Wonderful Day"

Make the title feel like a real children's book.

==================================================
SUBTITLE
==================================================

Create a short subtitle that hints at the adventure.

==================================================
DEDICATION
==================================================

Create a short emotional dedication addressed to the child.

It should feel personal.

Example style:

"For Emma, whose curious heart turns ordinary days into adventures."

Do not copy this exact wording.

==================================================
ENDING
==================================================

The ending should feel emotionally satisfying.

Connect it to the real memory and the lesson.

The final sentence should leave the parent with a feeling that this memory has been preserved.

Avoid generic endings such as:

"And they lived happily ever after."

Instead create a meaningful final moment.

==================================================
IMPORTANT
==================================================

The story should feel like:

"That really happened to my child... but now it feels magical."

NOT:

"This is a generic AI story with my child's name inserted."

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do not include markdown.

Do not include code fences.

Use exactly this structure:

{
  "title": "Story title",
  "subtitle": "Short subtitle",
  "dedication": "Personal dedication",
  "pages": [
    {
      "photoIndex": 0,
      "heading": "Page heading",
      "text": "Story text"
    }
  ],
  "ending": "Final emotional ending"
}

==================================================
OUTPUT REQUIREMENTS
==================================================

Create exactly ${targetPages} story pages.

Each page must have:

- a unique photoIndex
- a heading
- story text

photoIndex is zero-based.

Therefore:

first photo = 0
second photo = 1
third photo = 2

and so on.

Never repeat a photoIndex.

Do not create pages without a corresponding photograph.

The story must read as one continuous narrative.

Return ONLY JSON.
`;

    /* ---------------------------------------------------------
       8. BUILD MULTIMODAL REQUEST
    --------------------------------------------------------- */

    const content = [];

    content.push({
      type: "input_text",
      text: prompt
    });

    usablePhotos.forEach(
      function(photo, index) {

        content.push({
          type: "input_text",
          text:
            "PHOTO " +
            (index + 1) +
            " PARENT MEMORY:\n" +
            (
              photo.memory ||
              "No written memory was provided."
            )
        });

        content.push({
          type: "input_image",
          image_url:
            photo.image
        });

      }
    );

    /* ---------------------------------------------------------
       9. CALL OPENAI
    --------------------------------------------------------- */

    console.log(
      "Sending Story Engine V2 request..."
    );

    const openAIResponse =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${apiKey}`
          },

          body:
            JSON.stringify({
              model:
                "gpt-5.6-luna",

              input: [
                {
                  role: "user",

                  content:
                    content
                }
              ],

              max_output_tokens:
                6000
            })
        }
      );

    /* ---------------------------------------------------------
       10. HANDLE OPENAI RESPONSE
    --------------------------------------------------------- */

    const responseText =
      await openAIResponse.text();

    if (!openAIResponse.ok) {

      console.error(
        "OpenAI error:",
        responseText
      );

      return res.status(
        openAIResponse.status
      ).json({
        error:
          "OpenAI story generation failed.",

        details:
          responseText
      });
    }

    let openAIResult;

    try {

      openAIResult =
        JSON.parse(
          responseText
        );

    } catch (error) {

      console.error(
        "Unable to parse OpenAI response:",
        responseText
      );

      return res.status(500).json({
        error:
          "OpenAI returned an invalid response.",

        details:
          responseText
      });
    }

    /* ---------------------------------------------------------
       11. EXTRACT OUTPUT TEXT
    --------------------------------------------------------- */

    let outputText = "";

    if (
      typeof openAIResult.output_text ===
      "string"
    ) {

      outputText =
        openAIResult.output_text;

    } else if (
      Array.isArray(
        openAIResult.output
      )
    ) {

      openAIResult.output.forEach(
        function(item) {

          if (
            item &&
            Array.isArray(
              item.content
            )
          ) {

            item.content.forEach(
              function(part) {

                if (
                  part &&
                  typeof part.text ===
                    "string"
                ) {

                  outputText +=
                    part.text;
                }

              }
            );
          }

        }
      );

    }

    if (!outputText) {

      console.error(
        "No output text:",
        openAIResult
      );

      return res.status(500).json({
        error:
          "The story generator returned no story."
      });
    }

    /* ---------------------------------------------------------
       12. CLEAN JSON RESPONSE
    --------------------------------------------------------- */

    outputText =
      outputText.trim();

    if (
      outputText.startsWith(
        "```json"
      )
    ) {

      outputText =
        outputText
          .replace(
            /^```json\s*/,
            ""
          )
          .replace(
            /\s*```$/,
            ""
          )
          .trim();

    } else if (
      outputText.startsWith("```")
    ) {

      outputText =
        outputText
          .replace(
            /^```\s*/,
            ""
          )
          .replace(
            /\s*```$/,
            ""
          )
          .trim();
    }

    /* ---------------------------------------------------------
       13. PARSE STORY JSON
    --------------------------------------------------------- */

    let storyResult;

    try {

      storyResult =
        JSON.parse(
          outputText
        );

    } catch (error) {

      console.error(
        "Story JSON parse error:",
        error
      );

      console.error(
        "Raw story output:",
        outputText
      );

      return res.status(500).json({
        error:
          "The AI returned a story in an invalid format.",

        details:
          outputText
      });
    }

    /* ---------------------------------------------------------
       14. VALIDATE STORY
    --------------------------------------------------------- */

    if (
      !storyResult ||
      !Array.isArray(
        storyResult.pages
      )
    ) {

      return res.status(500).json({
        error:
          "The AI returned an incomplete story."
      });
    }

    /* ---------------------------------------------------------
       15. CLEAN AND VALIDATE PAGES
    --------------------------------------------------------- */

    const usedIndexes =
      new Set();

    const cleanedPages = [];

    storyResult.pages.forEach(
      function(page) {

        if (!page) {
          return;
        }

        const photoIndex =
          Number(
            page.photoIndex
          );

        if (
          !Number.isInteger(
            photoIndex
          )
        ) {
          return;
        }

        if (
          photoIndex < 0 ||
          photoIndex >=
            usablePhotos.length
        ) {
          return;
        }

        if (
          usedIndexes.has(
            photoIndex
          )
        ) {
          return;
        }

        const heading =
          typeof page.heading ===
            "string"
            ? page.heading.trim()
            : "";

        const text =
          typeof page.text ===
            "string"
            ? page.text.trim()
            : "";

        if (!text) {
          return;
        }

        usedIndexes.add(
          photoIndex
        );

        cleanedPages.push({
          photoIndex:
            photoIndex,

          heading:
            heading ||
            "A New Adventure",

          text:
            text
        });

      }
    );

    /* ---------------------------------------------------------
       16. SORT PAGES BY PHOTO ORDER
    --------------------------------------------------------- */

    cleanedPages.sort(
      function(a, b) {
        return (
          a.photoIndex -
          b.photoIndex
        );
      }
    );

    if (
      cleanedPages.length === 0
    ) {

      return res.status(500).json({
        error:
          "The AI did not create any usable story pages."
      });
    }

    /* ---------------------------------------------------------
       17. FINAL STORY OBJECT
    --------------------------------------------------------- */

    const finalStory = {

      title:
        storyResult.title ||
        `${childName}'s Adventure`,

      subtitle:
        storyResult.subtitle ||
        "A special adventure to remember",

      dedication:
        storyResult.dedication ||
        `For ${childName}, with love.`,

      pages:
        cleanedPages,

      ending:
        storyResult.ending ||
        `And ${childName} knew that the best adventures were the ones worth remem
````
