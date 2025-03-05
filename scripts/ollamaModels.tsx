#!/usr/bin/env node
// Save as ollamaModels.tsx
// npx ts-node ollamaModels.tsx

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Simple logging function with timestamps
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const execAsync = promisify(exec);

// Directory to save logos, relative to the script's location
const LOGO_DIR = path.join(__dirname, 'images', 'models');

// Ensure the logo directory exists
if (!fs.existsSync(LOGO_DIR)) {
  log('Creating logo directory...');
  fs.mkdirSync(LOGO_DIR, { recursive: true });
  log('Logo directory created.');
}

// Function to download a logo from a URL
async function downloadLogo(url, dest) {
  log(`Attempting to download logo from ${url} to ${dest}`);
  return new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        log(`Successfully downloaded logo to ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {
        log(`Error downloading logo: ${err.message}`);
        reject(err);
      });
    });
  });
}

// Function to fetch model details, including logo URL and parameter variations
async function fetchModelDetails(modelName) {
  const url = `https://ollama.com/library/${modelName}/tags`;
  log(`Fetching details for ${modelName} from ${url}`);
  try {
    const { stdout } = await execAsync(`curl -s ${url}`);
    // Extract logo URL (adjust regex based on actual HTML)
    const logoMatch = stdout.match(/<img\s+src="([^"]+)"\s+alt="[^"]*logo"/i);
    const logoUrl = logoMatch ? `https://ollama.com${logoMatch[1]}` : null;

    // Extract parameter variations (tags)
    const tagRegex = /<div class="break-all font-medium text-gray-900 group-hover:underline">\s*([^<]+)\s*<\/div>/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(stdout)) !== null) {
      tags.push(match[1].trim());
    }
    log(`Found ${tags.length} parameter variations for ${modelName}: ${tags.join(', ')}`);
    return { logoUrl, variations: tags };
  } catch (error) {
    log(`Error fetching details for ${modelName}: ${error.message}`);
    return { logoUrl: null, variations: ['default'] }; // Fallback
  }
}

// Function to count parameter variations in a model
function countVariations(model) {
  return Object.keys(model.options[0].requirements).length;
}

// Function to update models.json with new data
async function updateModelsJson(models) {
  const jsonPath = path.join(__dirname, 'models.json');
  log(`Checking for existing models.json at ${jsonPath}`);
  let existingModels = [];

  // Read existing models.json if it exists
  if (fs.existsSync(jsonPath)) {
    log('Reading existing models.json...');
    const data = fs.readFileSync(jsonPath, 'utf8');
    try {
      existingModels = JSON.parse(data);
      log(`Loaded ${existingModels.length} existing models from JSON`);
    } catch (error) {
      log(`Error parsing existing JSON: ${error.message}`);
      existingModels = [];
    }
  } else {
    log('No existing models.json found, starting fresh');
  }

  const existingVariations = existingModels.reduce((sum, model) => sum + countVariations(model), 0);
  log(`Existing JSON has ${existingModels.length} models with ${existingVariations} parameter variations`);

  const updatedModels = [...existingModels];
  const newModels = [];

  for (const model of models) {
    log(`Processing model: ${model}`);
    const details = await fetchModelDetails(model);
    const logoPath = details.logoUrl ? `/images/models/${model}.png` : '/images/models/default.png';

    // Download the logo if it exists
    if (details.logoUrl) {
      const dest = path.join(LOGO_DIR, `${model}.png`);
      try {
        await downloadLogo(details.logoUrl, dest);
      } catch (error) {
        log(`Failed to download logo for ${model}, using default`);
      }
    }

    // Check if the model already exists in the JSON
    const index = updatedModels.findIndex((m) => m.name === model);
    const requirements = {};
    details.variations.forEach((variation) => {
      // Simple heuristic for requirements based on variation name
      const sizeNum = parseFloat(variation) || 0;
      requirements[variation] = {
        ram: sizeNum <= 7 ? 16000 : sizeNum <= 32 ? 24000 : 48000,
        storage: sizeNum <= 7 ? 10000 : sizeNum <= 32 ? 40000 : 100000,
        cpu: sizeNum <= 7 ? 2 : sizeNum <= 32 ? 4 : 8,
        ollamaCommand: `${model}:${variation}`
      };
    });

    if (index !== -1) {
      // Update existing entry
      log(`Updating existing model ${model}`);
      updatedModels[index].logo = logoPath;
      updatedModels[index].last_updated = "Just now";
      updatedModels[index].options[0].requirements = requirements;
    } else {
      // Add new model entry
      log(`Adding new model ${model}`);
      const newEntry = {
        id: String(updatedModels.length),
        logo: logoPath,
        name: model,
        category: "AI",
        tags: ["General"],
        dateAdded: new Date().toISOString(),
        desc: `Description for ${model}`,
        longDesc: `Long description for ${model}`,
        nixName: model.replace(/\./g, '-'),
        implemented: false,
        isUnitRunnable: true,
        last_updated: "Just now",
        options: [
          {
            name: "model_size",
            desc: `Size of the ${model} model to deploy.`,
            nixName: "model.size",
            type: "string",
            requirements
          }
        ]
      };
      updatedModels.push(newEntry);
      newModels.push(newEntry);
    }
  }

  // Calculate totals
  const totalModels = updatedModels.length;
  const totalVariations = updatedModels.reduce((sum, model) => sum + countVariations(model), 0);
  const newVariations = newModels.reduce((sum, model) => sum + countVariations(model), 0);

  log(`Summary: ${existingModels.length} models in JSON currently with ${existingVariations} parameter variations, ` +
      `${newModels.length} new models available with ${newVariations} variations. ` +
      `In total, there are ${totalModels} models with ${totalVariations} total parameter variations`);

  // Write the updated data back to models.json
  log(`Writing updated models to ${jsonPath}`);
  fs.writeFileSync(jsonPath, JSON.stringify(updatedModels, null, 2), 'utf8');
  log('Update complete');
}

// Main function to fetch models and update everything
async function checkOllamaModels() {
  log('Starting model fetch process');
  try {
    // Fetch HTML content from the Ollama library page
    log('Fetching library page content');
    const { stdout, stderr } = await execAsync('curl -s https://ollama.com/library');

    if (stderr) {
      log(`Error fetching library page: ${stderr}`);
      return;
    }

    console.log('\nAvailable Models on ollama.com:\n');

    // Regular expression to match <a href="/library/model-name"
    const regex = /<a\s+href="\/library\/([^"]+)"/g;
    const matches = stdout.matchAll(regex);
    const modelSet = new Set();

    // Collect unique model names
    log('Parsing model names from HTML');
    for (const match of matches) {
      const modelName = match[1];
      if (modelName) {
        modelSet.add(modelName);
      }
    }

    // Display results and update JSON
    if (modelSet.size === 0) {
      log('No models found. The HTML structure may have changed.');
      console.log('No models found. The HTML structure may have changed.');
    } else {
      modelSet.forEach((model) => console.log(`- ${model}`));
      log(`Found ${modelSet.size} models, starting JSON update`);
      await updateModelsJson(Array.from(modelSet));
      log('Model fetch and update process completed successfully');
    }
  } catch (error) {
    log(`Failed to fetch models: ${error.message}`);
  }
}

// Run the script
checkOllamaModels();