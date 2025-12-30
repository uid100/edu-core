
// js/lab.js
import { getQueryParam } from "./utils.js";
import { fetchJSON, loadCourseConfig } from "./fetcher.js";
import { setText } from "./dom.js";

// Choose how to read shared 'py' repo assets:
// If py is published via GitHub Pages: https://uid100.github.io/py/01-sequential/ex/...
// If not, fallback to raw.githubusercontent.com.
function pyBaseUrl(usePages = true) {
  return usePages
    ? "https://uid100.github.io/py/01-sequential/ex"
    : "https://raw.githubusercontent.com/uid100/py/main/01-sequential/ex";
}

async function fetchFragment(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch fragment: ${url}`);
  return res.text();
}

function buildAccordionItem({ index, title, html, parentId }) {
  const key = `${index}`.padStart(2, "0"); // "00", "01", etc.
  const headingId = `heading-${key}`;
  const collapseId = `collapse-${key}`;
  const startOpen = index === 0; // open the first (prep) by default

  // Decide a header style (success for submit, secondary for exercises, primary for overview/prep)
  const headerClass =
    /submit/i.test(title) ? "bg-success text-white"
    : index === 0          ? "bg-primary text-white"
    : "bg-secondary text-white";

  const item = document.createElement("div");
  item.className = "accordion-item";
  item.innerHTML = `
    <h2 class="accordion-header" id="${headingId}">
      <button class="accordion-button${startOpen ? "" : " collapsed"}" type="button"
              data-bs-toggle="collapse" data-bs-target="#${collapseId}"
              aria-expanded="${startOpen ? "true" : "false"}" aria-controls="${collapseId}">
        ${title}
      </button>
    </h2>
    <div id="${collapseId}" class="accordion-collapse collapse${startOpen ? " show" : ""}"
         aria-labelledby="${headingId}" data-bs-parent="#${parentId}">
      <div class="accordion-body">
        <div class="card">
          <div class="card-header ${headerClass}">
            ${title}
          </div>
          <div class="card-body">
            ${html}
          </div>
        </div>
      </div>
    </div>
  `;
  return item;
}

async function renderLabAccordion({ taskListUrl, fragmentsBase }) {
  const container = document.getElementById("labAccordionContainer");
  if (!container) {
    console.error("#labAccordionContainer not found");
    return;
  }

  const tasks = await fetchJSON(taskListUrl);
  const accordionId = "labAccordion";

  // Create accordion
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = accordionId;

  // Fetch each fragment and append items
  for (let i = 0; i < tasks.length; i++) {
    const { title, file } = tasks[i];
    const fragmentUrl = `${fragmentsBase}/${file}`;
    const html = await fetchFragment(fragmentUrl);
    const item = buildAccordionItem({
      index: i,
      title,
      html,
      parentId: accordionId
    });
    accordion.appendChild(item);
  }

  container.innerHTML = "";
  container.appendChild(accordion);
}

(async function initLab() {
  const courseId = getQueryParam("course");
  if (!courseId) {
    console.error("Missing ?course= parameter");
    return;
  }

  // Load course config to keep header & timeline consistent
  const data = await loadCourseConfig(courseId);

  // Optional: set lab title from course repo if present
  // e.g., data.course.labs?.lab1?.title
  if (data?.course?.labs?.lab1?.title) {
    setText("lab-title", data.course.labs.lab1.title);
  }

  // Configure shared 'py' base and task list URL
  const PY_BASE = pyBaseUrl(true); // set to false to use raw.githubusercontent path
  const TASK_LIST_URL = `${PY_BASE}/task-list.json`;

  // Build the accordion
  await renderLabAccordion({
    taskListUrl: TASK_LIST_URL,
    fragmentsBase: PY_BASE
  });

  // Timeline is already rendered by renderer.js via renderTimeline(start, end)
})();
