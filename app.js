var state = {
  currentStep: 1,

  child: {
    name: "",
    age: "",
    personality: "",
    favorites: ""
  },

  story: {
    type: "Magical Adventure",
    setting: "",
    lesson: "",
    length: "medium",
    tone: "warm"
  },

  memories: "",

  photos: [],

  generatedStory: null
};


/* =========================================
   STEP NAVIGATION
========================================= */

function showStep(step) {

  state.currentStep = step;

  var screens =
    document.querySelectorAll(".screen");

  screens.forEach(function(screen) {

    screen.classList.remove("active");

  });


  var target =
    document.getElementById(
      "step" + step
    );


  if (target) {

    target.classList.add("active");

  }


  var stepLabel =
    document.getElementById(
      "stepLabel"
    );


  if (stepLabel) {

    stepLabel.textContent =
      "Step " + step + " of 3";

  }


  var progress =
    document.getElementById(
      "progressBar"
    );


  if (progress) {

    progress.style.width =
      ((step - 1) / 2) * 100 + "%";

  }


  window.scrollTo(0, 0);
}


/* =========================================
   COLLECT CHILD INFORMATION
========================================= */

function collectChildInformation() {

  var childName =
    document.getElementById(
      "childName"
    );

  var childAge =
    document.getElementById(
      "childAge"
    );

  var personality =
    document.getElementById(
      "personality"
    );

  var favorites =
    document.getElementById(
      "favorites"
    );

  var setting =
    document.getElementById(
      "setting"
    );

  var lesson =
    document.getElementById(
      "lesson"
    );

  var storyLength =
    document.getElementById(
      "storyLength"
    );

  var storyTone =
    document.getElementById(
      "storyTone"
    );


  if (childName) {

    state.child.name =
      childName.value.trim();

  }


  if (childAge) {

    state.child.age =
      childAge.value.trim();

  }


  if (personality) {

    state.child.personality =
      personality.value.trim();

  }


  if (favorites) {

    state.child.favorites =
      favorites.value.trim();

  }


  if (setting) {

    state.story.setting =
      setting.value.trim();

  }


  if (lesson) {

    state.story.lesson =
      lesson.value.trim();

  }


  if (storyLength) {

    state.story.length =
      storyLength.value;

  }


  if (storyTone) {

    state.story.tone =
      storyTone.value;

  }
}


/* =========================================
   ADVENTURE CARDS
========================================= */

function setupAdventureCards() {

  var container =
    document.getElementById(
      "storyTypeChoices"
    );


  if (!container) {

    console.log(
      "Adventure container not found"
    );

    return;
  }


  var cards =
    container.querySelectorAll(
      ".choice-card"
    );


  cards.forEach(function(card) {

    card.addEventListener(
      "click",
      function() {

        cards.forEach(
          function(item) {

            item.classList.remove(
              "selected"
            );

            item.setAttribute(
              "aria-selected",
              "false"
            );

          }
        );


        card.classList.add(
          "selected"
        );


        card.setAttribute(
          "aria-selected",
          "true"
        );


        var selectedType =
          card.getAttribute(
            "data-value"
          );


        if (selectedType) {

          state.story.type =
            selectedType;

        }


        console.log(
          "Adventure selected:",
          state.story.type
        );

      }
    );

  });
}


/* =========================================
   PHOTO UPLOAD
========================================= */

function setupPhotoUpload() {

  var dropZone =
    document.getElementById(
      "dropZone"
    );


  var photoInput =
    document.getElementById(
      "photoInput"
    );


  if (!dropZone || !photoInput) {

    console.log(
      "Photo upload elements not found"
    );

    return;
  }


  dropZone.addEventListener(
    "click",
    function() {

      photoInput.click();

    }
  );


  photoInput.addEventListener(
    "change",
    function(event) {

      var files =
        Array.from(
          event.target.files || []
        );


      addPhotos(files);


      photoInput.value = "";

    }
  );


  dropZone.addEventListener(
    "dragover",
    function(event) {

      event.preventDefault();

      dropZone.classList.add(
        "dragover"
      );

    }
  );


  dropZone.addEventListener(
    "dragleave",
    function() {

      dropZone.classList.remove(
        "dragover"
      );

    }
  );


  dropZone.addEventListener(
    "drop",
    function(event) {

      event.preventDefault();


      dropZone.classList.remove(
        "dragover"
      );


      var files =
        Array.from(
          event.dataTransfer.files || []
        );


      addPhotos(files);

    }
  );
}


/* =========================================
   ADD PHOTOS
========================================= */

function addPhotos(files) {

  files.forEach(function(file) {

    if (
      !file.type ||
      !file.type.startsWith("image/")
    ) {

      return;

    }


    var photo = {

      id:
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2),

      file:
        file,

      url:
        URL.createObjectURL(
          file
        ),

      memory:
        ""

    };


    state.photos.push(
      photo
    );

  });


  renderPhotos();
}


/* =========================================
   RENDER PHOTOS
========================================= */

function renderPhotos() {

  var list =
    document.getElementById(
      "photoList"
    );


  var count =
    document.getElementById(
      "photoCount"
    );


  if (!list) {

    return;

  }


  list.innerHTML = "";


  if (count) {

    count.textContent =
      state.photos.length +
      (
        state.photos.length === 1
          ? " photo"
          : " photos"
      );

  }


  state.photos.forEach(
    function(photo, index) {

      var wrapper =
        document.createElement(
          "div"
        );


      wrapper.className =
        "photo-item";


      wrapper.innerHTML =

        '<div class="photo-preview">' +

          '<img src="' +
            photo.url +
            '" alt="Photo ' +
            (index + 1) +
            '">' +

        '</div>' +

        '<div class="photo-details">' +

          '<div class="photo-number">' +
            "Photo " +
            (index + 1) +
          '</div>' +

          '<textarea ' +
            'class="photo-memory" ' +
            'data-photo-id="' +
              photo.id +
            '" ' +
            'placeholder="What was happening in this photo? Tell us the memory behind it...">' +
            escapeHtml(
              photo.memory || ""
            ) +
          '</textarea>' +

        '</div>' +

        '<button ' +
          'type="button" ' +
          'class="remove-photo" ' +
          'data-photo-id="' +
            photo.id +
          '">' +
          "Remove" +
        '</button>';


      list.appendChild(
        wrapper
      );

    }
  );


  var memoryInputs =
    list.querySelectorAll(
      ".photo-memory"
    );


  memoryInputs.forEach(
    function(input) {

      input.addEventListener(
        "input",
        function() {

          var id =
            input.getAttribute(
              "data-photo-id"
            );


          var photo =
            state.photos.find(
              function(item) {

                return (
                  item.id === id
                );

              }
            );


          if (photo) {

            photo.memory =
              input.value;

          }

        }
      );

    }
  );


  var removeButtons =
    list.querySelectorAll(
      ".remove-photo"
    );


  removeButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function() {

          var id =
            button.getAttribute(
              "data-photo-id"
            );


          removePhoto(id);

        }
      );

    }
  );
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

  return String(
    value || ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================
   REMOVE PHOTO
========================================= */

function removePhoto(id) {

  var photo =
    state.photos.find(
      function(item) {

        return (
          item.id === id
        );

      }
    );


  if (
    photo &&
    photo.url
  ) {

    URL.revokeObjectURL(
      photo.url
    );

  }


  state.photos =
    state.photos.filter(
      function(item) {

        return (
          item.id !== id
        );

      }
    );


  renderPhotos();
}


/* =========================================
   COLLECT PHOTO MEMORIES
========================================= */

function collectPhotoMemories() {

  var inputs =
    document.querySelectorAll(
      ".photo-memory"
    );


  inputs.forEach(
    function(input) {

      var id =
        input.getAttribute(
          "data-photo-id"
        );


      var photo =
        state.photos.find(
          function(item) {

            return (
              item.id === id
            );

          }
        );


      if (photo) {

        photo.memory =
          input.value.trim();

      }

    }
  );
}


/* =========================================
   FILE TO DATA URL
========================================= */

function fileToDataUrl(file) {

  return new Promise(
    function(resolve, reject) {

      if (!file) {

        reject(
          new Error(
            "Photo file is missing."
          )
        );

        return;
      }


      var reader =
        new FileReader();


      reader.onload =
        function() {

          resolve(
            reader.result
          );

        };


      reader.onerror =
        function() {

          reject(
            new Error(
              "Unable to read photo."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );
}


/* =========================================
   GENERATE STORY
========================================= */

async function generateStory() {

  collectChildInformation();

  collectPhotoMemories();


  if (!state.child.name) {

    alert(
      "Please enter your child's name."
    );

    showStep(1);

    return;
  }


  if (
    state.photos.length === 0
  ) {

    alert(
      "Please add at least one photo."
    );

    return;
  }


  var button =
    document.getElementById(
      "createStoryBtn"
    );


  if (button) {

    button.disabled = true;

    button.innerHTML =
      "Creating their story ✨";

  }


  try {

    console.log(
      "Preparing photos for AI..."
    );


    /*
      THIS IS THE IMPORTANT PART.

      Each photo file is converted
      into an actual data URL.
    */

    var photoMemories =
      await Promise.all(

        state.photos.map(
          async function(
            photo,
            index
          ) {

            if (!photo.file) {

              throw new Error(
                "Photo " +
                (index + 1) +
                " does not contain a file."
              );

            }


            var imageData =
              await fileToDataUrl(
                photo.file
              );


            return {

              order:
                index + 1,

              image:
                imageData,

              memory:
                photo.memory || ""

            };

          }
        )

      );


    console.log(
      "PHOTO DATA READY:",
      photoMemories.map(
        function(photo) {

          return {

            order:
              photo.order,

            hasImage:
              !!photo.image,

            imageLength:
              photo.image
                ? photo.image.length
                : 0

          };

        }
      )
    );


    /*
      Send the actual images
      to the API.
    */

    var payload = {

      child:
        state.child,

      story:
        state.story,

      memories: {

        general:
          state.memories,

        photos:
          photoMemories

      }

    };


    console.log(
      "Sending story request..."
    );


    var response =
      await fetch(
        "/api/generate-story",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    var responseText =
      await response.text();


    var result;


    try {

      result =
        JSON.parse(
          responseText
        );

    } catch (parseError) {

      throw new Error(
        responseText ||
        "The server returned an invalid response."
      );

    }


    if (!response.ok) {

      throw new Error(

        result.details ||
        result.error ||
        responseText ||
        "Story generation failed."

      );

    }


    console.log(
      "Story generated:",
      result
    );


    state.generatedStory =
      result;


    renderGeneratedStory(
      result
    );


    showStep(3);


  } catch (error) {

    console.error(
      "Story generation error:",
      error
    );


    alert(

      "We couldn't create the story yet.\n\n" +

      "Error: " +

      (
        error.message ||
        "Unknown error"
      )

    );


  } finally {

    if (button) {

      button.disabled = false;

      button.innerHTML =
        'Create their story <span>✨</span>';

    }

  }
}


/* =========================================
   RENDER GENERATED STORY
========================================= */

function renderGeneratedStory(result) {

  var story =
    result &&
    result.story
      ? result.story
      : result;


  if (!story) {

    console.error(
      "No story returned."
    );

    return;
  }


  state.generatedStory =
    story;


  var title =
    document.getElementById(
      "storyTitle"
    );


  var subtitle =
    document.getElementById(
      "storySubtitle"
    );


  var coverChildName =
    document.getElementById(
      "coverChildName"
    );


  var coverStoryType =
    document.getElementById(
      "coverStoryType"
    );


  var ending =
    document.getElementById(
      "endingText"
    );


  var generatedPages =
    document.getElementById(
      "generatedPages"
    );


  if (title) {

    title.textContent =
      story.title ||
      "Once Upon a Time...";

  }


  if (subtitle) {

    subtitle.textContent =
      story.subtitle ||
      "";

  }


  if (coverChildName) {

    coverChildName.textContent =
      state.child.name;

  }


  if (coverStoryType) {

    coverStoryType.textContent =
      state.story.type;

  }


  if (ending) {

    ending.textContent =
      story.ending ||
      "";

  }


  if (!generatedPages) {

    console.error(
      "generatedPages container not found."
    );

    return;
  }


  generatedPages.innerHTML = "";


  var pages =
    Array.isArray(
      story.pages
    )
      ? story.pages
      : [];


  pages.forEach(
    function(page, index) {

      var pageElement =
        document.createElement(
          "article"
        );


      pageElement.className =
        "story-page";


      var photoIndex =
        typeof page.photoIndex ===
        "number"

          ? page.photoIndex

          : index;


      var photo =
        state.photos[
          photoIndex
        ];


      var imageHtml =
        "";


      if (photo) {

        imageHtml =

          '<div class="story-page-image">' +

            '<img src="' +
              photo.url +
              '" alt="Story photo">' +

          '</div>';

      }


      var heading =
        page.heading ||
        page.title ||
        "";


      var text =
        page.text ||
        page.content ||
        "";


      pageElement.innerHTML =

        imageHtml +

        '<div class="story-page-content">' +

          (
            heading

              ? '<h3>' +
                  escapeHtml(
                    heading
                  ) +
                '</h3>'

              : ""
          ) +

          '<p>' +
            escapeHtml(
              text
            ) +
          '</p>' +

        '</div>';


      generatedPages.appendChild(
        pageElement
      );

    }
  );


  var coverPhotoWrap =
    document.getElementById(
      "coverPhotoWrap"
    );


  if (
    coverPhotoWrap &&
    state.photos.length > 0
  ) {

    coverPhotoWrap.innerHTML =

      '<img src="' +
        state.photos[0].url +
        '" alt="Story cover photo">';

  }
}


/* =========================================
   START OVER
========================================= */

function startOver() {

  state = {

    currentStep: 1,

    child: {

      name: "",

      age: "",

      personality: "",

      favorites: ""

    },

    story: {

      type:
        "Magical Adventure",

      setting:
        "",

      lesson:
        "",

      length:
        "medium",

      tone:
        "warm"

    },

    memories:
      "",

    photos:
      [],

    generatedStory:
      null

  };


  var fields =
    document.querySelectorAll(
      "input, textarea"
    );


  fields.forEach(
    function(field) {

      if (
        field.type !== "button" &&
        field.type !== "submit"
      ) {

        field.value = "";

      }

    }
  );


  var cards =
    document.querySelectorAll(
      ".choice-card"
    );


  cards.forEach(
    function(card) {

      card.classList.remove(
        "selected"
      );

      card.setAttribute(
        "aria-selected",
        "false"
      );

    }
  );


  var defaultAdventure =
    document.querySelector(
      '.choice-card[data-value="Magical Adventure"]'
    );


  if (defaultAdventure) {

    defaultAdventure.classList.add(
      "selected"
    );

    defaultAdventure.setAttribute(
      "aria-selected",
      "true"
    );

  }


  var photoList =
    document.getElementById(
      "photoList"
    );


  if (photoList) {

    photoList.innerHTML = "";

  }


  var photoCount =
    document.getElementById(
      "photoCount"
    );


  if (photoCount) {

    photoCount.textContent =
      "0 photos";

  }


  showStep(1);
}


/* =========================================
   PRINT STORY
========================================= */

function printStory() {

  window.print();
}


/* =========================================
   BUTTONS
========================================= */

function setupButtons() {

  var continueButton =
    document.getElementById(
      "continueToPhotos"
    );


  if (continueButton) {

    continueButton.addEventListener(
      "click",
      function() {

        collectChildInformation();


        if (!state.child.name) {

          alert(
            "Please enter your child's name."
          );

          return;
        }


        showStep(2);

      }
    );

  }


  var backButton =
    document.getElementById(
      "backToDetails"
    );


  if (backButton) {

    backButton.addEventListener(
      "click",
      function() {

        collectChildInformation();

        collectPhotoMemories();

        showStep(1);

      }
    );

  }


  var addMemoryButton =
    document.getElementById(
      "addMemoryBtn"
    );


  if (addMemoryButton) {

    addMemoryButton.addEventListener(
      "click",
      function() {

        collectPhotoMemories();


        if (
          state.photos.length === 0
        ) {

          alert(
            "Please add a photo first."
          );

          return;
        }


        renderPhotos();


        var inputs =
          document.querySelectorAll(
            ".photo-memory"
          );


        if (inputs.length > 0) {

          inputs[
            inputs.length - 1
          ].focus();

        }

      }
    );

  }


  var createStoryButton =
    document.getElementById(
      "createStoryBtn"
    );


  if (createStoryButton) {

    createStoryButton.addEventListener(
      "click",
      function() {

        generateStory();

      }
    );

  }


  var editStoryButton =
    document.getElementById(
      "editStoryBtn"
    );


  if (editStoryButton) {

    editStoryButton.addEventListener(
      "click",
      function() {

        showStep(2);

      }
    );

  }


  var startOverButton =
    document.getElementById(
      "startOverBtn"
    );


  if (startOverButton) {

    startOverButton.addEventListener(
      "click",
      function() {

        startOver();

      }
    );

  }


  var printButton =
    document.getElementById(
      "printStoryBtn"
    );


  if (printButton) {

    printButton.addEventListener(
      "click",
      function() {

        printStory();

      }
    );

  }
}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setupAdventureCards();

    setupPhotoUpload();

    setupButtons();

    showStep(1);


    var defaultAdventure =
      document.querySelector(
        '.choice-card[data-value="Magical Adventure"]'
      );


    if (defaultAdventure) {

      defaultAdventure.classList.add(
        "selected"
      );

      defaultAdventure.setAttribute(
        "aria-selected",
        "true"
      );

    }


    console.log(
      "Once Upon My Child loaded."
    );

  }
);
