import { renderTimeline } from 'https://uid100.github.io/timeline/js/timeline.js';
import { getQueryParam } from "./utils.js";
import { setTextAll } from "./utils.js";
import { fetchJSON, loadCourseConfig } from "./fetcher.js";
import { setText, setHTML, setImage, setLink } from "./dom.js";
import { fetchHtmlOrAlert } from './content-loader.js';

function resolveCourseAsset(courseId, relativePath) {
    return `https://raw.githubusercontent.com/uid100/${courseId}/main${relativePath}`;
}

// bullet list into a container element
function renderListInto(id, items) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!Array.isArray(items) || items.length === 0) {
    el.textContent = ''; // or a friendly "No items" message
    return;
  }

  // Build the list HTML
  const html = [
    '<ul class="list-unstyled ms-3">',
    ...items.map(item => {
      const label = item.id ? `<strong>${item.id}</strong>:` : '';
      // Support either "outcome" or "objective" keys
      const text = item.outcome ?? item.objective ?? item.text ?? '';
      return `<li class="mb-1">${label} ${text}</li>`;
    }),
    '</ul>'
  ].join('');

  el.innerHTML = html;
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

    fetchJSON( data.courseBase + cloPath).then(cloData => {
        if (Array.isArray(cloData)) {
            renderListInto('outcomes', cloData);
        }
    });

    fetchJSON(data.courseBase + sloPath).then(sloData => {
        if (Array.isArray(sloData)) {
            renderListInto('objectives', sloData);
        }
    });

    // materials
    const materials = data?.course?.materials || {};
    if (materials != null) {
        const requiredPath = materials.required;
        const recommendedPath = materials.recommended;

        const requiredMaterialsEl = document.getElementById('required-materials');
        if ( requiredMaterialsEl && requiredPath ) {
            fetchHtmlOrAlert(data.courseBase + requiredPath).then(html => {
                requiredMaterialsEl.innerHTML = html;
            });
        }

        const recommendedMaterialsEl = document.getElementById('recommended-materials'); 
        if ( recommendedMaterialsEl && recommendedPath ) {
            fetchHtmlOrAlert(data.courseBase + recommendedPath).then(html => {
                recommendedMaterialsEl.innerHTML = html;
            });
        }
    }

    // grades
    const grades = data?.course?.gradingDetails || {};
    if (grades != null) {
        const gradingEl = document.getElementById('grading-details'); 
        if ( gradingEl && grades ) {
            fetchHtmlOrAlert(data.courseBase + grades).then(html => {
                gradingEl.innerHTML = html;
            });
        }
    }

    // accessibility and accommodations
    const accommodations = data?.course?.accommodations || {};
    if (accommodations != null) {
        const accommodationsEl = document.getElementById('accommodations-details'); 
        if ( accommodationsEl ) {
            fetchHtmlOrAlert(data.courseBase + accommodations).then(html => {
                accommodationsEl.innerHTML = html;
            });
        }
    }

    // outline
    const outline = data?.course?.topicOutline || {};
    if (outline != null) {
        const outlineEl = document.getElementById('outline'); 
        if ( outlineEl && outline ) {
            fetchHtmlOrAlert(data.courseBase + outline).then(html => {
                outlineEl.innerHTML = html;
            });
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
