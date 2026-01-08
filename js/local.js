
function setPageTitleFromJSON(jsonPath) {
    console.log("page title");
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Set the page title
            document.title = data.title;
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}

async function injectFragment(id, url) {
    try {
        const container = document.getElementById(id);
        if (!container) return;

        const response = await fetch(url);
        const html = await response.text();
        container.innerHTML = html;
    } catch (e) {
        console.error("Fragment load error:", url, e);
    }
}

// Function to initialize the timeline
function initializeTimeline(jsonPath) {
    console.log("timeline");
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load JSON data.");
            }
            return response.json();
        })
        .then(data => {
            const { startDate, endDate } = data?.course?.section;

            // Parse dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();
            //const today = new Date('2025-08-26'); // Fixed date for consistent testing


            // Get timeline element
            const timeline = document.querySelector('.timeline');

            // Calculate total duration
            const totalDuration = end - start;
            const currentDuration = today - start;

            // Prevent out-of-range calculations
            const currentPosition = Math.max(
                0,
                Math.min((currentDuration / totalDuration) * 100, 100)
            );

            // Set marker positions
            document.getElementById('start-marker').style.left = '0%';
            document.getElementById('end-marker').style.left = '100%';
            document.getElementById('current-marker').style.left = `${currentPosition}%`;

            // Set labels
            document.getElementById('start-label').textContent = start.toLocaleDateString() //toDateString();
            document.getElementById('end-label').textContent = end.toLocaleDateString();
            document.getElementById('current-label').innerHTML = 'today:<br>' + today.toLocaleDateString();
            // document.getElementById('current-label').textContent = today.toLocaleDateString();

            document.getElementById('start-label').style.left = '0%';
            document.getElementById('end-label').style.left = '100%';
            document.getElementById('current-label').style.left = `${currentPosition}%`;
        })
        .catch(error => {
            console.error("Error loading timeline data:", error);
        });
}

// Function to extract query parameters
function getQueryParam(param) {
    console.log("get: " + param);
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Load JSON data and render content
async function loadAndRenderJSON() {
    console.log("loadAndRenderJSON");
    const jsonFilePath = getQueryParam('path');
    const jsonFile = "../edu/" + jsonFilePath + "/content.json";

    if (!jsonFile) {
        document.getElementById('content').textContent = "Error: No JSON file specified.";
        return;
    }

    try {
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
        }
        const data = await response.json();

        // Update the page title and content
        document.getElementById('pageTitle').textContent = data.title || "Default Title";
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = ''; // Clear any existing content

        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.textContent = item;
                contentDiv.appendChild(itemDiv);
            });
        } else {
            contentDiv.textContent = "No items found in the JSON file.";
        }
    } catch (error) {
        console.error(error);
        document.getElementById('content').textContent = "Error loading JSON file.";
    }
}

async function loadContent(id, filePath) {
    console.log("loadContent: " + id);
    // Check if the element with the given ID exists
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID ${id} not found.`);
        return;
    }
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const htmlContent = await response.text();
            document.getElementById(id).innerHTML = htmlContent;
        } else {
            document.getElementById(id).innerHTML = `<p style="color: red;">Failed to load content: ${filePath}</p>`;
        }
    } catch (error) {
        console.error("Error loading content: id:" + id, error);
        document.getElementById(id).innerHTML = `<p style="color: red;">Error loading content: ${filePath}</p>`;
    }

}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded");
    // The path to the JSON file
    // const jsonFilePath = "../edu/" + getQueryParam('path');
    const jsonFilePath =  getQueryParam('path');
    const jsonFile = jsonFilePath + "/content.json";
    console.log("jsonFile: " + jsonFile);
    if (!jsonFile) {
        document.getElementById('content').textContent = "Error: No JSON file specified.";
        return;
    }
    const moduleNum = getQueryParam('module');

    // Fetch the JSON file
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error loading JSON file: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const courseTitle = data?.course?.courseTitle;
            const coverImagePath = data?.course?.coverImage;
            const website = data?.college?.website;
            const term = data?.course?.section?.term;
            const meetingTime = data?.course?.section?.schedule?.day + " " + data?.course?.section?.schedule?.time;
            const meetingLocation = data?.course?.section?.schedule?.location;
            const courseNumber = data?.course?.courseNumber;
            const section = data?.course?.section?.sectionNumber;
            const courseId = data?.course?.section?.courseId;
            const hyflex = data?.course?.section?.schedule?.hyflex || null;
            const units = data?.course?.units;
            const coursePath = data?.canvas?.server + data?.canvas?.coursePath;
            const textbookTitle = data?.course?.textbook?.title;
            const textbookAuthor = data?.course?.textbook?.author;
            const textbookImagePath = data?.course?.textbook?.imagePath;
            const syllabusTemplatePath = data?.templates?.syllabus?.path;
            const policiesTemplatePath = data?.templates?.policies?.path;
            const description = data?.course?.description;
            const officeHours = data?.course?.contact?.officeHours?.schedule;
            const officeHoursLink = data?.course?.contact?.officeHours?.zoomLink;
            const discordServer = data?.course?.contact?.discordLink?.label;
            const discordLinkUrl = data?.course?.contact?.discordLink?.url;
            const logoPath = data?.college?.logoPath;
            const { firstName, lastName } = data?.instructor;
            const instructorImagePath = data?.instructor?.imagePath;
            const instructorAbout = data?.instructor?.about;
            const instructorEmail = data?.instructor?.email;
            const instructorLink = data?.instructor?.url;
            const objectives = data?.course?.objectives;
            console.log("module-num: " + moduleNum);
            console.log("moduleNum type: ", typeof moduleNum);
            const moduleName = data?.modules?.find(m => String(m.module) === String(moduleNum))?.title;
            console.log("module-name: " + moduleName);
            const outcomes = data?.course?.outcomes;
            const requiredMaterialsPath = data?.course?.requiredMaterialsPath;
            const recommendedMaterialsPath = data?.course?.recommendedMaterialsPath;
            const gradingDetailsPath = data?.course?.gradingDetailsPath;
            const accommodationsPath = data?.course?.accommodationsPath;
            const topicOutlinePath = data?.course?.topicOutlinePath;


            // set the page content
            if (courseTitle) {
                const titleElement = document.getElementById("course-title");
                if (titleElement) { titleElement.textContent = courseTitle; }
            } else {
                console.error("Course title not found in JSON.");
            }

            // set the logo image source
            if (logoPath) {
                // Replace `~` with the base path if necessary
                const relativePath = logoPath.replace(/^~\//, "");

                // Set the src attribute of the image
                const imgElement = document.getElementById("college-logo");
                if (imgElement) { imgElement.src = relativePath; }
            } else {
                console.error("Logo path not found in JSON.");
            }

            // set the website link
            if (website) {
                // Set the href attribute of the link
                const linkElement = document.getElementById("college-link");
                if (linkElement) { linkElement.href = website; }
            } else {
                console.error("Website link not found in JSON.");
            }

            // cover image
            if (coverImagePath) {
                // Replace `~` with the base path if necessary
                const relativePath = coverImagePath.replace(/^~\//, "");

                // Set the src attribute of the image
                const imgElement = document.getElementById("cover-image");
                if (imgElement) { imgElement.src = relativePath; }

                // set the homepage link from the course-home element
                const homeLink = document.getElementById("course-home");
                if (homeLink) { homeLink.href = coursePath; }

                const imgCaption = document.getElementById("cover-caption");
                if (imgCaption) { imgCaption.textContent = courseTitle; }
            } else {
                console.error("Cover image path not found in JSON.");
            }

            // configure timeline
            const timelineElement = document.getElementsByClassName("timeline");
            if (timelineElement && timelineElement.length > 0) {
                initializeTimeline(jsonFile);
            }

            // course section
            const termElement = document.getElementById("course-term");
            if (termElement) { termElement.textContent = term; }

            const courseIdElement = document.getElementById("course-id");
            if (courseIdElement && typeof (courseId) !== 'undefined') { courseIdElement.textContent = courseId; }

            const sectionElement = document.getElementById("section-id");
            if (sectionElement && typeof (section) !== 'undefined') { sectionElement.textContent = section; }

            const sched = document.getElementById("schedule");
            if (sched) { sched.textContent = meetingTime; }

            const loc = document.getElementById("location");
            if (loc) { loc.textContent = meetingLocation; }

            const courseNumberElement = document.getElementById("course-number");
            if (courseNumberElement) { courseNumberElement.textContent = courseNumber; }

            const courseNumItem = document.getElementById("course-num");
            if (courseNumItem) { courseNumItem.textContent = courseNumber; }

            const unitsElement = document.getElementById("units");
            if (unitsElement) { unitsElement.textContent = units; }

            const instructorId = document.getElementById("instructor");
            if (instructorId) { instructorId.textContent = `${firstName} ${lastName}`; }

            const instructorEmailElement = document.getElementById("instructor-email");
            if (instructorEmailElement) { instructorEmailElement.textContent = instructorEmail; }

            const officeHoursElement = document.getElementById("office-hours");
            if (officeHoursElement) { officeHoursElement.textContent = officeHours; }

            const zoomLinkElement = document.getElementById("zoom-link");
            if (zoomLinkElement) { zoomLinkElement.href = officeHoursLink; }

            const officeLocation = document.getElementById("office-location");
            if (officeLocation) {
                officeLocation.textContent = `${data?.course?.contact?.officeHours?.location}`
                    + ` ${data?.course?.contact?.officeHours?.zoomLink}`;
            }

            const discordLinkElement = document.getElementById("discord-link");
            if (discordLinkElement) {
                discordLinkElement.textContent = discordServer;
                discordLinkElement.href = discordLinkUrl;
            }

            // if the objectives and outcomes are not defined, set the course-objectives div to hidden
            if (typeof (objectives) === 'undefined' && typeof (outcomes) === 'undefined') {
                const courseObjectives = document.getElementById("course-objectives");
                if (courseObjectives) { courseObjectives.setAttribute("hidden", true); }
            } else {
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
            }

            // set the hyflex link
            const hyflexElement = document.getElementById("hyflex");
            if (hyflex && hyflexElement) {
                // const hyflexPage = coursePath + "/hyflex";
                const hyflexPage = "../common/hyflex.html";
                const hyflexLink = document.createElement("a");
                hyflexLink.href = hyflexPage;
                hyflexLink.textContent = "Hyflex";
                hyflexElement.appendChild(hyflexLink);
                const newTag = document.createElement("span");
                newTag.textContent = " New!";
                newTag.className = "highlight";
                hyflexElement.appendChild(newTag);
            } else {
                if (hyflexElement) { hyflexElement.setAttribute("hidden", true); }
            }

            // about course
            const courseAbout = document.getElementById("course-about");
            // // replace newline with <br>
            // const htContent = description.replace(/\n/g, "<br>");
            // if (courseAbout) { courseAbout.innerHTML = htContent; }
            if (courseAbout && Array.isArray(description)) { // Check if it's an array
                description.forEach(paragraphText => {
                    const paragraph = document.createElement('p');
                    paragraph.innerHTML = paragraphText.replace(/\n/g, "<br>");  // Set text content (safer than innerHTML)
                    courseAbout.appendChild(paragraph);
                });
            } else if (courseAbout) {
                // Handle the case where description is not an array (e.g., log an error or display a default message)
                console.error("Description is not an array.");
                courseAbout.textContent = "Course description not available."; // Or some default message.
            }

            // textbook image
            if (textbookImagePath) {
                // Replace `~` with the base path if necessary
                const relativePath = textbookImagePath.replace(/^~\//, "");

                // Set the src attribute of the image
                const imgElement = document.getElementById("textbook-image");
                if (imgElement) { imgElement.src = relativePath; }

                const bookTitle = textbookTitle + "<br>" + textbookAuthor;
                const bookElement = document.getElementById("textbook-title");
                if (bookElement) { bookElement.innerHTML = bookTitle; }
            } else {
                console.log("Textbook image path not found in JSON.");
            }

            // instructor name
            const instructor = document.getElementById("instructor-name");
            if (instructor) { instructor.textContent = `${firstName} ${lastName}`; }
            const aboutInstructor = document.getElementById("instructor-about");
            if (aboutInstructor) { aboutInstructor.textContent = instructorAbout; }
            const instructorUrl = document.getElementById("instructor-link");
            if (instructorUrl) { instructorUrl.href = instructorLink; }

            // instructor image
            if (instructorImagePath) {
                // Replace `~` with the base path if necessary
                const relativePath = instructorImagePath.replace(/^~\//, "");

                // Set the src attribute of the image
                const imgElement = document.getElementById("instructor-image");
                if (imgElement) { imgElement.src = relativePath; }
            } else {
                console.error("Instructor image path not found in JSON.");
            }

            // office hours
            const officeHoursButton = document.getElementById("office-hours-button");
            // console.log("office hours: " + officeHoursLink);
            if (officeHoursButton) {
                officeHoursButton.textContent = officeHours;
                officeHoursButton.href = officeHoursLink;
            }

            // discord link
            const discordLinkButton = document.getElementById("discord-link");
            if (discordLinkButton) {
                discordLinkButton.textContent = discordServer;
                discordLinkButton.href = discordLinkUrl;
            }


            loadContent("required-materials", requiredMaterialsPath);
            loadContent("recommended-materials", recommendedMaterialsPath);
            loadContent("grading-details", gradingDetailsPath);
            loadContent("topic-outline", topicOutlinePath);
            loadContent("accommodations-details", accommodationsPath);

            // syllabus link
            console.log("syllabus..." + syllabusTemplatePath);
            const syllabusLink = document.getElementById("syllabus-button");
            if (syllabusLink) { syllabusLink.href = coursePath + "/assignments/syllabus"; }

            const syllabusTemplate = document.getElementById("syllabus-template");
            // check to see if the item is on the page.
            // check to see if the syllabus template path is defined
            if (syllabusTemplate) {
                if (syllabusTemplatePath) {
                    syllabusTemplate.href = syllabusTemplatePath + "?path=" + getQueryParam('path');
                } else {
                    const li = syllabusTemplate.closest("li");
                    if (li) { li.setAttribute("hidden", true); }
                }
            }

            console.log("policies..." + policiesTemplatePath);
            const deptPolicies = document.getElementById("policies-template");
            if (deptPolicies) {
                if (policiesTemplatePath) {
                    deptPolicies.href = policiesTemplatePath;
                } else {
                    const li = deptPolicies.closest("li");
                    if (li) { li.setAttribute("hidden", true); }
                }
            }
            const onlineClassesLink = document.getElementById("online-classes");
            if (onlineClassesLink) {
                const hrefLink = onlineClassesLink.href
                onlineClassesLink.href = hrefLink + "?path=" + getQueryParam('path');
            }

            // update the module name
            console.log("moduleNum: " + moduleNum);
            console.log(" moduleName: " + moduleName);
            const moduleNameElement = document.getElementById("module-title");
            if (moduleNameElement) {
                moduleNameElement.textContent = moduleName;
            }

            // modules link
            const modulesLink = document.getElementById("modules-button");
            if (modulesLink) { modulesLink.href = coursePath + "/modules"; }
        })
        .catch(error => {
            console.error("Failed to load or parse JSON:", error);
        });

    injectFragment("shared-header", "/course-content/common/page-header.html");
    injectFragment("shared-footer", "/course-content/common/footer.html");

});
