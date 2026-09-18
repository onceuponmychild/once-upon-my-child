export default async function handler(req, res) {
  try {
    console.log("GENERATE STORY FUNCTION STARTED");

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    console.log("REQUEST RECEIVED");

    const body = req.body || {};

    console.log("BODY RECEIVED");

    const child = body.child || {};
    const story = body.story || {};
    const memories = body.memories || {};

    console.log("CHILD:", {
      name: child.name,
      age: child.age
    });

    console.log("STORY:", {
      type: story.type,
      setting: story.setting,
      lesson: story.lesson
    });

    const photos = Array.isArray(memories.photos)
      ? memories.photos
      : [];

    console.log(
      "PHOTO COUNT:",
      photos.length
    );

    return res.status(200).json({
      success: true,
      message: "API connection is working.",
      received: {
        childName: child.name || null,
        storyType: story.type || null,
        photoCount: photos.length
      }
    });

  } catch (error) {
    console.error(
      "TEST FUNCTION ERROR:",
      error
    );

    return res.status(500).json({
      error: "Test function failed.",
      details:
        error && error.message
          ? error.message
          : String(error)
    });
  }
}
