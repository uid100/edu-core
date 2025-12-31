
// js/lab.js
import { getQueryParam } from "./utils.js";
import { fetchJSON, loadCourseConfig } from "./fetcher.js";
import { setText } from "./dom.js";

/**
 * Resolve lab spec from course.json using query params.
 * - Primary: course.content.modules[moduleId].exercises[labKey] or .exercises.lab
 * - Optional fallback: course.content.labs[labId] (if a course prefers a flat structure)
 */
function resolveLabSpec(course, courseBase, { moduleId, labId }) {
  console.log("resolveLabSpec:", { moduleId, labId });
  const byModule = course?.content?.modules?.[moduleId];
  console.log("byModule:", byModule);
  if (byModule?.exercises) {
    const labKey = labId || "lab";
    const labSpec = byModule.exercises[labKey];
    if (labSpec) {
      return composeContentSpec(labSpec, courseBase, {
        fallbackTitle: labSpec.title || byModule.title || course.courseTitle || "Lab"
      });
    }
  }

  // Optional: support a flat labs structure if some courses choose it
  const byLab = course?.content?.labs?.[labId];
  if (byLab) {
    return composeContentSpec(byLab, courseBase, {
      fallbackTitle: byLab.title || course.courseTitle || "Lab"
    });
  }

  return null;
}

/**
 * Compose normalized content spec with either absolute URLs or repo-relative paths, or a 'source' object.
 */
function composeContentSpec(spec, courseBase, { fallbackTitle }) {
  // Variant: absolute URLs
  if (spec.taskListUrl && spec.fragmentsBase) {
    return {
      title: spec.title || fallbackTitle,
      taskListUrl: spec.taskListUrl,
      fragmentsBase: spec.fragmentsBase
    };
  }
  // Variant: course-repo-relative paths
  if (spec.taskListPath && spec.fragmentsPath) {
    return {
      title: spec.title || fallbackTitle,
      taskListUrl: courseBase + spec.taskListPath,
      fragmentsBase: courseBase + spec.fragmentsPath
    };
  }
  // Variant: source object (flexible hosting)
  if (spec.source) {
    const { type, baseUrl, repo, taskList, fragments } = spec.source;
    let base = "";
    switch (type) {
      case "github_pages": // e.g., https://uid100.github.io/ + repo
        base = `${(baseUrl || "").replace(/\/$/, "")}/${repo}`;
        break;
      case "raw": // e.g., https://raw.githubusercontent.com/uid100/ + repo (incl. /main)
        base = `${(baseUrl || "").replace(/\/$/, "")}/${repo}`;
        break;
      case "url":
      default:
        base = (baseUrl || "").replace(/\/$/, "");
        break;
    }
    return {
      title: spec.title || fallbackTitle,
      taskListUrl: `${base}/${String(taskList).replace(/^\//, "")}`,
      fragmentsBase: `${base}/${String(fragments).replace(/^\//, "")}/`
    };
  }
  return null;
}

async function fetchFragment(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return `<div class="alert alert-warning" role="alert">Could not load content from <code>${url}</code>.</div>`;
  }
  return res.text();
}

function buildAccordionItem({ index, title, html, parentId }) {
  const key = `${index}`.padStart(2, "0");
  const headingId = `heading-${key}`;
  const collapseId = `collapse-${key}`;
  const startOpen = index === 0;

  // const headerClass =
  //   /submit/i.test(title) ? "bg-success text-white" :
  //   index === 0          ? "bg-primary text-white" :
  //                          "bg-secondary text-white";

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
          <div class="card-header ${headerClass}">${title}</div>
          <div class="card-body">${html}</div>
        </div>
      </div>
    </div>`;
  return item;
}

async function renderLabAccordion({ taskListUrl, fragmentsBase }) {
  const container = document.getElementById("labAccordionContainer");
  if (!container) {
    console.error("#labAccordionContainer not found");
    return;
  }

  let tasks;
  try {
    tasks = await fetchJSON(taskListUrl);
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load task list: <code>${taskListUrl}</code>
      </div>`;
    console.error(err);
    return;
  }

  const accordionId = "labAccordionContainer";
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = accordionId;

  const base = fragmentsBase.replace(/\/+$/, ""); // trim trailing slash

  for (let i = 0; i < tasks.length; i++) {
    const { title, file } = tasks[i];
    const fragmentUrl = `${base}/${file}`;
    const html = await fetchFragment(fragmentUrl);
    const item = buildAccordionItem({ index: i, title, html, parentId: accordionId });
    accordion.appendChild(item);
  }

  container.innerHTML = "";
  container.appendChild(accordion);
}

(async function initLab() {
  const courseId = getQueryParam("course");
  const moduleId = getQueryParam("module"); // REQUIRED for your current schema
  const labId    = getQueryParam("lab");    // OPTIONAL: chooses a specific key in exercises (e.g., "lab2")

  if (!courseId) {
    console.error("Missing ?course= parameter");
    return;
  }
  if (!moduleId) {
    document.getElementById("labAccordionContainer").innerHTML = `
      <div class="alert alert-warning" role="alert">
        Missing <code>?module=</code> parameter. Example:
        <code>templates/lab.html?course=palomar-csit175&module=01-sequential</code>
      </div>`;
    return;
  }

  // Load course config; header/timeline are populated by renderer.js
  const data = await loadCourseConfig(courseId);
  const courseBase = data.courseBase; // raw.githubusercontent.com/.../main/
  const course     = data.course;

  const spec = resolveLabSpec(course, courseBase, { moduleId, labId });
  if (!spec) {
    document.getElementById("labAccordionContainer").innerHTML = `
      <div class="alert alert-warning" role="alert">
        Lab content not found in <code>${courseId}/course.json</code> under
        <code>content.modules["${moduleId}"].exercises.${labId || "lab"}</code>.
      </div>`;
    return;
  }

  if (spec.title) setText("lab-title", spec.title);

  await renderLabAccordion({
    taskListUrl: spec.taskListUrl,
    fragmentsBase: spec.fragmentsBase
  });
})();
