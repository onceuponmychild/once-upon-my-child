```javascript
export default async function handler(req, res) {

  try {

    console.log("=================================");
    console.log("DIAGNOSTIC API STARTED");
    console.log("=================================");

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const body = req.body || {};

    console.log(
      "Body received:",
      !!body
    );

    console.log(
      "Child received:",
      !!body.child
    );

    console.log(
      "Child name:",
      body.child
        ? body.child.name
        : "none"
    );

    console.log(
      "Memories type:",
      typeof body.memories
    );

    let photos = [];

    if (
      Array.isArray(
        body.memories
      )
    ) {

      photos =
        body.memories;

    } else if (
      body.memories &&
      Array.isArray(
        body.memories.photos
      )
    ) {

      photos =
        body.memories.photos;
    }

    console.log(
      "Photo count:",
      photos.length
    );

    const photoReport =
      photos.map(
        function(photo, index) {

          return {
            photo:
              index + 1,

            keys:
              photo
                ? Object.keys(photo)
                : [],

            hasImage:
              !!(
                photo &&
                photo.image
              ),

            imageLength:
              photo &&
              typeof photo.image ===
                "string"
                ? photo.image.length
                : 0,

            memory:
              photo &&
              photo.memory
                ? photo.memory
                : ""
          };

        }
      );

    console.log(
      "PHOTO REPORT:",
      photoReport
    );

    return res.status(200).json({

      success: true,

      message:
        "Diagnostic API is working.",

      child:
        body.child || null,

      story:
        body.story || null,

      photoCount:
        photos.length,

      photos:
        photoReport

    });

  } catch (error) {

    console.error(
      "DIAGNOSTIC ERROR:",
      error
    );

    return res.status(500).json({

      error:
        "Diagnostic API failed.",

      details:
        error &&
        error.message
          ? error.message
          : String(error)

    });

  }

}
```
