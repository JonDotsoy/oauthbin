const payload = await Bun.file(new URL("dockerinfo.json", import.meta.url)).json()

// has description
if (!payload.description) {
    throw new Error("Missing description")
}
// Max limit description 100 characters
if (payload.description.length > 100) {
    throw new Error("Description is too long")
}
// categories are a list of strings
if (!Array.isArray(payload.categories)) {
    throw new Error("Categories must be a list of strings")
}
// Maximo 3 categories
if (payload.categories.length > 3) {
    throw new Error("Too many categories")
}
// categories only can be "Web analytics", "Networking", "Security", "Languages & frameworks", "Integration & delivery", "Message queues", "API management", "Internet of things", "Machine learning & AI", "Developer tools", "Data science", "Web servers", "Operating systems", "Content management system", "Databases & storage", "Monitoring & observability"
const categoriesEable = ["Web analytics", "Networking", "Security", "Languages & frameworks", "Integration & delivery", "Message queues", "API management", "Internet of things", "Machine learning & AI", "Developer tools", "Data science", "Web servers", "Operating systems", "Content management system", "Databases & storage", "Monitoring & observability"];
if (!payload.categories.every((category: string) => categoriesEable.includes(category))) {
    throw new Error("Invalid category")
}
