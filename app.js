var state = {
  currentStep: 1,
  story: {
    type: "Magical Adventure"
  }
};

function setupAdventureCards() {
  var container = document.getElementById("storyTypeChoices");

  if (!container) {
    console.log("Adventure container not found");
    return;
  }

  var cards = container.querySelectorAll(".choice-card");

  cards.forEach(function (card) {
    card.addEventListener("click", function () {

      cards.forEach(function (item) {
        item.classList.remove("selected");
        item.setAttribute("aria-selected", "false");
      });

      card.classList.add("selected");
      card.setAttribute("aria-selected", "true");

      state.story.type =
        card.getAttribute("data-value") ||
        "Magical Adventure";

      console.log(
        "Adventure selected:",
        state.story.type
      );
    });
  });

  console.log("Adventure cards ready");
}

function initializeApp() {
  setupAdventureCards();
  console.log("STEP 2 WORKING");
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );
} else {
  initializeApp();
}
