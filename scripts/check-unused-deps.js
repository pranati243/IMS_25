import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..");

// Load package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
);
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

// Get all JS/TS files in the project
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (
        file !== "node_modules" &&
        file !== ".next" &&
        !file.startsWith(".")
      ) {
        getAllFiles(filePath, fileList);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

const projectFiles = getAllFiles(rootDir);

// Check for each dependency if it's used
const unusedDependencies = [];
const usedDependencies = [];

Object.keys(dependencies).forEach((dependency) => {
  // Skip packages that might be used indirectly
  const skipList = [
    "typescript",
    "eslint",
    "next",
    "react",
    "react-dom",
    "@types/react",
    "@types/react-dom",
    "@types/node",
  ];

  if (skipList.includes(dependency)) {
    usedDependencies.push(dependency);
    return;
  }

  // Replace @ and / with escaped versions for regex
  const depRegex = dependency.replace(/[/@]/g, "\\$&");
  let found = false;

  for (const file of projectFiles) {
    const content = fs.readFileSync(file, "utf8");
    // Check for standard imports and requires
    if (
      new RegExp(`(import|require).*['"]${depRegex}(/.*)?['"]`).test(content)
    ) {
      found = true;
      break;
    }
    // Also check for CSS imports
    if (new RegExp(`@import.*['"]${depRegex}(/.*)?['"]`).test(content)) {
      found = true;
      break;
    }
  }

  if (!found) {
    unusedDependencies.push(dependency);
  } else {
    usedDependencies.push(dependency);
  }
});

console.log("=== Potentially Unused Dependencies ===");
unusedDependencies.forEach((dep) => {
  console.log(`${dep}: ${dependencies[dep]}`);
});

console.log("\n=== Used Dependencies ===");
usedDependencies.forEach((dep) => {
  console.log(`${dep}: ${dependencies[dep]}`);
});

console.log("\nNote: This is a basic check and may not catch all usages.");
console.log(
  "Some dependencies might be used indirectly or in ways not detected by this script."
);
console.log("Review carefully before removing any dependencies.");
