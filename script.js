let countries = {};
let previousGuesses = [];
let lastGuess = null;

window.onload = function() {
    fetch('countries.json')
        .then(response => response.json())
        .then(data => {
            // Transforming the array to an object for easier access
            data.forEach(country => {
                countries[country.name] = { lat: country.latitude, lon: country.longitude };
            });
        })
        .catch(error => console.error('Error loading the country data:', error));
};

function haversine(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function addGuess() {
    const currentGuess = document.getElementById('current_guess').value;
    const feedback = document.getElementById('feedback').value;
    if (currentGuess.trim() === "") {
        alert("Please enter a country name.");
        return;
    }
    previousGuesses.push({ country: currentGuess, feedback: feedback });
    lastGuess = { country: currentGuess, feedback: feedback };
    document.getElementById('current_guess').value = ""; // Clear the input after adding
    suggestNextCountry(); // Automatically suggest the next country after adding a guess
}

function suggestNextCountry() {
    if (!lastGuess) return; // Ensure there is a last guess to compare to

    const { country: lastCountry, feedback: lastFeedback } = lastGuess;
    const { lat: lastLat, lon: lastLon } = countries[lastCountry];

    let suggestedCountry = "";
    let bestDistance = Infinity;

    for (const [country, coords] of Object.entries(countries)) {
        if (previousGuesses.some(guess => guess.country === country)) continue;

        const distance = haversine(lastLat, lastLon, coords.lat, coords.lon);
        if ((lastFeedback === "warmer" && distance < bestDistance) ||
            (lastFeedback === "colder" && distance > bestDistance)) {
            bestDistance = distance;
            suggestedCountry = country;
        }
    }

    const suggestionElement = document.getElementById('suggestion');
    suggestionElement.innerText = "Next country to guess: " + suggestedCountry;
}
