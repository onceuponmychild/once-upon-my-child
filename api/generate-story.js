export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured."
      });
    }

    const body = req.body || {};

    const child = body.child || {};
    const story = body.story || {};

    if (!child.name) {
      return res.status(400).json({
        error: "Child information is required."
      });
    }

    const prompt = `
Create a very short children's story.

Child:
Name: ${child.name}
Age: ${child.age || "unknown"}
Personality: ${child.personality || "friendly"}
Favorite things: ${child.favorites || "not provided"}

Story type: ${story.type || "Magical Adventure"}
Setting: ${story.setting || "a magical world"}
Lesson: ${story.lesson || "being brave"}
Tone: ${story.tone || "warm and magical"}

Return ONLY valid JSON in this exact format:

{
  "title": "Story title",
  "subtitle": "Short subtitle",
  "dedication": "A short dedication",
  "pages": [
    {
      "photoIndex": 0,
      "heading": "Beginning",
      "text": "Story text"
    }
  ],
  "ending": "Final ending"
}
`;

    console.log("Sending text-only request to OpenAI...");

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
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: prompt
                }
              ]
            }
          ],

          max_output_tokens: 2000
        })
      }
    );

    const responseText = await response.text();

    console.log(
      "OPENAI STATUS:",
      response.status
    );

    console.log(
      "OPENAI RESPONSE:",
      responseText
    );

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI API request failed.",
        details: responseText
      });
    }

    let result;

    try {
      result = JSON.parse(responseText);
    } catch (error) {
      return res.status(500).json({
        error: "Unable to parse OpenAI response.",
        details: responseText
      });
    }

    let outputText = "";

    if (
      typeof result.output_text === "string"
    ) {
      outputText = result.output_text;
    }

    if (
      !outputText &&
      Array.isArray(result.output)
    ) {
      for (
        const item of result.output
      ) {
        if (
          !Array.isArray(item.content)
        ) {
          continue;
        }

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

    if (!outputText.trim()) {
      return res.status(500).json({
        error: "OpenAI returned no text.",
        details: responseText
      });
    }

    outputText = outputText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let storyResult;

    try {
      storyResult = JSON.parse(outputText);
    } catch (error) {
      console.error(
        "STORY JSON ERROR:",
        outputText
      );

      return res.status(500).json({
        error: "AI returned invalid JSON.",
        details: outputText
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
      error: "Unable to generate story.",
      details:
        error && error.message
          ? error.message
          : String(error)
    });
  }
}
