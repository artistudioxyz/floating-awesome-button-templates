const fs = require("fs");
const path = require("path");

/**
 * Generate index.json from all template files in the templates directory
 */
function generateIndex() {
  const templatesDir = path.join(__dirname, "templates");
  const outputFile = path.join(__dirname, "index.json");

  try {
    // Read all files in templates directory
    const files = fs.readdirSync(templatesDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    const index = [];

    // Process each JSON template file
    for (const file of jsonFiles) {
      const filePath = path.join(templatesDir, file);

      try {
        const content = fs.readFileSync(filePath, "utf8");
        const template = JSON.parse(content);

        // Extract required fields
        const indexEntry = {
          id: template.id,
          name: template.name,
          docs: template.docs || null,
          description: template.description,
          license: template.license,
          color: template.design?.color,
          iconClass: template.design?.icon?.class,
        };

        index.push(indexEntry);
        console.log(`✓ Processed: ${file}`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    }

    // Sort by id for consistent output
    index.sort((a, b) => a.id.localeCompare(b.id));

    // Write index.json file
    fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));

    // Minify index.json file
    const minifiedContent = JSON.stringify(index);
    fs.writeFileSync(outputFile, minifiedContent);

    console.log(
      `\n🎉 Successfully generated index.json with ${index.length} templates`
    );
    console.log(`📁 Output file: ${outputFile}`);
  } catch (error) {
    console.error("❌ Error generating index:", error.message);
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  generateIndex();
}

module.exports = { generateIndex };
