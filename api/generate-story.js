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


    /* =========================================
       BASIC VALIDATION
    ========================================= */

    if (!child || !child.name) {
      return res.status(400).json({
        error: "Child information is required."
      });
    }


    /*
      Support the current app.js structure:

      memories: {
        general: "...",
        photos: [...]
      }

      Also support the older array format.
    */

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
        error: "At least one photo is required."
      });

    }


    /* =========================================
       OPENAI API KEY
    ========================================= */

    const apiKey =
      process.env.OPENAI_API_KEY;


    if (!apiKey) {

      return res.status(500).json({
        error:
          "OPENAI_API_KEY is not configured in Vercel."
      });

    }


    /* =========================================
       STORY SETTINGS
    ========================================= */

    const storyType =
      story?.type ||
      "Magical Adventure";


    const setting =
      story?.setting ||
      "a wonderful place";


    const lesson =
      story?.lesson ||
      "being brave, kind and curious";


    const length =
      story?.length ||
      "medium";


    const tone =
      story?.tone ||
      "warm";


    let maxPages = 8;


    if (length === "short") {
      maxPages = 5;
    }


    if (length === "medium") {
      maxPages = 8;
    }


    if (length === "long") {
      maxPages = 10;
    }


    /* =========================================
       BUILD STORY PROMPT
    ========================================= */

    const prompt = `
Create a personalized children's story using the information below.

CHILD
Name: ${child.name}
Age: ${child.age || "Not specified"}
Personality: ${child.personality || "Not specified"}
Favorite things: ${child.favorites || "Not specified"}

STORY
Adventure type: ${storyType}
Setting: ${setting}
Lesson: ${lesson}
Length: ${length}
Tone: ${tone}

The uploaded photographs are real photographs of the child's experiences.

IMPORTANT:
- The child should be the main character.
- Study the photographs carefully.
- Use visible details from the photographs when appropriate.
- Treat the parent's memories as the strongest source of factual information.
- Do not invent specific real-world facts that contradict the parent's memories.
- Imagination is encouraged for the adventure/story elements.
- Preserve the chronological/order of the photographs.
- Each photograph should normally become one unique story page.
- Do not use the same photograph more than once.
- Make the story feel like one connected adventure rather than separate photo captions.
- Keep the writing appropriate for the child's age.
- Make the story emotionally warm and memorable.
- Create a satisfying beginning, middle and ending.
- Maximum ${maxPages} story pages.

Return ONLY valid JSON.

Use exactly this structure:

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
`;


    /* =========================================
       BUILD OPENAI MULTIMODAL INPUT
    ========================================= */

    const content = [];


    content.push({
      type: "input_text",
      text: prompt
    });


    photoMemories.forEach(
      function(memory, index) {

        /*
          The current app.js sends:

          {
            order: 1,
            image: "data:image/...",
            memory: "..."
          }
        */


        if (
          memory &&
          typeof memory.image === "string" &&
          memory.image.startsWith("data:image/")
        ) {

          content.push({
            type: "input_text",
            text:
              "PHOTO " +
              (index + 1) +
              " PARENT MEMORY:\n" +
              (
                memory.memory ||
                "No written memory was provided."
              )
          });


          content.push({
            type: "input_image",
            image_url: memory.image
          });

        }

      }
    );


    /* =========================================
       CHECK THAT IMAGES WERE ACTUALLY ADDED
    ========================================= */

    const imageCount =
      content.filter(
        function(item) {
          return item.type === "input_image";
        }
      ).length;


    if (imageCount === 0) {

      return res.status(400).json({
        error:
          "No usable image data was received by the story generator."
      });

    }


    /* =========================================
       OPENAI REQUEST
    ========================================= */

    console.log(
      "Sending story request to OpenAI.",
      {
        child:
          child.name,

        photos:
          imageCount,

        storyType:
          storyType
      }
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

          body: JSON.stringify({

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
              4000

          })
        }
      );


    /* =========================================
       HANDLE OPENAI ERROR
    ========================================= */

    const responseText =
      await openAIResponse.text();


    if (!openAIResponse.ok) {

      console.error(
        "OpenAI API error:",
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


    /* =========================================
       PARSE OPENAI RESPONSE
    ========================================= */

    let openAIResult;


    try {

      openAIResult =
        JSON.parse(
          responseText
        );

    } catch (parseError) {

      console.error(
        "Could not parse OpenAI response:",
        responseText
      );


      return res.status(500).json({

        error:
          "Invalid response received from OpenAI.",

        details:
          responseText

      });

    }


    /* =========================================
       GET OUTPUT TEXT
    ========================================= */

    let outputText =
      openAIResult.output_text;


    /*
      Fallback in case output_text
      isn't available.
    */

    if (!outputText) {

      const output =
        Array.isArray(
          openAIResult.output
        )
          ? openAIResult.output
          : [];


      const textParts = [];


      output.forEach(
        function(item) {

          if (
            item &&
            Array.isArray(item.content)
          ) {

            item.content.forEach(
              function(part) {

                if (
                  part &&
                  typeof part.text === "string"
                ) {

                  textParts.push(
                    part.text
                  );

                }

              }
            );

          }

        }
      );


      outputText =
        textParts.join("\n");
    }


    if (!outputText) {

      return res.status(500).json({

        error:
          "OpenAI returned no story text.",

        details:
          JSON.stringify(
            openAIResult
          )

      });

    }


    /* =========================================
       CLEAN JSON RESPONSE
    ========================================= */

    outputText =
      outputText.trim();


    /*
      Sometimes models return:

      ```json
      {...}
      ```

      Remove those fences.
    */

    if (
      outputText.startsWith("```")
    ) {

      outputText =
        outputText.replace(
          /^```(?:json)?\s*/i,
          ""
        );

      outputText =
        outputText.replace(
          /\s*```$/,
          ""
        );

      outputText =
        outputText.trim();
    }


    let generatedStory;


    try {

      generatedStory =
        JSON.parse(
          outputText
        );

    } catch (jsonError) {

      console.error(
        "Story JSON parsing failed:",
        outputText
      );


      return res.status(500).json({

        error:
          "The AI created a response, but it was not valid story JSON.",

        details:
          outputText

      });

    }


    /* =========================================
       VALIDATE STORY
    ========================================= */

    if (
      !generatedStory ||
      !Array.isArray(
        generatedStory.pages
      )
    ) {

      return res.status(500).json({

        error:
          "The AI response did not contain valid story pages.",

        details:
          JSON.stringify(
            generatedStory
          )

      });

    }


    /* =========================================
       CLEAN STORY PAGES
    ========================================= */

    const cleanedPages =
      generatedStory.pages
        .filter(
          function(page) {

            if (!page) {
              return false;
            }


            var index =
              Number(
                page.photoIndex
              );


            return (
              Number.isInteger(index) &&
              index >= 0 &&
              index < photoMemories.length
            );

          }
        )
        .map(
          function(page) {

            return {

              photoIndex:
                Number(
                  page.photoIndex
                ),

              heading:
                String(
                  page.heading ||
                  page.title ||
                  ""
                ),

              text:
                String(
                  page.text ||
                  page.content ||
                  ""
                )

            };

          }
        );


    /* =========================================
       REMOVE DUPLICATE PHOTO PAGES
    ========================================= */

    const usedPhotos =
      new Set();


    const uniquePages =
      cleanedPages.filter(
        function(page) {

          if (
            usedPhotos.has(
              page.photoIndex
            )
          ) {

            return false;
          }


          usedPhotos.add(
            page.photoIndex
          );


          return true;

        }
      );


    /* =========================================
       SORT BY PHOTO ORDER
    ========================================= */

    uniquePages.sort(
      function(a, b) {

        return (
          a.photoIndex -
          b.photoIndex
        );

      }
    );


    /* =========================================
       FINAL STORY OBJECT
    ========================================= */

    const finalStory = {

      title:
        String(
          generatedStory.title ||
          "Once Upon a Time..."
        ),

      subtitle:
        String(
          generatedStory.subtitle ||
          ""
        ),

      dedication:
        String(
          generatedStory.dedication ||
          ""
        ),

      pages:
        uniquePages,

      ending:
        String(
          generatedStory.ending ||
          ""
        )

    };


    /* =========================================
       RETURN STORY TO APP
    ========================================= */

    console.log(
      "Story successfully generated.",
      {
        pages:
          finalStory.pages.length
      }
    );


    return res.status(200).json({

      story:
        finalStory

    });


  } catch (error) {

    console.error(
      "generate-story error:",
      error
    );


    return res.status(500).json({

      error:
        "Story generation failed.",

      details:
        error.message ||
        String(error)

    });

  }

}
