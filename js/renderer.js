import { renderTimeline } from 'https://uid100.github.io/timeline/js/timeline.js';
import { getQueryParam } from "./utils.js";
import { setTextAll } from "./utils.js";
import { loadCourseConfig } from "./fetcher.js";
import { setText, setHTML, setImage, setLink } from "./dom.js";

function resolveCourseAsset(courseId, relativePath) {
    return `https://raw.githubusercontent.com/uid100/${courseId}/main${relativePath}`;
}


// --- Main render pipeline for outcomes & objectives ---
async function renderOutcomesAndObjectives() {
  try {
    const base = getCourseBaseURL();

    // 1) Load course.json
    const courseConfig = await fetchJSON(`${base}course.json`);

    // Expect keys: "outcomes" and "objectives" (relative paths)
    const outcomesPath = courseConfig.outcomes;
    const objectivesPath = courseConfig.objectives;

    if (!outcomesPath && !objectivesPath) {
      console.warn('course.json missing "outcomes" and "objectives" keys');
      return;
    }

    // 2) Fetch each file if present
    const [outcomesData, objectivesData] = await Promise.all([
      outcomesPath ? fetchJSON(`${base}${outcomesPath}`) : Promise.resolve(null),
      objectivesPath ? fetchJSON(`${base}${objectivesPath}`) : Promise.resolve(null)
    ]);

    // 3) Render into placeholders
    if (Array.isArray(outcomesData)) {
      renderListInto('outcomes', outcomesData);
    } else if (outcomesData) {
      console.warn('Outcomes JSON is not an array:', outcomesData);
    }

    if (Array.isArray(objectivesData)) {
      renderListInto('objectives', objectivesData);
    } else if (objectivesData) {
      console.warn('Objectives JSON is not an array:', objectivesData);
    }
  } catch (err) {
    console.error('Error rendering outcomes/objectives:', err);
    // Optional: show a user-friendly message
    const outcomesEl = document.querySelector('#outcomes');
    const objectivesEl = document.querySelector('#objectives');
    const msg = 'Unable to load this section at the moment.';
    if (outcomesEl && !outcomesEl.innerHTML.trim()) outcomesEl.textContent = msg;
    if (objectivesEl && !objectivesEl.innerHTML.trim()) objectivesEl.textContent = msg;
  }
}

async function render() {
    const courseId = getQueryParam("course");
    if (!courseId) {
        console.error("Missing ?course= parameter");
        return;
    }

    const data = await loadCourseConfig(courseId);

    // Populate college
    setImage("college-logo", data.college.logoPath);
    setLink("college-link", data.college.website);

    // Populate course
    setTextAll(".course-title", data.course.courseTitle);
    setTextAll(".course-number", data.course.courseNumber);
    setTextAll(".units", data.course.units);
    setHTML("course-about", data.course.description.join("<br>"));
    // setImage("cover-image", data.base + data.course.coverImage);
    setImage("cover-image", resolveCourseAsset(courseId, data.course.coverImage));

    // Populate section
    setTextAll(".course-term", data.section.term);
    setTextAll(".course-id", data.section.courseId);
    setTextAll(".section-id", data.section.sectionNumber);
    setTextAll(".schedule", `${data.section.schedule.day} ${data.section.schedule.time}`);
    setTextAll(".location", data.section.schedule.location);

    // Populate textbook
    // setImage("textbook-image", data.base + data.textbook.imagePath);
    setImage("textbook-image", resolveCourseAsset(courseId, data.textbook.imagePath));
    setText("textbook-title", `${data.textbook.title} (${data.textbook.edition})`);

    // Populate instructor
    setText("instructor-name", `${data.instructor.firstName} ${data.instructor.lastName}`);
    setText("instructor-email", `${data.course.contact.instructorEmail}`);
    setHTML("instructor-about", data.instructor.about);
    setImage("instructor-image", data.instructor.imagePath);
    setLink("instructor-link", data.instructor.url);
    setText("office-hours", data.course.contact?.officeHours?.label || "Office Hours");
    setLink("zoom-link", data.course.contact?.officeHours?.zoomLink || "#");

    // outcomes and objectives
    const cloPath = data.course.outcomes;
    const sloPath = data.course.objectives;

    // --- Render a list (injects a <ul> inside the placeholder element) ---
    function renderListInto(containerSelectorOrId, items) {
    // Supports selectors like '#outcomes' or raw IDs like 'outcomes'
    const selector = containerSelectorOrId.startsWith('#')
        ? containerSelectorOrId
        : `#${containerSelectorOrId}`;

    const container = document.querySelector(selector);
    if (!container) return;

    // Build HTML list
    const html = [
        '<ul class="list-unstyled ms-3">',
        ...items.map(item => {
        const label = item.id ? `<strong>${item.id}</strong>:` : '';
        const text = getItemText(item);
        return `<li class="mb-1">${label} ${text}</li>`;
        }),
        '</ul>'
    ].join('');

    // Insert the list inside the existing <p> placeholder
    container.innerHTML = html;
    }

    // outcomes and objectives rendering
    if (cloPath) {
        const cloData = await fetch(cloPath).then(res => res.json());
        if (Array.isArray(cloData)) {
            renderListInto('outcomes', cloData);
        }
    }
    if (sloPath) {
        const sloData = await fetch(sloPath).then(res => res.json());
        if (Array.isArray(sloData)) {
            renderListInto('objectives', sloData);
        }
    }

    // Buttons
    // setLink("syllabus-button", data.base + data.course.templates.syllabus);
    const syllabusUrl = 
        data.section.canvas.server +
        data.section.canvas.coursePath +
        "/assignments/syllabus";
    setLink("syllabus-button", syllabusUrl);
    const modulesUrl = 
        data.section.canvas.server +
        data.section.canvas.coursePath +
        "/modules";
    setLink("modules-button", modulesUrl);
    setLink("office-hours-button", data.course.contact?.officeHours?.zoomLink || "#");
    setText("office-hours-button", data.course.contact?.officeHours?.label || "Office Hours");
    setLink("discord-link", data.course.contact?.discordLink?.url || "#");
    setText("discord-link", data.course.contact?.discordLink?.label || "Discord");

    if (window.renderTimeline) {
        renderTimeline(data.section.dates.start, data.section.dates.end);
    }

}

render();
