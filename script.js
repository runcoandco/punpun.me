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
    // Handle irregular plurals and special cases
    const irregularPlurals = {
        "cheese": "cheese",  // cheese is both singular and plural in context
        "sheep": "sheep",
        "fish": "fish",
        "deer": "deer",
        "rice": "rice",
        "bread": "bread",
        "meat": "meat",
        "milk": "milk"
    };

    // Check if word is in irregular list
    if (irregularPlurals[word]) {
        return irregularPlurals[word];
    }

    // Handle words ending in 'ies' (e.g., berries → berry)
    if (word.endsWith("ies") && word.length > 3) {
        return word.slice(0, -3) + "y";
    }

    // Handle words ending in 'y' (e.g., berry → berries)
    if (word.endsWith("y") && word.length > 1 && !"aeiou".includes(word[word.length - 2])) {
        return word.slice(0, -1) + "ies";
    }

    // Handle words ending in 'es' (e.g., tomatoes → tomato)
    if (word.endsWith("oes") && word.length > 3) {
        return word.slice(0, -2);
    }

    // Handle words ending in 'o' (e.g., tomato → tomatoes)
    if (word.endsWith("o") && word.length > 1) {
        return word + "es";
    }

    // Standard plural/singular conversion
    if (word.endsWith("s") && word.length > 1) {
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
