var state = {
  currentStep: 1,
  story: {
    type: "Magical Adventure"
  }
};

console.log("APP JS CLEAN TEST");

function setupAdventureCards() {
  var container = document.getElementById("storyTypeChoices");

  if (!container) {
    console.log("Adventure container not found");
    return;
  }

  var cards = container.querySelectorAll(".choice-card");

  cards.forEach(function(card) {
    card.addEventListener("click", function() {
      cards.forEach(function(item) {
        item.classList.remove("selected");
        item.setAttribute("aria-selected", "false");
      });

      card.classList.add("selected");
      card.setAttribute("aria-selected", "true");

      var selectedType = card.getAttribute("data-value");

      if (selectedType) {
        state.story.type = selectedType;
      }

      console.log("Adventure selected:", state.story.type);
    });
  });

  console.log("Adventure cards ready");
}

function initializeApp() {
  setupAdventureCards();
}

document.addEventListener("DOMContentLoaded", function() {
  initializeApp();
});
