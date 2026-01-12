// js/lab.js
import { getQueryParam } from "./utils.js";
import { fetchJSON, loadCourseConfig } from "./fetcher.js";
import { setText } from "./dom.js";

/**
 * Resolve lab spec from course.json using query params.
 * - Primary: course.content.modules[moduleId].exercises[labKey] (labKey defaults to "lab")
 * - Optional fallback: course.content.labs[labId] if you ever use a flat structure.
 */
function resolveLabSpec(course, courseBase, { moduleId, labId }) {
  const moduleSpec = course?.content?.modules?.[moduleId];
  if (moduleSpec) {
    const labSpec = moduleSpec[labId || "lab"];
    if (labSpec) {
      return composeContentSpec(labSpec, courseBase, {
        fallbackTitle: labSpec.title || moduleSpec.title || course.courseTitle || "Lab"
      });
    }
  }

  // // Optional flat labs fallback
  // const flatLab = course?.content?.labs?.[labId];
  // if (flatLab) {
  //   return composeContentSpec(flatLab, courseBase, {
  //     fallbackTitle: flatLab.title || course.courseTitle || "Lab"
  //   });
  // }

  return null;
}

/**
 * Normalize a lab spec into { title, taskListUrl, fragmentsBase }.
 * Supports:
 *  - Absolute URLs: taskListUrl + fragmentsBase
 *  - Course-relative paths: taskListPath + fragmentsPath
 *  - Flexible source object: { source: { type, baseUrl, repo, taskList, fragments } }
 */
function composeContentSpec(spec, courseBase, { fallbackTitle }) {
  // Variant A: absolute URLs
  if (spec.taskListUrl && spec.fragmentsBase) {
    return {
      title: spec.title || fallbackTitle,
      taskListUrl: spec.taskListUrl,
      fragmentsBase: spec.fragmentsBase
    };
  }

  // Variant B: course-repo-relative paths
  if (spec.taskListPath && spec.fragmentsPath) {
    return {
      title: spec.title || fallbackTitle,
      taskListUrl: courseBase + spec.taskListPath,
      fragmentsBase: courseBase + spec.fragmentsPath
    };
  }

  // Variant C: source object (github_pages/raw/url)
  if (spec.source) {
    const { type, baseUrl, repo, taskList, fragments } = spec.source;
    let base = "";
    switch (type) {
      case "github_pages": // e.g., baseUrl: "https://uid100.github.io/", repo: "py"
        base = `${(baseUrl || "").replace(/\/$/, "")}/${repo}`;
        break;
      case "raw":          // e.g., baseUrl: "https://raw.githubusercontent.com/uid100/", repo: "py/main"
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
    return `<div class="alert alert-warning" role="alert">
      Could not load content from <code>${url}</code>.
    </div>`;
  }
  return res.text();
}

/** Map header styles to Bootstrap utility classes (used on accordion-button). */
function computeHeaderClass(index, title, headerStyle) {
  const map = {
    primary:   "bg-primary text-white",
    secondary: "bg-secondary text-white",
    success:   "bg-success text-white",
    warning:   "bg-warning",
    info:      "bg-info text-dark",
    dark:      "bg-dark text-white",
    light:     "bg-light text-dark"
  };
  if (headerStyle && map[headerStyle]) return map[headerStyle];
  if (/submit/i.test(title)) return map.success;
  if (index === 0) return map.primary;
  return map.secondary;
}

/**
 * Build an accordion item.
 * NOTE: We style the accordion-button directly to avoid duplicated headers.
 * If you prefer to keep a card header inside the body, see the comment below.
 */
function buildAccordionItem({ index, title, html, parentId, headerStyle }) {
  const key = `${index}`.padStart(2, "0");
  const headingId = `heading-${key}`;
  const collapseId = `collapse-${key}`;
  const startOpen = index === 0;
  const btnClass = computeHeaderClass(index, title, headerStyle);

  const item = document.createElement("div");
  item.className = "accordion-item";

  item.innerHTML = `
    <h2 class="accordion-header" id="${headingId}">
      <button class="accordion-button ${startOpen ? "" : "collapsed"} ${btnClass}" type="button"
              data-bs-toggle="collapse" data-bs-target="#${collapseId}"
              aria-expanded="${startOpen ? "true" : "false"}" aria-controls="${collapseId}">
        ${title}
      </button>
    </h2>
    <div id="${collapseId}" class="accordion-collapse collapse ${startOpen ? "show" : ""}"
         aria-labelledby="${headingId}" data-bs-parent="#${parentId}">
      <div class="accordion-body p-0">
        <div class="card border-0">
          <div class="card-body">
            ${html}
          </div> <!-- .card-body -->
        </div> <!-- .card -->
        <!-- back to top -->
        <div class="text-center my-3">
          <a href="#top" class="btn btn-sm btn-outline-secondary">Back to Top</a>
        </div>
      </div> <!-- .accordion-body -->
    </div>
  `;

  return item;
}

/**
 * If you want to KEEP card headers inside the body instead of styling the accordion button:
 *  - Replace the innerHTML above with the following for the body section only:
 *
 * <div class="accordion-body">
 *   <div class="card">
 *     <div class="card-header ${computeHeaderClass(index, title, headerStyle)}">${title}</div>
 *     <div class="card-body">${html}</div>
 *   </div>
 * </div>
 *
 * And remove ${btnClass} from the accordion-button.
 */

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

  // Create the accordion parent if not present
  const accordionId = container.id || "labAccordionContainer";
  const base = (fragmentsBase || "").replace(/\/+$/, ""); // trim trailing slash

  // Empty container (in case placeholder exists) and rebuild
  container.innerHTML = "";
  const accordion = document.createElement("div");
  accordion.className = "accordion mb-4";
  accordion.id = accordionId;
  container.appendChild(accordion);

  // Build each item
  for (let i = 0; i < tasks.length; i++) {
    const { title, file, headerStyle } = tasks[i]; // headerStyle optional
    const fragmentUrl = `${base}/${file}`;
    const html = await fetchFragment(fragmentUrl);
    const item = buildAccordionItem({
      index: i,
      title,
      html,
      parentId: accordionId,
      headerStyle
    });
    accordion.appendChild(item);
  }
}

(async function initLab() {
  const courseId = getQueryParam("course");
  const moduleId = getQueryParam("module"); // required by your schema
  const labId    = getQueryParam("lab");    // optional: choose exercises[labId]; defaults to "lab"

  if (!courseId) {
    console.error("Missing ?course= parameter");
    return;
  }
  if (!moduleId) {
    const mount = document.getElementById("labAccordionContainer");
    if (mount) {
      mount.innerHTML = `
        <div class="alert alert-warning" role="alert">
          Missing <code>?module=</code> parameter. Example:<br/>
          <code>templates/lab.html?course=palomar-csit175&module=01-sequential</code>
        </div>`;
    }
    return;
  }

  // Load course config; header/timeline are populated by renderer.js
  const data = await loadCourseConfig(courseId);
  const courseBase = data.courseBase; // raw.githubusercontent.com/uid100/<courseId>/main/
  const course     = data.course;

  // Resolve lab spec from course.json
  const spec = resolveLabSpec(course, courseBase, { moduleId, labId });
  if (!spec) {
    const mount = document.getElementById("labAccordionContainer");
    if (mount) {
      mount.innerHTML = `
        <div class="alert alert-warning" role="alert">
          Lab content not found in <code>${courseId}/course.json</code> under
          <code>content.modules["${moduleId}"].${labId || "lab"}</code>.
        </div>`
    }
    return;
  }

  // Set page title from spec (if provided)
  if (spec.title) setText("lab-title", spec.title);

  // Render accordion from task list and fragments
  await renderLabAccordion({
    taskListUrl: spec.taskListUrl,
    fragmentsBase: spec.fragmentsBase
  });
})();
