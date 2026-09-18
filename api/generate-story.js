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


    /* =========================================
       NORMALIZE MEMORIES
    ========================================= */

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
       DEBUG THE RECEIVED PHOTO DATA
    ========================================= */

    console.log(
      "Photos received:",
      photoMemories.length
    );


    photoMemories.forEach(
      function(photo, index) {

        console.log(
          "Photo",
          index + 1,
          "keys:",
          photo
            ? Object.keys(photo)
            : []
        );


        if (photo) {

          console.log(
            "Photo",
            index + 1,
            "has image:",
            typeof photo.image === "string"
          );

          console.log(
            "Photo",
            index + 1,
            "image starts:",
            typeof photo.image === "string"
              ? photo.image.substring(0, 40)
              : "NO IMAGE"
          );

        }

      }
    );


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
       STORY PROMPT
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

The uploaded photographs are real photographs connected to the child's memories.

IMPORTANT:
- The child is the main character.
- Carefully examine the uploaded photographs.
- Use visible details from the photographs.
- Use the parent's written memories as the strongest factual source.
- Do not contradict the parent's memories.
- Imagination is encouraged for the adventure elements.
- Keep the photographs in their original order.
- Each photograph should normally become one unique story page.
- Never use the same photograph twice.
- Make all pages feel like one connected story.
- Keep the story appropriate for the child's age.
- Make it warm, magical, memorable and emotionally engaging.
- Create a clear beginning, middle and ending.
- Maximum ${maxPages} pages.

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
       BUILD MULTIMODAL CONTENT
    ========================================= */

    const content = [];


    content.push({
      type: "input_text",
      text: prompt
    });


    let usableImageCount = 0;


    photoMemories.forEach(
      function(memory, index) {

        if (!memory) {
          return;
        }


        /*
          Accept the normal image property.
        */

        let imageData =
          memory.image;


        /*
          Also accept a few possible
          alternative property names.
        */

        if (
          typeof imageData !== "string"
        ) {

          imageData =
            memory.dataUrl ||
            memory.dataURL ||
            memory.imageData ||
            memory.url ||
            null;

        }


        if (
          typeof imageData === "string" &&
          imageData.length > 0
        ) {

          console.log(
            "Using image for photo",
            index + 1,
            "length:",
            imageData.length
          );


          content.push({

            type:
              "input_text",

            text:
              "PHOTO " +
              (index + 1) +
              " PARENT MEMORY:\n" +
              (
                memory.memory ||
                "No written memory was provided."
              )

          });


          /*
            OpenAI accepts the image
            as a data URL here.
          */

          content.push({

            type:
              "input_image",

            image_url:
              imageData

          });


          usableImageCount++;

        }

      }
    );


    /* =========================================
       IMAGE CHECK
    ========================================= */

    console.log(
      "Usable images:",
      usableImageCount
    );


    if (usableImageCount === 0) {

      return res.status(400).json({

        error:
          "No usable image data was received by the story generator.",

        details:
          "The API received the photo record, but no image data was found inside it.",

        receivedPhotoKeys:
          photoMemories.map(
            function(photo) {

              return photo
                ? Object.keys(photo)
                : [];

            }
          )

      });

    }


    /* =========================================
       OPENAI REQUEST
    ========================================= */

    console.log(
      "Sending image story request to OpenAI..."
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
                4000

            })

        }
      );


    /* =========================================
       READ OPENAI RESPONSE
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

    } catch (error) {

      return res.status(500).json({

        error:
          "Could not parse OpenAI response.",

        details:
          responseText

      });

    }


    /* =========================================
       GET OUTPUT TEXT
    ========================================= */

    let outputText =
      openAIResult.output_text;


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
       CLEAN JSON
    ========================================= */

    outputText =
      outputText.trim();


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


    /* =========================================
       PARSE STORY JSON
    ========================================= */

    let generatedStory;


    try {

      generatedStory =
        JSON.parse(
          outputText
        );

    } catch (error) {

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
       VALIDATE PAGES
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
       CLEAN PAGES
    ========================================= */

    const cleanedPages =
      generatedStory.pages
        .filter(
          function(page) {

            if (!page) {
              return false;
            }


            const photoIndex =
              Number(
                page.photoIndex
              );


            return (
              Number.isInteger(
                photoIndex
              ) &&
              photoIndex >= 0 &&
              photoIndex <
                photoMemories.length
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
       REMOVE DUPLICATE PHOTOS
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
       SORT PAGES
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
       FINAL STORY
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


    console.log(
      "Story successfully generated.",
      {
        pages:
          finalStory.pages.length
      }
    );


    /* =========================================
       RETURN STORY
    ========================================= */

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
