const contentMapping = {
    studentLab: "student-lab.html",
    courseDescription: "course-description.html",
    // courseObjectives: "course-objectives.html",
    requiredMaterials: "required-materials.html",
    recommendedMaterials: "recommended-materials.html",
    courseExpectations: "course-expectations.html",
    aiPolicy: "ai-policy.html",
    // gradingScale: "grading-scale.html",
    gradingScale: "grading-details.html",
    // courseSchedule: "course-schedule.html",
    courseSchedule: "outline.html",
    classroomEtiquette: "classroom-etiquette.html",
    criticalDates: "critical-dates.html",
};

// Function to extract query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// function to read content from JSON file and populate the HTML for objectives and outcomes.

async function loadObjectivesAndOutcomes() {
    try {
        // Fetch the JSON file
        const jsonFilePath = "../" + getQueryParam('path');
        const jsonFileName = jsonFilePath + "/content.json";
        const response = await fetch(jsonFileName);
        const data = await response.json();

        // Populate objectives and outcomes
        const objectives = data?.course?.objectives;
        const outcomes = data?.course?.outcomes;


        const objectivesContainer = document.getElementById("objectives");
        if (objectivesContainer && typeof (objectives) !== 'undefined') {
            const ol = document.createElement("ol");
            objectives.forEach((objectiveObject) => {
                const objectiveElement = document.createElement("li");
                objectiveElement.textContent = objectiveObject.objective;
                ol.appendChild(objectiveElement);
            });
            objectivesContainer.appendChild(ol);
        }

        const outcomesContainer = document.getElementById("outcomes");
        if (outcomesContainer && typeof (outcomes) !== 'undefined') {
            const ol = document.createElement("ol");
            outcomes.forEach((outcomeObject) => {
                // const outcome = `${outcomeObject.id}: ${outcomeObject.outcome}`;
                const outcomeElement = document.createElement("li");
                outcomeElement.textContent = outcomeObject.outcome;
                ol.appendChild(outcomeElement);
            });
            outcomesContainer.appendChild(ol);
        }
    } catch (error) {
        console.error('Error loading objectives and outcomes:', error);
    }
}

async function loadContent() {
    for (const [id, filePath] of Object.entries(contentMapping)) {
        try {
            const jsonFilePath = "../" + getQueryParam('path');
            const response = await fetch(jsonFilePath + '/' + filePath);
            if (response.ok) {
                const htmlContent = await response.text();
                document.getElementById(id).innerHTML = htmlContent;
            } else {
                document.getElementById(id).innerHTML = `<p style="color: red;">Failed to load content: ${filePath}</p>`;
            }
        } catch (error) {
            console.error("Error loading content:", error);
            document.getElementById(id).innerHTML = `<p style="color: red;">Error loading content: ${filePath}</p>`;
        }
    }
}

async function loadCourseDetails() {
    try {
        // Fetch the JSON file
        const jsonFilePath = "../" + getQueryParam('path');
        const jsonFileName = jsonFilePath + "/content.json";
        const response = await fetch(jsonFileName);
        const data = await response.json();

        document.getElementById('document-title').innerHTML
            = data?.templates?.syllabus?.title;

        // Populate table cells with JSON data
        let cell = document.getElementById('courseTitle');
        let cellContent = cell.innerHTML;
        cellContent += `${data?.course?.section?.courseId} ${data?.course?.courseTitle}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('term');
        cellContent = cell.innerHTML;
        cellContent += `${data?.course?.section?.term}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('schedule');
        cellContent = cell.innerHTML;
        cellContent += `${data?.course?.section?.schedule?.day} ${data.course?.section?.schedule?.time}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('location');
        cellContent = cell.innerHTML;
        cellContent += `${data?.course?.section?.schedule?.location}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('units');
        cellContent = cell.innerHTML;
        cellContent += `${data?.course?.units}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('instructorName');
        cellContent = cell.innerHTML;
        cellContent += `${data?.instructor?.firstName} ${data?.instructor?.lastName}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('instructorEmail');
        cellContent = cell.innerHTML;
        cellContent += `${data?.instructor?.email}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('officeLocation');
        let officeLocation = data?.course?.contact?.officeHours?.location || "";
        let zoomLink = data?.course?.contact?.officeHours?.zoomLink || "";
        cellContent = cell.innerHTML;
        cellContent += officeLocation;

        if (zoomLink) {
            cellContent += `<a href="${zoomLink}">Zoom Link</a>`;
        }
        cell.innerHTML = cellContent;

        cell = document.getElementById('officeHours');
        cellContent = cell.innerHTML;
        cellContent += `${data?.course?.contact?.officeHours?.schedule}`;
        cell.innerHTML = cellContent;

        cell = document.getElementById('prerequisites');
        cellContent = cell.innerHTML;
        cellContent += `${data?.course?.prerequisites}`;
        cell.innerHTML = cellContent;

        // update the objectives and outcomes
        loadObjectivesAndOutcomes();

    } catch (error) {
        console.error('Error loading table data:', error);
    }
}
