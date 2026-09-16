/* =========================================================
   ONCE UPON MY CHILD
   APPLICATION LOGIC
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const storyForm = document.getElementById("storyForm");

const childNameInput = document.getElementById("childName");
const childAgeInput = document.getElementById("childAge");
const personalityInput = document.getElementById("personality");
const favoritesInput = document.getElementById("favorites");
const memoryInput = document.getElementById("memory");
const familyInput = document.getElementById("family");

const childPhotoInput = document.getElementById("childPhoto");
const photoPreview = document.getElementById("photoPreview");

const storyOutput = document.getElementById("storyOutput");
const storyHeading = document.getElementById("storyHeading");
const storyText = document.getElementById("storyText");
const storyPhoto = document.getElementById("storyPhoto");


/* =========================================================
   PHOTO UPLOAD
========================================================= */

let uploadedPhoto = null;

childPhotoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        uploadedPhoto = event.target.result;

        photoPreview.innerHTML = `
            <img
                src="${uploadedPhoto}"
                alt="Child photo preview"
            >
        `;

    };

    reader.readAsDataURL(file);

});


/* =========================================================
   SCROLL TO FORM
========================================================= */

function scrollToStoryForm() {

    document
        .getElementById("story-form")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   GET ADVENTURE
========================================================= */

function getSelectedAdventure() {

    const selected =
        document.querySelector(
            'input[name="adventure"]:checked'
        );

    return selected
        ? selected.value
        : "magical";

}


/* =========================================================
   ADVENTURE DETAILS
========================================================= */

function getAdventureDetails(adventure) {

    const adventures = {

        magical: {
            place: "a magical kingdom among the clouds",
            creature: "a tiny silver-winged fairy",
            object: "a glowing star",
            challenge: "helping a lost star find its way home"
        },

        space: {
            place: "a sparkling galaxy beyond the moon",
            creature: "a friendly little space creature",
            object: "a mysterious golden planet",
            challenge: "helping a lonely star discover its light"
        },

        ocean: {
            place: "a secret island beneath the sparkling sea",
            creature: "a playful dolphin",
            object: "a treasure chest covered in seashells",
            challenge: "finding a hidden treasure that belonged to the ocean"
        },

        forest: {
            place: "an enchanted forest filled with glowing trees",
            creature: "a wise little fox",
            object: "an ancient golden key",
            challenge: "discovering the secret behind a magical forest door"
        }

    };

    return adventures[adventure] || adventures.magical;

}


/* =========================================================
   STORY GENERATOR
========================================================= */

function createStory(data) {

    const adventure =
        getAdventureDetails(data.adventure);

    const personality =
        data.personality ||
        "kind, curious and full of imagination";

    const favorites =
        data.favorites ||
        "wonderful little things that made them smile";

    const family =
        data.family ||
        "the people who loved them most";

    const memory =
        data.memory ||
        "one special memory that their family would always treasure";

    const ageText =
        data.age
            ? `${data.age}-year-old`
            : "little";

    return `

        <p class="story-opening">
            Once upon a time, there was a very special ${ageText}
            child named ${data.name}.
        </p>

        <p>
            ${data.name} was known for being ${personality}.
            Everywhere they went, they seemed to discover something
            new and wonderful. Their imagination could turn an
            ordinary afternoon into the beginning of a great adventure.
        </p>

        <p>
            Some of ${data.name}'s favorite things were
            ${favorites}. And whenever ${data.name} was surrounded by
            ${family}, the world somehow felt a little brighter.
        </p>

        <p>
            One evening, something extraordinary happened.
            ${data.name} discovered a tiny doorway that had never
            been there before. Beyond it was ${adventure.place}.
        </p>

        <p>
            Waiting on the other side was ${adventure.creature},
            who had been searching everywhere for
            ${adventure.object}.
        </p>

        <p>
            "${data.name}," said the little friend,
            "I think you are exactly the person we need."
        </p>

        <p>
            At first, ${data.name} wasn't sure what to do.
            But being ${personality}, they knew that the best
            adventures often begin with a little bit of courage.
        </p>

        <p>
            Together, they set off to ${adventure.challenge}.
            Along the way they laughed, explored hidden places,
            followed sparkling trails and discovered that even the
            smallest person can make a very big difference.
        </p>

        <p>
            Then ${data.name} remembered something important:
            ${memory}
        </p>

        <p>
            That memory reminded ${data.name} that they were never
            truly alone. They carried the love of their family with
            them wherever they went.
        </p>

        <p>
            With a brave heart and a curious mind, ${data.name}
            solved the mystery.
        </p>

        <p>
            The magical world celebrated, the stars began to sparkle,
            and ${adventure.creature} smiled.
        </p>

        <p>
            "You did it, ${data.name}!"
        </p>

        <p>
            And as the adventure came to an end, ${data.name}
            returned home with a heart full of memories and a little
            more magic than they had when they left.
        </p>

        <p class="story-opening">
            And from that day forward, ${data.name} knew that
            wonderful adventures could be found anywhere —
            especially when you believe in yourself.
        </p>

    `;

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

storyForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name =
        childNameInput.value.trim();

    if (!name) {

        alert(
            "Please enter your child's name first."
        );

        childNameInput.focus();

        return;

    }


    const data = {

        name: name,

        age:
            childAgeInput.value,

        personality:
            personalityInput.value.trim(),

        favorites:
            favoritesInput.value.trim(),

        memory:
            memoryInput.value.trim(),

        family:
            familyInput.value.trim(),

        adventure:
            getSelectedAdventure()

    };


    /* STORY TITLE */

    storyHeading.textContent =
        `Once Upon a Time... ${data.name}`;


    /* CREATE STORY */

    storyText.innerHTML =
        createStory(data);


    /* ADD PHOTO */

    if (uploadedPhoto) {

        storyPhoto.innerHTML = `
            <img
                src="${uploadedPhoto}"
                alt="${data.name}"
            >
        `;

    } else {

        storyPhoto.innerHTML = "";

    }


    /* SHOW STORY */

    storyOutput.classList.remove("hidden");

    setTimeout(function () {

        storyOutput.scrollIntoView({
            behavior: "smooth"
        });

    }, 100);

});


/* =========================================================
   CREATE ANOTHER STORY
========================================================= */

function createAnotherStory() {

    storyOutput.classList.add("hidden");

    storyForm.reset();

    photoPreview.innerHTML = "";

    storyPhoto.innerHTML = "";

    uploadedPhoto = null;

    document
        .querySelector(
            'input[name="adventure"][value="magical"]'
        )
        .checked = true;

    document
        .getElementById("story-form")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   PRINT SUPPORT
========================================================= */

window.addEventListener("beforeprint", function () {

    document.body.classList.add("printing");

});

window.addEventListener("afterprint", function () {

    document.body.classList.remove("printing");

});


/* =========================================================
   STARTUP MESSAGE
========================================================= */

console.log(
    "✨ Once Upon My Child is ready."
);
