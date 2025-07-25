const fs = require('fs');
const path = require('path');

/**
 * Check if a template file is valid
 * @param {string} filePath - Path to the template file
 * @param {string} fileName - Name of the file
 * @returns {Object} Validation result
 */
function validateTemplate(filePath, fileName) {
  const result = {
    fileName,
    isValid: true,
    errors: []
  };

  try {
    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      result.isValid = false;
      result.errors.push('File does not exist');
      return result;
    }

    // Read and parse JSON
    const content = fs.readFileSync(filePath, 'utf8');
    let template;
    
    try {
      template = JSON.parse(content);
    } catch (parseError) {
      result.isValid = false;
      result.errors.push(`Invalid JSON: ${parseError.message}`);
      return result;
    }

    // Check if template has an id field
    if (!template.id) {
      result.isValid = false;
      result.errors.push('Missing "id" field in template');
      return result;
    }

    // Check if filename matches id
    const expectedFileName = `${template.id}.json`;
    if (fileName !== expectedFileName) {
      result.isValid = false;
      result.errors.push(`Filename mismatch: expected "${expectedFileName}", got "${fileName}"`);
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Error reading file: ${error.message}`);
  }

  return result;
}

/**
 * Check all templates in the templates directory
 */
function checkTemplates() {
  const templatesDir = path.join(__dirname, 'templates');
  
  console.log('🔍 Checking template validity...');
  console.log(`📁 Templates directory: ${templatesDir}\n`);

  if (!fs.existsSync(templatesDir)) {
    console.error('❌ Templates directory does not exist!');
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(templatesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('⚠️  No JSON template files found in the templates directory.');
      return;
    }

    let validCount = 0;
    let invalidCount = 0;
    const invalidTemplates = [];

    console.log(`📊 Found ${jsonFiles.length} template files to check\n`);

    // Check each template file
    for (const fileName of jsonFiles) {
      const filePath = path.join(templatesDir, fileName);
      const validation = validateTemplate(filePath, fileName);
      
      if (validation.isValid) {
        validCount++;
        console.log(`✅ ${fileName}`);
      } else {
        invalidCount++;
        invalidTemplates.push(validation);
        console.log(`❌ ${fileName}`);
        validation.errors.forEach(error => {
          console.log(`   └─ ${error}`);
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Valid templates: ${validCount}`);
    console.log(`❌ Invalid templates: ${invalidCount}`);
    console.log(`📊 Total templates: ${jsonFiles.length}`);
    
    if (invalidCount > 0) {
      console.log('\n🚨 INVALID TEMPLATES DETAILS:');
      console.log('-'.repeat(30));
      
      invalidTemplates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.fileName}`);
        template.errors.forEach(error => {
          console.log(`   • ${error}`);
        });
        console.log('');
      });
      
      console.log('⚠️  Please fix the invalid templates before proceeding.');
      process.exit(1);
    } else {
      console.log('\n🎉 All templates are valid!');
    }

  } catch (error) {
    console.error('💥 Error checking templates:', error.message);
    process.exit(1);
  }
}

// Run template check if this file is executed directly
if (require.main === module) {
  checkTemplates();
}

module.exports = { checkTemplates, validateTemplate };