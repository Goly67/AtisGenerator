const form = document.getElementById('atisForm');
const icaoInput = document.getElementById('icao');
const atisIdentInput = document.getElementById('atisIdent');
const fetchRunwaysBtn = document.getElementById('fetchRunways');
const runwaysContainer = document.getElementById('runwaysContainer');
const landingRunwaysDiv = document.getElementById('landingRunways');
const departingRunwaysDiv = document.getElementById('departingRunways');
const generateAtisBtn = document.getElementById('generateAtis');
const atisOutput = document.getElementById('atisOutput');
const copyAtisBtn = document.getElementById('copyAtis');
const errorDiv = document.getElementById('error');

fetchRunwaysBtn.addEventListener('click', fetchRunways);
form.addEventListener('submit', generateAtis);
copyAtisBtn.addEventListener('click', copyAtisToClipboard);

async function fetchRunways() {
    const icao = icaoInput.value.toUpperCase();
    if (!icao) {
        showError('Please enter an ICAO code.');
        return;
    }

    try {
        const response = await fetch(`https://atisgenerator.com/api/v1/airports/${icao}`);
        if (!response.ok) throw new Error('Failed to fetch airport data');
        const data = await response.json();
        displayRunways(data.data.airport.runways.split(','));
    } catch (error) {
        showError('Failed to fetch runways. Please check the ICAO code and try again.');
    }
}

function displayRunways(runways) {
    landingRunwaysDiv.innerHTML = '<h4>Landing Runways</h4>';
    departingRunwaysDiv.innerHTML = '<h4>Departing Runways</h4>';

    runways.forEach(runway => {
        const landingItem = createRunwayCheckbox(runway, 'landing');
        const departingItem = createRunwayCheckbox(runway, 'departing');

        landingRunwaysDiv.appendChild(landingItem);
        departingRunwaysDiv.appendChild(departingItem);
    });

    runwaysContainer.style.display = 'block';
}

function createRunwayCheckbox(runway, type) {
    const div = document.createElement('div');
    div.className = 'runway-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${type}-${runway}`;
    checkbox.name = `${type}-runways`;
    checkbox.value = runway;

    const label = document.createElement('label');
    label.htmlFor = `${type}-${runway}`;
    label.textContent = runway;

    div.appendChild(checkbox);
    div.appendChild(label);

    return div;
}

async function generateAtis(e) {
    e.preventDefault();
    const icao = icaoInput.value.toUpperCase();
    const ident = atisIdentInput.value.toUpperCase();
    const remarks = document.getElementById('remarks').value;

    const landingRunways = Array.from(document.querySelectorAll('input[name="landing-runways"]:checked')).map(el => el.value);
    const departingRunways = Array.from(document.querySelectorAll('input[name="departing-runways"]:checked')).map(el => el.value);

    const atisData = {
        ident,
        icao,
        remarks1: remarks,
        landing_runways: landingRunways,
        departing_runways: departingRunways,
        "output-type": "atis"
    };

    try {
        const response = await fetch(`https://atisgenerator.com/api/v1/airports/${icao}/atis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(atisData)
        });

        if (!response.ok) throw new Error('Failed to generate ATIS');

        const data = await response.json();
        displayAtis(data.data);
    } catch (error) {
        showError('Failed to generate ATIS. Please try again.');
    }
}

function displayAtis(data) {
    atisOutput.textContent = data.text;
    copyAtisBtn.style.display = 'block';
    errorDiv.textContent = '';
}

function copyAtisToClipboard() {
    const atisText = atisOutput.textContent;
    navigator.clipboard.writeText(atisText).then(() => {
        copyAtisBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyAtisBtn.textContent = 'Copy ATIS';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function showError(message) {
    errorDiv.textContent = message;
}

// Capitalize ICAO and ATIS Ident inputs
icaoInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    // Automatically move focus to ATIS Ident after ICAO input is filled
    if (this.value.length === 4) { // Assuming ICAO code length is 4
        atisIdentInput.focus();
    }
});

atisIdentInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    // Automatically trigger fetch runways after ATIS Ident input is filled
    if (this.value.length > 0) {
        fetchRunways();
    }
});
