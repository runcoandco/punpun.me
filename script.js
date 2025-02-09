// Function to handle food search and validation
function searchFood() {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();
    const errorMessage = document.getElementById('errorMessage');
    const validInput = /^[a-zA-Z\s]+$/;

    if (!query) {
        errorMessage.textContent = "Ingredient not recognized. Please enter a valid food item.";
        return;
    }

    if (!validInput.test(query)) {
        errorMessage.textContent = "Invalid input. Please enter only letters.";
        return;
    }

    errorMessage.textContent = "";
    window.location.href = `results.html?food=${encodeURIComponent(query)}`;
}

// Function to get the singular or plural form of a word
function getSingularOrPlural(word) {
    if (word.endsWith("s")) {
        return word.slice(0, -1); // Convert plural to singular (e.g., eggs → egg)
    } else {
        return word + "s"; // Convert singular to plural (e.g., onion → onions)
    }
}

// Function to handle search results and display appropriate information
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const foodQuery = params.get("food");

    if (foodQuery) {
        fetch("data.json")
            .then(response => response.json())
            .then(data => {
                let foundFood = null;
                const singularOrPlural = getSingularOrPlural(foodQuery);

                for (let key in data) {
                    if (
                        key === foodQuery || 
                        key === singularOrPlural || 
                        (data[key].synonyms && data[key].synonyms.includes(foodQuery)) ||
                        (data[key].synonyms && data[key].synonyms.includes(singularOrPlural))
                    ) {
                        foundFood = key;
                        break;
                    }
                }

                const resultBox = document.getElementById("resultBox");
                const resultImage = document.getElementById("resultImage");
                const foodResult = document.getElementById("foodResult");
                const reason = document.getElementById("reason");

                if (foundFood) {
                    const foodItem = data[foundFood];

                    if (foodItem.status === "no") {
                        resultImage.src = "superman_no.png";
                        resultBox.classList.add("no");
                        foodResult.textContent = `You cannot eat ${foundFood}.`;
                        reason.textContent = foodItem.reason || "No additional information.";
                    } else if (foodItem.status === "maybe") {
                        resultImage.src = "superman_maybe.png";
                        resultBox.classList.add("caution");
                        foodResult.textContent = `You can eat ${foundFood} in moderation.`;
                        reason.textContent = foodItem.reason || "Consume in moderation.";
                    } else {
                        resultImage.src = "superman_yes.png";
                        resultBox.classList.add("yes");
                        foodResult.textContent = `You can eat ${foundFood}.`;
                        reason.textContent = foodItem.reason || "This food is safe for your diet.";
                    }
                } else {
                    resultImage.src = "superman_error.png";
                    resultBox.classList.add("error-box");
                    foodResult.textContent = "Did you mean something else?";
                    reason.textContent = "This ingredient is not recognized. Try using a different name.";
                }
            })
            .catch(error => console.error("Error loading data:", error));
    }

    // Function to populate the restrictions page with categorized foods in tables
    if (document.getElementById("restrictedList")) {
        fetch("data.json")
            .then(response => response.json())
            .then(data => {
                const restrictedList = document.getElementById("restrictedList");
                const cautionList = document.getElementById("cautionList");
                const approvedList = document.getElementById("approvedList");

                // Loop through each food in the JSON
                for (let key in data) {
                    let tableRow = document.createElement("tr");
                    tableRow.innerHTML = `
                        <td>${key.charAt(0).toUpperCase() + key.slice(1)}</td>
                        <td>${data[key].reason || "No specific reason provided."}</td>
                    `;

                    // Sort foods into their respective tables
                    if (data[key].status === "no") {
                        restrictedList.appendChild(tableRow);
                    } else if (data[key].status === "maybe") {
                        cautionList.appendChild(tableRow);
                    } else {
                        approvedList.appendChild(tableRow);
                    }
                }
            })
            .catch(error => console.error("Error loading restrictions:", error));
    }

    // Function to make sections collapsible
    let collapsibles = document.querySelectorAll(".collapsible");

    collapsibles.forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            content.classList.toggle("show");
        });
    });
});
