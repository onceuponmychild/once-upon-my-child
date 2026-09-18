async function generateStory() {
  try {
    const response = await fetch("/api/generate-story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        child: state.child,
        story: state.story,
        memories: {
          general: state.memories,
          photos: state.photos.map((photo, index) => ({
            order: index + 1,
            image: photo.image,
            name: photo.name || `Photo ${index + 1}`,
            memory: photo.memory || ""
          }))
        }
      })
    });

    const rawText = await response.text();

    console.log("GENERATE STORY STATUS:", response.status);
    console.log("GENERATE STORY RAW RESPONSE:", rawText);

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error(
        "SERVER RETURNED NON-JSON:",
        rawText
      );

      throw new Error(
        `Server returned status ${response.status}: ${rawText.substring(0, 500)}`
      );
    }

    if (!response.ok) {
      console.error(
        "STORY API ERROR:",
        data
      );

      throw new Error(
        data.details ||
        data.error ||
        `Story generation failed with status ${response.status}.`
      );
    }

    if (!data.story) {
      console.error(
        "NO STORY IN RESPONSE:",
        data
      );

      throw new Error(
        "The server responded successfully but no story was returned."
      );
    }

    console.log(
      "STORY GENERATED SUCCESSFULLY:",
      data.story
    );

    state.generatedStory = data.story;

    renderGeneratedStory();

    showStep(3);

  } catch (error) {
    console.error(
      "GENERATE STORY FAILED:",
      error
    );

    alert(
      "Story generation error:\n\n" +
      (error.message || String(error))
    );
  }
}
