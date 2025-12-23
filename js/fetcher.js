function resolveCourseAsset(courseId, relativePath) {
    return `https://raw.githubusercontent.com/uid100/${courseId}/main${relativePath}`;
}

export async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return response.json();
}

export async function loadCourseConfig(courseId) {
    const courseBase = `https://raw.githubusercontent.com/uid100/${courseId}/main/`;
    const eduCoreBase = 'https://uid100.github.io/edu-core/';

    const course = await fetchJSON(`${courseBase}course.json`);

    // Load shared metadata from edu-core
    const college = await fetchJSON(
        `${eduCoreBase}colleges/${course.college}.json`
    );

    const instructor = await fetchJSON(
        `${eduCoreBase}instructor/${course.instructor}.json`
    );

    // Load outcomes/objectives
    const outcomes = await fetchJSON(courseBase + course.outcomes);
    const objectives = await fetchJSON(courseBase + course.objectives);

    // Load section
    const section = await fetchJSON(courseBase + `sections/${course.defaultSection}.json`);

    // Load textbook
    const textbook = await fetchJSON(courseBase + course.textbook);

    return {
        courseBase,
        course,
        college,
        instructor,
        outcomes,
        objectives,
        section,
        textbook
    };
}
