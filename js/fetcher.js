export async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return response.json();
}

export async function loadCourseConfig(courseId) {
    const base = `https://raw.githubusercontent.com/yourname/${courseId}/main/`;

    const course = await fetchJSON(base + "course.json");

    // Load shared metadata from edu-core
    const college = await fetchJSON(
        `https://raw.githubusercontent.com/yourname/edu-core/main/colleges/${course.college}.json`
    );

    const instructor = await fetchJSON(
        `https://raw.githubusercontent.com/yourname/edu-core/main/instructors/${course.instructor}.json`
    );

    // Load outcomes/objectives
    const outcomes = await fetchJSON(base + course.outcomes);
    const objectives = await fetchJSON(base + course.objectives);

    // Load section
    const section = await fetchJSON(base + `sections/${course.defaultSection}.json`);

    // Load textbook
    const textbook = await fetchJSON(base + course.textbook);

    return {
        base,
        course,
        college,
        instructor,
        outcomes,
        objectives,
        section,
        textbook
    };
}
