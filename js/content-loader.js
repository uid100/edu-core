
// js/content-loader.js
import { fetchJSON } from "./fetcher.js";

/** Resolve a content page spec from course.json using moduleId + pageId. */
export function resolvePageSpec(course, courseBase, { moduleId, pageId }) {
  const moduleSpec = course?.content?.modules?.[moduleId];
  const pageSpec   = moduleSpec?.pages?.[pageId];
  if (!pageSpec) return null;

  // Normalize into { title, url }:
  // - Absolute URL via "resource"
  // - Course-repo-relative via "source"
  if (pageSpec.resource) {
    return { title: pageSpec.title || "Topic", url: pageSpec.resource };
  }
  if (pageSpec.source) {
    return { title: pageSpec.title || "Topic", url: courseBase + pageSpec.source };
  }
  return null;
}

/** Fetch HTML fragment; return alert markup on failure. */
export async function fetchHtmlOrAlert(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return `<div class="alert alert-warning" role="alert">
      Could not load content from <code>${url}</code>.
    </div>`;
  }
  return res.text();
}

/** Build a single Bootstrap card with anchors and back-to-top. */
export function buildTopicCard({ title, html, headerStyle = "primary" }) {
  const headerClass = headerStyleClass(headerStyle);

  const wrapper = document.createElement("div");
  wrapper.className = "card mb-4";

  wrapper.innerHTML = `
    <div>
      <!-- Top-of-section anchor -->
      <a id="section-00" tabindex="-1" aria-hidden="true"></a>
      ${html}
      <div class="text-center my-3">
        #top
          Back to top ↑
        </a>
      </div>
    </div>
  `;
  return wrapper;
}

/** Map logical header styles to Bootstrap classes. */
export function headerStyleClass(style) {
  const map = {
    primary:   "bg-primary text-white",
    secondary: "bg-secondary text-white",
    success:   "bg-success text-white",
    warning:   "bg-warning",
    info:      "bg-info text-dark",
    dark:      "bg-dark text-white",
    light:     "bg-light text-dark"
  };
  return map[style] || map.primary;
}

/** Render a list of tasks as an accordion (used by lab.js). */
export async function renderAccordionFromTaskList({ mountEl, taskListUrl, fragmentsBase }) {
  let tasks;
  try {
    tasks = await fetchJSON(taskListUrl);
  } catch (err) {
    mountEl.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load task list: <code>${taskListUrl}</code>
      </div>`;
    console.error(err);
    return;
  }

  const accordionId = mountEl.id || "accordion";
  const base = (fragmentsBase || "").replace(/\/+$/, "");

  mountEl.innerHTML = "";
  const accordion = document.createElement("div");
  accordion.className = "accordion mb-4";
  accordion.id = accordionId;
  mountEl.appendChild(accordion);

  for (let i = 0; i < tasks.length; i++) {
    const { title, file, headerStyle } = tasks[i];
    const fragmentUrl = `${base}/${file}`;
    const html = await fetchHtmlOrAlert(fragmentUrl);

    const key = `${i}`.padStart(2, "0");
    const headingId = `heading-${key}`;
    const collapseId = `collapse-${key}`;
    const startOpen  = i === 0;
    const btnClass   = headerStyleClass(headerStyle || (i === 0 ? "primary" : /submit/i.test(title) ? "success" : "secondary"));

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
    `;
    accordion.appendChild(item);
  }
}
