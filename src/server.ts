#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  IndividualComponentSchema,
  fetchComponentDetails,
  fetchBlockDetails,
  fetchExampleComponents,
  fetchExampleDetails,
  fetchUIBlocks,
  fetchUIComponents,
  IndividualBlockSchema,
} from "./utils/index.js";
import { formatComponentName } from "./utils/formatters.js";
import { blocksCategories, componentCategories } from "./lib/categories.js";

// Initialize the MCP Server
const server = new McpServer({
  name: "commerce-ui MCP",
  version: "0.0.1",
});

// Register the main tool for getting all components
server.tool(
  "getUIComponents",
  "Provides a comprehensive list of all commerce-ui components.",
  {},
  async () => {
    try {
      const uiComponents = await fetchUIComponents();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(uiComponents, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to fetch commerce-UI components",
          },
        ],
        isError: true,
      };
    }
  }
);

// Register the main tool for getting all blocks
server.tool(
  "getUIBlocks",
  "Provides a comprehensive list of all commerce-ui blocks.",
  {},
  async () => {
    try {
      const uiBlocks = await fetchUIBlocks();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(uiBlocks, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to fetch commerce-UI blocks",
          },
        ],
      };
    }
  }
);

/**
 * Creates a registry mapping component names to their example implementations.
 * @param exampleComponentList - The list of example components to process.
 * @returns A map where each key is a component name and the value is an array of example names.
 */
function createComponentExampleRegistry(
  exampleComponentList: Array<{
    name: string;
    registryDependencies?: string[];
  }>
): Map<string, string[]> {
  const componentRegistry = new Map<string, string[]>();

  for (const exampleItem of exampleComponentList) {
    if (
      exampleItem.registryDependencies &&
      Array.isArray(exampleItem.registryDependencies)
    ) {
      for (const dependencyUrl of exampleItem.registryDependencies) {
        if (
          typeof dependencyUrl === "string" &&
          dependencyUrl.includes("stackzero.co")
        ) {
          const nameExtraction = dependencyUrl.match(/\/r\/([^\/]+)$/);
          if (nameExtraction && nameExtraction[1]) {
            const extractedComponentName = nameExtraction[1];
            if (!componentRegistry.has(extractedComponentName)) {
              componentRegistry.set(extractedComponentName, []);
            }
            if (
              !componentRegistry
                .get(extractedComponentName)
                ?.includes(exampleItem.name)
            ) {
              componentRegistry
                .get(extractedComponentName)
                ?.push(exampleItem.name);
            }
          }
        }
      }
    }
  }
  return componentRegistry;
}

/**
 * Fetches components and blocks by category, processing each category's components and blocks.
 * @param categoryComponents - The list of component names in the category.
 * @param categoryBlocks - The list of block names in the category.
 * @returns An object containing the processed components and blocks.
 */
async function fetchComponentsByCategory(
  categoryComponents: string[],
  allComponents: any[],
  exampleNamesByComponent: Map<string, string[]>
) {
  const componentResults = [];

  for (const componentName of categoryComponents) {
    const component = allComponents.find((c) => c.name === componentName);
    if (!component) continue;

    try {
      const componentDetails = await fetchComponentDetails(componentName);
      const componentContent = componentDetails.files[0]?.content;

      const relevantExampleNames =
        exampleNamesByComponent.get(componentName) || [];

      // Generate installation instructions
      const installInstructions = `You can install the component/blocks using  \
      shadcn/ui CLI. For example, with npx: npx shadcn@latest add \
      "https://ui.stackzero.co/r/${componentName}.json" (Rules: make sure the URL is wrapped in \
      double quotes. Once installed, \
      you can import the component like this: import { ${formatComponentName(
        component.name
      )} } from \
      "@/components/ui/${componentName}";`;

      const disclaimerText = `The code below is for context only. It helps you understand
      the component's props, types, and behavior. After installing, the component
      will be available for import via: import { ${formatComponentName(
        component.name
      )} } \
      from "@/components/ui/${componentName}";`;

      const exampleDetailsList = await Promise.all(
        relevantExampleNames.map((name) => fetchExampleDetails(name))
      );

      const formattedExamples = exampleDetailsList
        .filter((details) => details !== null)
        .map((details) => ({
          name: details.name,
          type: details.type,
          description: details.description,
          content: details.files[0]?.content,
        }));

      const validatedComponent = IndividualComponentSchema.parse({
        name: component.name,
        type: component.type,
        description: component.description,
        install: installInstructions,
        content: componentContent && disclaimerText + componentContent,
        examples: formattedExamples,
      });

      componentResults.push(validatedComponent);
    } catch (error) {
      console.error(`Error processing component ${componentName}:`, error);
    }
  }

  return componentResults;
}

/**
 * Fetches blocks by category, processing each block in the category.
 * @param categoryBlocks - The list of block names in the category.
 * @param allBlocks - The complete list of blocks to search from.
 * @returns An array of processed blocks.
 */
async function fetchBlocksByCategory(
  categoryBlocks: string[],
  allBlocks: any[]
) {
  const blockResults = [];

  for (const blockName of categoryBlocks) {
    const block = allBlocks.find((b) => b.name === blockName);
    if (!block) continue;

    try {
      const blockDetails = await fetchBlockDetails(blockName);
      const blockContent = blockDetails.files[0]?.content;

      // Generate installation instructions
      const installInstructions = `You can install the blocks using  \
      shadcn/ui CLI. For example, with npx: npx shadcn@latest add \
      "https://ui.stackzero.co/r/${blockName}.json" (Rules: make sure the URL is wrapped in \
      double quotes. Once installed, \
      you can import the block like this: import { ${formatComponentName(
        block.name
      )} } from \
      "@/components/ui/${blockName}";`;

      const disclaimerText = `The code below is for context only. It helps you understand
      the block's props, types, and behavior. After installing, the block
      will be available for import via: import { ${formatComponentName(
        block.name
      )} } \
      from "@/components/ui/${blockName}";`;

      const validatedBlock = IndividualBlockSchema.parse({
        name: block.name,
        type: block.type,
        description: block.description,
        install: installInstructions,
        content: blockContent && disclaimerText + blockContent,
        examples: [], // Blocks typically don't have examples, but can be added if needed
      });

      blockResults.push(validatedBlock);
    } catch (error) {
      console.error(`Error processing block ${blockName}:`, error);
    }
  }

  return blockResults;
}

// Registers tools for each component category
async function registerComponentsCategoryTools() {
  const [components, allExampleComponents] = await Promise.all([
    fetchUIComponents(),
    fetchExampleComponents(),
  ]);

  const exampleNamesByComponent =
    createComponentExampleRegistry(allExampleComponents);

  // console.error(
  //   "🔍 Found example names by component:",
  //   exampleNamesByComponent
  // );

  for (const [category, categoryComponents] of Object.entries(
    componentCategories
  )) {
    const componentNamesString = categoryComponents.join(", ");

    server.tool(
      `get${category}`,
      `Provides implementation details for ${componentNamesString} components.`,
      {},
      async () => {
        try {
          const categoryResults = await fetchComponentsByCategory(
            categoryComponents,
            components,
            exampleNamesByComponent
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(categoryResults, null, 2),
              },
            ],
          };
        } catch (error) {
          let errorMessage = `Error processing ${category} components`;
          if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
          }
          return {
            content: [{ type: "text", text: errorMessage }],
            isError: true,
          };
        }
      }
    );
  }
}

async function registerBlocksCategoryTools() {
  const [blocks] = await Promise.all([fetchUIBlocks()]);

  // console.error(
  //   "🔍 Found example names by component:",
  //   exampleNamesByComponent
  // );

  for (const [category, categoryBlocks] of Object.entries(blocksCategories)) {
    const blockNamesString = categoryBlocks.join(", ");

    server.tool(
      `get${category}`,
      `Provides implementation details for ${blockNamesString} blocks.`,
      {},
      async () => {
        try {
          const categoryResults = await fetchBlocksByCategory(
            categoryBlocks,
            blocks
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(categoryResults, null, 2),
              },
            ],
          };
        } catch (error) {
          let errorMessage = `Error processing ${category} blocks`;
          if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
          }
          return {
            content: [{ type: "text", text: errorMessage }],
            isError: true,
          };
        }
      }
    );
  }
}

// Start the MCP server
async function startServer() {
  try {
    // Initialize category tools first
    await registerComponentsCategoryTools();
    await registerBlocksCategoryTools();
    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error("❌ Error starting MCP server:", error);

    // Try to start server anyway with basic functionality
    try {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error("⚠️ MCP server started with limited functionality");
    } catch (connectionError) {
      console.error("❌ Failed to connect to transport:", connectionError);
      process.exit(1);
    }
  }
}

// Start the server
startServer();
