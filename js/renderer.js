import { getQueryParam } from "./utils.js";
import { loadCourseConfig } from "./fetcher.js";
import { setText, setHTML, setImage, setLink } from "./dom.js";

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
    setText("course-title", data.course.courseTitle);
    setText("course-number", data.course.courseNumber);
    setHTML("course-about", data.course.description.join("<br><br>"));
    setImage("cover-image", data.base + data.course.coverImage);

    // Populate section
    setText("course-term", data.section.term);
    setText("schedule", `${data.section.schedule.day} ${data.section.schedule.time}`);
    setText("location", data.section.schedule.location);

    // Populate textbook
    setImage("textbook-image", data.base + data.textbook.imagePath);
    setText("textbook-title", `${data.textbook.title} (${data.textbook.edition})`);

    // Populate instructor
    setText("instructor-name", `${data.instructor.firstName} ${data.instructor.lastName}`);
    setHTML("instructor-about", data.instructor.about);
    setImage("instructor-image", data.instructor.imagePath);
    setLink("instructor-link", data.instructor.url);

    // Buttons
    setLink("syllabus-button", data.base + data.course.templates.syllabus);
    setLink("modules-button", data.course.canvas.coursePath + "/modules");
    setLink("office-hours-button", data.section.officeHoursLink || "#");
    setLink("discord-link", data.course.contact?.discordLink?.url || "#");

    // Timeline logic (optional)
    if (window.renderTimeline) {
        window.renderTimeline(data.section.startDate, data.section.endDate);
    }
}

render();
