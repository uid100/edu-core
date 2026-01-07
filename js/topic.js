
// js/topic.js
import { getQueryParam } from "./utils.js";
import { loadCourseConfig } from "./fetcher.js";
import { setText } from "./dom.js";
import { resolvePageSpec, fetchHtmlOrAlert, buildTopicCard } from "./content-loader.js";

(async function initTopic() {
  const courseId = getQueryParam("course");
  const moduleId = getQueryParam("module");
  const pageId   = getQueryParam("page");

  if (!courseId || !moduleId || !pageId) {
    const mount = document.getElementById("topicContainer");
    if (mount) {
      mount.innerHTML = `
        <div class="alert alert-warning" role="alert">
          Missing query params. Expected:
          <code>?course=&lt;repo&gt;&amp;module=&lt;moduleId&gt;&amp;page=&lt;pageId&gt;</code><br/>
          Example:
          <code>templates/topic.html?course=palomar-csit175&amp;module=01-sequential&amp;page=hello-world</code>
        </div>`;
    }
    return;
  }

  // Load course config; header/timeline populated by renderer.js
  const data = await loadCourseConfig(courseId);
  const courseBase = data.courseBase; // raw.githubusercontent.com/uid100/<courseId>/main/
  const course     = data.course;

  const spec = resolvePageSpec(course, courseBase, { moduleId, pageId });
  if (!spec) {
    const mount = document.getElementById("topicContainer");
    if (mount) {
      mount.innerHTML = `
        <div class="alert alert-warning" role="alert">
          Content not found in <code>${courseId}/course.json</code> under
          <code>content.modules["${moduleId}"].pages["${pageId}"]</code>.
        </div>`;
    }
    return;
  }

  // Set page title
  if (spec.title) setText("topic-title", spec.title);

  // Fetch and render in a card
  const html = await fetchHtmlOrAlert(spec.url);
  const card = buildTopicCard({ title: spec.title, html, headerStyle: "primary" });
  const mountEl = document.getElementById("topicContainer");
  mountEl.innerHTML = "";
  mountEl.appendChild(card);
})();
