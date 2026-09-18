````javascript
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const body = req.body || {};

    const child =
      body.child || {};

    const story =
      body.story || {};

    const memories =
      body.memories || {};

    if (!child.name) {
      return res.status(400).json({
        error:
          "Child information is required."
      });
    }

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "OpenAI API key is not configured."
      });
    }

    let photos = [];

    if (Array.isArray(memories)) {

      photos = memories;

    } else if (
      Array.isArray(
        memories.photos
      )
    ) {

      photos =
        memories.photos;

    }

    if (photos.length === 0) {
      return res.status(400).json({
        error:
          "At least one photo is required."
      });
    }

    const usablePhotos =
      photos.filter(function(photo) {

        return (
          photo &&
          typeof photo.image ===
            "string" &&
          photo.image.length > 0
        );

      });

    if (usablePhotos.length === 0) {

      return res.status(400).json({

        error:
          "No usable image data was received.",

        receivedPhotoKeys:
          photos.map(function(photo) {

            return photo
              ? Object.keys(photo)
              : [];

          })

      });

    }

    const content = [];

    const prompt = `
Create a personalized children's story.

CHILD
Name: ${child.name}
Age: ${child.age || "unknown"}
Personality: ${
  child.personality ||
  "not specified"
}
Favorites: ${
  child.favorites ||
  "not specified"
}

STORY
Adventure type: ${
  story.type ||
  "Magical Adventure"
}
Setting: ${
  story.setting ||
  "a wonderful place"
}
Lesson: ${
  story.lesson ||
  "trying again"
}
Length: ${
  story.length ||
  "medium"
}
Tone: ${
  story.tone ||
  "warm"
}

The child must be the main character.

Use the uploaded photographs and parent memories.

The parent memories are the strongest source of factual information.

Use imagination to make the memories magical, but do not contradict the memories.

Create one connected story.

Each photograph should normally become one unique story page.

Never use the same photograph twice.

Preserve the original photo order.

Return ONLY valid JSON.

Use this exact structure:

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

Maximum pages:
${
  story.length === "short"
    ? 5
    : story.length === "long"
      ? 10
      : 8
}
`;

    content.push({
      type: "input_text",
      text: prompt
    });

    usablePhotos.forEach(
      function(photo, index) {

        content.push({

          type:
            "input_text",

          text:
            "PHOTO " +
            (index + 1) +
            " PARENT MEMORY:\n" +
            (
              photo.memory ||
              "No memory provided."
            )

        });

        content.push({

          type:
            "input_image",

          image_url:
            photo.image

        });

      }
    );

    console.log(
      "Sending request to OpenAI."
    );

    console.log(
      "Photos:",
      usablePhotos.length
    );

    const openAIResponse =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method:
            "POST",

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
                  role:
                    "user",

                  content:
                    content
                }
              ],

              max_output_tokens:
                5000

            })

        }
      );

    const responseText =
      await openAIResponse.text();

    console.log(
      "OpenAI status:",
      openAIResponse.status
    );

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

      return res.status(500).json({

        error:
          "OpenAI returned an invalid response.",

        details:
          responseText

      });

    }

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

      return res.status(500).json({

        error:
          "The story generator returned no story."

      });

    }

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
      outputText.startsWith(
        "```"
      )
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

    let generatedStory;

    try {

      generatedStory =
        JSON.parse(
          outputText
        );

    } catch (error) {

      console.error(
        "Story JSON error:",
        outputText
      );

      return res.status(500).json({

        error:
          "The AI returned an invalid story format.",

        details:
          outputText

      });

    }

    if (
      !generatedStory ||
      !Array.isArray(
        generatedStory.pages
      )
    ) {

      return res.status(500).json({

        error:
          "The AI returned an incomplete story."

      });

    }

    const used =
      new Set();

    const pages = [];

    generatedStory.pages.forEach(
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
          used.has(
            photoIndex
          )
        ) {
          return;
        }

        if (
          !page.text ||
          typeof page.text !==
            "string"
        ) {
          return;
        }

        used.add(
          photoIndex
        );

        pages.push({

          photoIndex:
            photoIndex,

          heading:
            page.heading ||
            "A New Adventure",

          text:
            page.text

        });

      }
    );

    pages.sort(
      function(a, b) {

        return (
          a.photoIndex -
          b.photoIndex
        );

      }
    );

    if (pages.length === 0) {

      return res.status(500).json({

        error:
          "The AI did not create any usable story pages."

      });

    }

    return res.status(200).json({

      story: {

        title:
          generatedStory.title ||
          `${child.name}'s Adventure`,

        subtitle:
          generatedStory.subtitle ||
          "A magical adventure",

        dedication:
          generatedStory.dedication ||
          `For ${child.name}, with love.`,

        pages:
          pages,

        ending:
          generatedStory.ending ||
          `And ${child.name} knew that another wonderful adventure was waiting.`

      }

    });

  } catch (error) {

    console.error(
      "SERVER ERROR:",
      error
    );

    return res.status(500).json({

      error:
        "Story generation failed.",

      details:
        error &&
        error.message
          ? error.message
          : String(error)

    });

  }

}
````
