export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed"
});
}

try {
const apiKey = process.env.OPENAI_API_KEY;

```
if (!apiKey) {
  return res.status(500).json({
    error: "OPENAI_API_KEY is not configured."
  });
}

const { child, story, memories } = req.body || {};

if (!child || !child.name) {
  return res.status(400).json({
    error: "Child information is required."
  });
}

if (!Array.isArray(memories) || memories.length === 0) {
  return res.status(400).json({
    error: "At least one photo is required."
  });
}

/*
  Keep only usable memories/photos.
*/
const usableMemories = memories
  .map((memory, originalIndex) => ({
    ...memory,
    originalIndex
  }))
  .filter(
    (memory) =>
      memory &&
      typeof memory.image === "string" &&
      memory.image.startsWith("data:image/")
  );

if (usableMemories.length === 0) {
  return res.status(400).json({
    error: "No usable photos were received."
  });
}

/*
  Story settings.
*/
const storyType = story?.type || "Magical Adventure";
const setting = story?.setting || "A magical world";
const lesson = story?.lesson || "Being brave and believing in yourself";
const length = story?.length || "Medium";
const tone = story?.tone || "Warm and magical";

/*
  Control story length.
  One story page is created for each available photo,
  up to the selected maximum.
*/
const maxPages =
  length === "Short"
    ? 5
    : length === "Long"
    ? 10
    : 8;

const selectedMemories = usableMemories.slice(0, maxPages);
const pageCount = selectedMemories.length;

/*
  Build the photo inputs.

  Each photo is immediately preceded by its corresponding
  parent memory so the AI understands that they belong together.
*/
const photoInputs = [];

selectedMemories.forEach((memory, index) => {
  const memoryText =
    typeof memory.memory === "string" && memory.memory.trim()
      ? memory.memory.trim()
      : "No parent-written memory was provided for this photo.";

  const filename =
    typeof memory.name === "string" && memory.name.trim()
      ? memory.name.trim()
      : `Photo ${index + 1}`;

  photoInputs.push({
    type: "input_text",
    text:
      `PHOTO ${index + 1}\n` +
      `Filename: ${filename}\n` +
      `Parent memory: ${memoryText}\n\n` +
      `This image and the parent memory above belong together. ` +
      `Study the actual visible content of the photo and use it when ` +
      `writing the corresponding story section.`
  });

  photoInputs.push({
    type: "input_image",
    image_url: memory.image,
    detail: "high"
  });
});

/*
  Main instructions for the AI story engine.
*/
const systemPrompt = `
```

You are the AI Story Engine for "Once Upon My Child", a premium personalized
children's storybook creator.

Your job is to transform a child's real photos, the parent's memories, and the
selected story preferences into one coherent, emotionally engaging children's
story.

IMPORTANT PRINCIPLES:

1. THE CHILD IS THE MAIN CHARACTER
   The child must remain the central character throughout the entire story.

2. USE THE REAL PHOTOS
   Carefully study every supplied photo.

Pay attention to visible details such as:

* clothing
* toys
* animals
* objects
* locations
* scenery
* activities
* colors
* weather
* recognizable environmental details

Do not claim to know something that cannot reasonably be determined from the
photo.

3. RESPECT THE PARENT'S MEMORY
   Parent-written memories are the strongest source of factual information.

Do not contradict the parent's memory.

Do not invent specific real-world family facts such as:

* relatives
* names
* locations
* events
* relationships
* dates
* possessions

unless they are provided by the parent or clearly visible in the photo.

4. IMAGINATION IS ALLOWED
   This is a children's story.

You may transform real objects, places and moments into imaginative story
elements.

For example:

* a beach can become an enchanted kingdom
* a toy can become a magical companion
* a walk can become an adventure
* an animal in a photo can become a friendly story character

Clearly keep imaginative events within the story rather than presenting them
as factual memories.

5. PHOTO ORDER
   Use the supplied photos in their original order whenever possible.

Each story page MUST use a different photo.

Never assign the same photo to two different pages.

Do not create duplicate photoIndex values.

6. PHOTO-TO-STORY CONNECTION
   The event described on each page should be meaningfully connected to the
   specific photo assigned to that page.

Do not simply attach random photos to unrelated story paragraphs.

7. STORY ARC
   Create a beginning, middle and satisfying ending.

The story should feel like one continuous adventure rather than a collection
of unrelated photo captions.

8. CHILD DETAILS
   Use the child's:

* name
* age
* personality
* favorites

when provided.

The story should feel specifically written for this child.

9. SELECTED STORY OPTIONS
   Respect:

* story type
* setting
* lesson
* length
* tone

10. AGE APPROPRIATENESS
    Use language appropriate for the child's age.

Keep the story warm, positive, imaginative and emotionally safe.

11. WRITING STYLE
    Write like a professionally produced personalized children's picture book.

Use:

* vivid but simple language
* short readable paragraphs
* emotional warmth
* gentle humor where appropriate
* magical imagery
* a strong narrative voice

Avoid:

* repetitive sentences
* generic filler
* unnecessary exposition
* frightening content
* overly complicated vocabulary

12. ENDING
    The ending should provide emotional closure and naturally reinforce the
    selected lesson.

OUTPUT REQUIREMENTS:

Return ONLY valid JSON.

Do not include Markdown.
Do not include code fences.
Do not include commentary before or after the JSON.

The JSON must have exactly this structure:

{
"title": "Story title",
"subtitle": "Short subtitle",
"dedication": "A short personalized dedication",
"pages": [
{
"photoIndex": 0,
"heading": "Page heading",
"text": "Story text"
}
],
"ending": "Final emotional ending"
}

There must be exactly ${pageCount} pages.

The photoIndex values must be:
${selectedMemories.map((_, i) => i).join(", ")}

Each photoIndex may appear ONLY ONCE.

Use the photos in order.

Do not add any fields outside the required JSON structure.
`;

```
/*
  User/child information supplied to the AI.
*/
const childDetails = `
```

CHILD INFORMATION

Name: ${child.name}
Age: ${child.age || "Not provided"}
Personality: ${child.personality || "Not provided"}
Favorite things: ${child.favorites || "Not provided"}

STORY PREFERENCES

Story type: ${storyType}
Setting: ${setting}
Lesson: ${lesson}
Length: ${length}
Tone: ${tone}

The story contains ${pageCount} real photo(s).

Create one connected story using these photos in order.
`;

````
/*
  Send request to OpenAI Responses API.
*/
const response = await fetch(
  "https://api.openai.com/v1/responses",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
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
              text: childDetails
            },
            ...photoInputs
          ]
        }
      ],

      max_output_tokens: 7000
    })
  }
);

/*
  Read the OpenAI response.
*/
const responseText = await response.text();

if (!response.ok) {
  console.error("OPENAI API ERROR:", responseText);

  return res.status(500).json({
    error: "OpenAI API request failed.",
    details: responseText
  });
}

let result;

try {
  result = JSON.parse(responseText);
} catch (parseError) {
  console.error("OPENAI RESPONSE PARSE ERROR:", parseError);
  console.error("RAW RESPONSE:", responseText);

  return res.status(500).json({
    error: "Unable to parse OpenAI response."
  });
}

/*
  Extract generated text from the Responses API.
*/
let outputText = "";

if (typeof result.output_text === "string") {
  outputText = result.output_text;
} else if (Array.isArray(result.output)) {
  for (const outputItem of result.output) {
    if (!Array.isArray(outputItem.content)) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      if (
        contentItem &&
        contentItem.type === "output_text" &&
        typeof contentItem.text === "string"
      ) {
        outputText += contentItem.text;
      }
    }
  }
}

if (!outputText.trim()) {
  console.error("NO OUTPUT TEXT FROM OPENAI:", result);

  return res.status(500).json({
    error: "OpenAI returned no story text."
  });
}

/*
  Remove accidental Markdown code fences if the model adds them.
*/
outputText = outputText
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

/*
  Parse the generated JSON.
*/
let storyResult;

try {
  storyResult = JSON.parse(outputText);
} catch (parseError) {
  console.error("STORY JSON PARSE ERROR:", parseError);
  console.error("MODEL OUTPUT:", outputText);

  return res.status(500).json({
    error: "The AI returned an invalid story format."
  });
}

/*
  Basic validation.
*/
if (
  !storyResult ||
  typeof storyResult !== "object" ||
  !Array.isArray(storyResult.pages)
) {
  return res.status(500).json({
    error: "The AI returned an invalid story structure."
  });
}

/*
  Ensure we never return more pages than available photos.
*/
storyResult.pages = storyResult.pages.slice(0, pageCount);

/*
  Server-side duplicate-photo protection.
*/
const usedPhotoIndexes = new Set();

storyResult.pages = storyResult.pages.filter((page) => {
  if (!page || typeof page !== "object") {
    return false;
  }

  const index = Number(page.photoIndex);

  if (!Number.isInteger(index)) {
    return false;
  }

  if (index < 0 || index >= selectedMemories.length) {
    return false;
  }

  if (usedPhotoIndexes.has(index)) {
    return false;
  }

  usedPhotoIndexes.add(index);

  page.photoIndex = index;

  return true;
});

/*
  If the AI somehow omitted a photo, fill the missing page using the
  corresponding photo rather than allowing duplicate mappings.
*/
for (let i = 0; i < selectedMemories.length; i++) {
  if (storyResult.pages.length >= pageCount) {
    break;
  }

  if (!usedPhotoIndexes.has(i)) {
    storyResult.pages.push({
      photoIndex: i,
      heading: `A Special Moment`,
      text:
        `This special moment became part of ${child.name}'s wonderful adventure. ` +
        `It was a memory worth keeping forever.`
    });

    usedPhotoIndexes.add(i);
  }
}

/*
  Final response.
*/
return res.status(200).json({
  story: storyResult
});
````

} catch (error) {
console.error("GENERATE STORY ERROR:", error);

```
return res.status(500).json({
  error: "Unable to generate story.",
  details:
    error && error.message
      ? error.message
      : String(error)
});
```

}
}
