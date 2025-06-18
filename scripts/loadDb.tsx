import { DataAPIClient } from "@datastax/astra-db-ts";
import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import "dotenv/config";

type SimilarityMetric = "cosine" | "dot_product" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GOOGLE_API_KEY,
} = process.env;

// Initialize Gemini embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // Latest Gemini embedding model with 768 dimensions
  apiKey: GOOGLE_API_KEY,
});

const f1Data = [
  "https://www.formula1.com/en/latest/article/the-beginners-guide-to-the-f1-drivers-championship.53MjXJzTDxQnfxfoCLnxNZ",
  "https://www.formula1.com/en/latest/article/drivers-teams-cars-circuits-and-more-everything-you-need-to-know-about.7iQfL3Rivf1comzdqV5jwc",
  "https://www.formula1.com/en/latest/article/the-beginners-guide-to-the-formula-1-grand-prix-calendar.VEmteiTb3F3tE95A7qke7",

  "https://www.formula1.com/en/results/2025/races",
  "https://www.formula1.com/en/results/2025/drivers",
  "https://www.formula1.com/en/results/2025/team",

  "https://motorsporttickets.com/blog/f1-driver-salaries-how-much-formula-1-drivers-earn/",
  "https://www.forbes.com/sites/brettknight/2024/12/10/formula-1s-highest-paid-drivers-2024/",

  "https://www.formula1.com/en/latest/article/whod-have-thought-wed-have-an-f1-movie-with-brad-pitt-behind-the-scenes-of.66fCStVKBC5NsLTckqx5Dl",
  "https://www.forbes.com/sites/timlammers/2025/06/17/f1-the-movie-reviews-does-brad-pitt-power-formula-1-racing-thriller/",
  "https://www.forbes.com/sites/dancancian/2025/05/24/2025-monaco-grand-prix-everything-f1-fans-need-to-know/",

  "https://en.wikipedia.org/wiki/2025_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/History_of_Formula_One",

  // "https://www.formula1.com/en/results.html",
  // "https://www.formula1.com/en/latest.html",
  // "https://www.autosport.com/f1/news/",
  // "https://www.motorsport.com/f1/news/",
  // "https://www.espn.com/f1/",

  // "https://en.wikipedia.org/wiki/History_of_Formula_One_regulations",
  // "https://en.wikipedia.org/wiki/H%C3%A4kkinen%E2%80%93Schumacher_rivalry",
  // "https://www.autosport.com/f1/news/history-of-safety-devices-in-formula-1-the-halo-barriers-more-4982360/4982360/",
  // "https://www.autosport.com/f1/news/the-10-biggest-innovations-in-formula-1-history-active-suspension-halo-fan-car-more/10125979/",
  // "https://www.autosport.com/f1/news/the-10-best-formula-1-drivers-ever-hamilton-schumacher-senna-more-4983210/4983210/",
  // "https://www.autosport.com/f1/news/how-an-unloved-march-carved-out-a-slice-of-f1-history/10701195/",
  // "https://www.autosport.com/f1/news/the-f1-moments-that-defined-the-1980s-4982738/4982738/",
  // "https://atlasf1.autosport.com/evolution/1950s.html",
  // "https://atlasf1.autosport.com/evolution/1980s.html",
  // "https://atlasf1.autosport.com/timeline/90s.html",
  // "https://arstechnica.com/cars/2017/04/formula-1-technology/",
  // "https://www.motorsport.com/f1/news/f1-tech-review-deep-dive-how-marginal-gains-made-red-bulls-rb19-so-good/10559452/",
  // "https://driver61.com/formula-one/how-f1-brakes-work/",
  // "https://www.formula1.com/en/latest/article/watch-the-tech-talk-team-take-a-deep-dive-into-drs.5ezU7RkaB5hFipzZfDKZWK",
  // "https://www.racefans.net/f1-information/going-to-a-race/",
  // "https://www.racefans.net/f1-information/going-to-a-race/circuit-americas-track-information/",
  // "https://www.racefans.net/f1-information/going-to-a-race/silverstone-circuit-information/",
  // "https://www.racefans.net/f1-information/going-to-a-race/autodromo-hermanos-rodriguez-circuit-information/",
  // "https://www.racefans.net/f1-information/going-to-a-race/bahrain-international-circuit-track-information/",
  // "https://www.racefans.net/2025-f1-season/2025-f1-calendar/",
  // "https://www.thegistsports.com/article/a-deep-dive-into-formula-1-and-f1-academy/",
  // "https://arxiv.org/abs/2503.05421",
  // "https://arxiv.org/abs/2501.04068",
  // "https://arxiv.org/abs/2303.00372",
  // "https://www.wired.com/story/how-formula-one-engineers-test-timing-equipment-on-race-day",
  // "https://www.autosport.com/f1/news/a-history-of-f1s-second-half-comebacks-do-mclaren-and-mercedes-have-a-chance/10641296/",
  // "https://www.comscore.com/Insights/Blog/The-Changing-Face-of-Formula-1",
  // "https://forums.autosport.com/topic/221641-the-golden-era-of-formula-1/",
  // "https://en.wikipedia.org/wiki/List_of_Formula_One_drivers",
  // "https://en.wikipedia.org/wiki/List_of_Formula_One_constructors",
  // "https://en.wikipedia.org/wiki/List_of_Formula_One_circuits",
  // "https://en.wikipedia.org/wiki/List_of_Formula_One_seasons",
  // "https://en.wikipedia.org/wiki/List_of_Formula_One_Grand_Prix_winners",
  // "https://www.statsf1.com/en/statistiques/pilote/victoire/nombre.aspx",
  // "https://en.wikipedia.org/wiki/Formula_One",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "cosine"
) => {
  try {
    // Drop existing collection if it exists to ensure clean start
    try {
      await db.dropCollection(ASTRA_DB_COLLECTION);
      console.log("Dropped existing collection");
    } catch (dropError) {
      console.log(
        "Collection doesn't exist or couldn't be dropped, continuing..."
      );
    }

    // Create new collection with correct dimensions for Gemini embeddings
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 768, // text-embedding-004 uses 768 dimensions
        metric: similarityMetric,
      },
    });
    console.log("Collection created with 768 dimensions:", res);
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for (const url of f1Data) {
    try {
      console.log(`Processing: ${url}`);
      const content = await scrapePage(url);

      if (!content || content.trim().length === 0) {
        console.log(`No content found for ${url}, skipping...`);
        continue;
      }

      const chunks = await splitter.splitText(content);

      for (const text of chunks) {
        if (text.trim().length === 0) continue;

        try {
          // Generate embeddings using Gemini API
          const vector = await embeddings.embedQuery(text);

          const res = await collection.insertOne({
            $vector: vector,
            text: text,
            url: url,
            timestamp: new Date().toISOString(),
          });

          console.log(`✓ Inserted chunk from ${url}`);
        } catch (embeddingError) {
          console.error(
            `Error generating embedding for chunk from ${url}:`,
            embeddingError
          );
          continue;
        }
      }
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      continue;
    }
  }

  console.log("Data loading completed!");
};

const scrapePage = async (url: string): Promise<string> => {
  try {
    const loader = new PlaywrightWebBaseLoader(url, {
      launchOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      gotoOptions: {
        waitUntil: "networkidle",
        timeout: 30000,
      },
      evaluate: async (page, browser) => {
        // Enhanced content extraction with better cleaning
        const result = await page.evaluate(() => {
          // Remove unwanted elements
          const unwantedSelectors = [
            "script",
            "style",
            ".ads",
            ".cookie-banner",
          ];

          unwantedSelectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => el.remove());
          });

          // Focus on main content areas
          const contentSelectors = [
            "main",
            "article",
            ".content",
            ".main-content",
            '[role="main"]',
            ".post-content",
            ".entry-content",
          ];

          let content = "";
          for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              content =
                (element as HTMLElement).innerText || element.textContent || "";
              if (content.length > 100) break; // Use first substantial content
            }
          }

          // Fallback to body if no main content found
          if (!content || content.length < 100) {
            content =
              document.body.innerText || document.body.textContent || "";
          }

          return content;
        });

        await browser.close();
        return result;
      },
    });

    const scrapedContent = await loader.scrape();

    // Enhanced cleaning for structured data and metadata
    return (
      scrapedContent
        ?.replace(/<[^>]*>/g, "") // Remove HTML tags
        ?.replace(/\s+/g, " ") // Normalize whitespace
        ?.trim() || ""
      // ?.replace(/\{[^}]*\}/g, "") // Remove JSON objects
      // ?.replace(/\[[^\]]*\]/g, "") // Remove arrays
      // ?.replace(/"[^"]*":/g, "") // Remove JSON keys
      // ?.replace(/nodeType|data|content|marks|value/g, "") // Remove metadata terms
      // ?.replace(/[{}[\]"]/g, "") // Remove brackets and quotes
      // ?.replace(/,+/g, " ") // Replace commas with spaces
      // ?.replace(/\s+/g, " ") // Normalize whitespace
      // ?.replace(/^\W+|\W+$/g, "") // Remove leading/trailing non-word chars
      // ?.replace(/\b(undefined|null|NaN)\b/g, "") // Remove JS undefined values
      // ?.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, "") // Remove timestamps
      // ?.trim() || ""
    );
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return "";
  }
};

// Main execution
createCollection()
  .then(() => loadSampleData())
  .catch(console.error);

// import { DataAPIClient } from "@datastax/astra-db-ts";
// import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
// import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// import "dotenv/config";

// type SimilarityMetric = "cosine" | "dot_product" | "euclidean";

// const {
//   ASTRA_DB_NAMESPACE,
//   ASTRA_DB_COLLECTION,
//   ASTRA_DB_API_ENDPOINT,
//   ASTRA_DB_APPLICATION_TOKEN,
// } = process.env;

// // Initialize BGE embedding model
// const embeddings = new HuggingFaceTransformersEmbeddings({
//   model: "BAAI/bge-large-en-v1.5", // 1024 dimensions
// });

// const f1Data = [
//   "https://www.formula1.com/en/results.html",
//   "https://www.formula1.com/en/latest.html",
//   "https://www.autosport.com/f1/news/",
//   "https://www.motorsport.com/f1/news/",
//   "https://www.espn.com/f1/",
//   "https://en.wikipedia.org/wiki/History_of_Formula_One",
//   "https://en.wikipedia.org/wiki/History_of_Formula_One_regulations",
//   "https://en.wikipedia.org/wiki/H%C3%A4kkinen%E2%80%93Schumacher_rivalry",
//   "https://www.autosport.com/f1/news/history-of-safety-devices-in-formula-1-the-halo-barriers-more-4982360/4982360/",
//   "https://www.autosport.com/f1/news/the-10-biggest-innovations-in-formula-1-history-active-suspension-halo-fan-car-more/10125979/",
//   "https://www.autosport.com/f1/news/the-10-best-formula-1-drivers-ever-hamilton-schumacher-senna-more-4983210/4983210/",
//   "https://www.autosport.com/f1/news/how-an-unloved-march-carved-out-a-slice-of-f1-history/10701195/",
//   "https://www.autosport.com/f1/news/the-f1-moments-that-defined-the-1980s-4982738/4982738/",
//   "https://atlasf1.autosport.com/evolution/1950s.html",
//   "https://atlasf1.autosport.com/evolution/1980s.html",
//   "https://atlasf1.autosport.com/timeline/90s.html",
//   "https://arstechnica.com/cars/2017/04/formula-1-technology/",
//   "https://www.motorsport.com/f1/news/f1-tech-review-deep-dive-how-marginal-gains-made-red-bulls-rb19-so-good/10559452/",
//   "https://driver61.com/formula-one/how-f1-brakes-work/",
//   "https://www.formula1.com/en/latest/article/watch-the-tech-talk-team-take-a-deep-dive-into-drs.5ezU7RkaB5hFipzZfDKZWK",
//   "https://www.racefans.net/f1-information/going-to-a-race/",
//   "https://www.racefans.net/f1-information/going-to-a-race/circuit-americas-track-information/",
//   "https://www.racefans.net/f1-information/going-to-a-race/silverstone-circuit-information/",
//   "https://www.racefans.net/f1-information/going-to-a-race/autodromo-hermanos-rodriguez-circuit-information/",
//   "https://www.racefans.net/f1-information/going-to-a-race/bahrain-international-circuit-track-information/",
//   "https://www.racefans.net/2025-f1-season/2025-f1-calendar/",
//   "https://www.thegistsports.com/article/a-deep-dive-into-formula-1-and-f1-academy/",
//   "https://arxiv.org/abs/2503.05421",
//   "https://arxiv.org/abs/2501.04068",
//   "https://arxiv.org/abs/2303.00372",
//   "https://www.wired.com/story/how-formula-one-engineers-test-timing-equipment-on-race-day",
//   "https://www.autosport.com/f1/news/a-history-of-f1s-second-half-comebacks-do-mclaren-and-mercedes-have-a-chance/10641296/",
//   "https://www.comscore.com/Insights/Blog/The-Changing-Face-of-Formula-1",
//   "https://forums.autosport.com/topic/221641-the-golden-era-of-formula-1/",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_drivers",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_constructors",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_circuits",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_seasons",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_Grand_Prix_winners",
//   "https://www.statsf1.com/en/statistiques/pilote/victoire/nombre.aspx",
//   "https://en.wikipedia.org/wiki/Formula_One",
// ];

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 512,
//   chunkOverlap: 100,
// });

// const createCollection = async (
//   similarityMetric: SimilarityMetric = "cosine"
// ) => {
//   try {
//     // Drop existing collection if it exists to ensure clean start
//     try {
//       await db.dropCollection(ASTRA_DB_COLLECTION);
//       console.log("Dropped existing collection");
//     } catch (dropError) {
//       console.log(
//         "Collection doesn't exist or couldn't be dropped, continuing..."
//       );
//     }

//     // Create new collection with correct dimensions
//     const res = await db.createCollection(ASTRA_DB_COLLECTION, {
//       vector: {
//         dimension: 1024, // BGE-large-en-v1.5 uses 1024 dimensions
//         metric: similarityMetric,
//       },
//     });
//     console.log("Collection created with 1024 dimensions:", res);
//   } catch (error) {
//     console.error("Error creating collection:", error);
//     throw error;
//   }
// };

// const loadSampleData = async () => {
//   const collection = await db.collection(ASTRA_DB_COLLECTION);

//   for (const url of f1Data) {
//     try {
//       console.log(`Processing: ${url}`);
//       const content = await scrapePage(url);

//       if (!content || content.trim().length === 0) {
//         console.log(`No content found for ${url}, skipping...`);
//         continue;
//       }

//       const chunks = await splitter.splitText(content);

//       for (const text of chunks) {
//         if (text.trim().length === 0) continue;

//         try {
//           // Generate embeddings using BGE model
//           const vector = await embeddings.embedQuery(text);

//           const res = await collection.insertOne({
//             $vector: vector,
//             text: text,
//             url: url,
//             timestamp: new Date().toISOString(),
//           });

//           console.log(`✓ Inserted chunk from ${url}`);
//         } catch (embeddingError) {
//           console.error(
//             `Error generating embedding for chunk from ${url}:`,
//             embeddingError
//           );
//           continue;
//         }
//       }
//     } catch (error) {
//       console.error(`Error processing ${url}:`, error);
//       // Continue with next URL instead of failing completely
//       continue;
//     }
//   }

//   console.log("Data loading completed!");
// };

// const scrapePage = async (url: string): Promise<string> => {
//   try {
//     const loader = new PlaywrightWebBaseLoader(url, {
//       launchOptions: {
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       },
//       gotoOptions: {
//         waitUntil: "networkidle",
//         timeout: 30000,
//       },
//       evaluate: async (page, browser) => {
//         // Enhanced content extraction with better cleaning
//         const result = await page.evaluate(() => {
//           // Remove unwanted elements
//           const unwantedSelectors = [
//             "script",
//             "style",
//             "nav",
//             "footer",
//             "header",
//             ".menu",
//             ".navigation",
//             ".sidebar",
//             ".ads",
//             ".cookie-banner",
//             ".popup",
//             ".modal",
//             '[data-testid*="ad"]',
//             '[class*="advertisement"]',
//           ];

//           unwantedSelectors.forEach((selector) => {
//             const elements = document.querySelectorAll(selector);
//             elements.forEach((el) => el.remove());
//           });

//           // Focus on main content areas
//           const contentSelectors = [
//             "main",
//             "article",
//             ".content",
//             ".main-content",
//             '[role="main"]',
//             ".post-content",
//             ".entry-content",
//           ];

//           let content = "";
//           for (const selector of contentSelectors) {
//             const element = document.querySelector(selector);
//             if (element) {
//               content =
//                 (element as HTMLElement).innerText || element.textContent || "";
//               if (content.length > 100) break; // Use first substantial content
//             }
//           }

//           // Fallback to body if no main content found
//           if (!content || content.length < 100) {
//             content =
//               document.body.innerText || document.body.textContent || "";
//           }

//           return content;
//         });

//         await browser.close();
//         return result;
//       },
//     });

//     const scrapedContent = await loader.scrape();

//     // Enhanced cleaning for structured data and metadata
//     return (
//       scrapedContent
//         ?.replace(/\{[^}]*\}/g, "") // Remove JSON objects
//         ?.replace(/\[[^\]]*\]/g, "") // Remove arrays
//         ?.replace(/"[^"]*":/g, "") // Remove JSON keys
//         ?.replace(/nodeType|data|content|marks|value/g, "") // Remove metadata terms
//         ?.replace(/[{}[\]"]/g, "") // Remove brackets and quotes
//         ?.replace(/,+/g, " ") // Replace commas with spaces
//         ?.replace(/\s+/g, " ") // Normalize whitespace
//         ?.replace(/^\W+|\W+$/g, "") // Remove leading/trailing non-word chars
//         ?.replace(/\b(undefined|null|NaN)\b/g, "") // Remove JS undefined values
//         ?.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, "") // Remove timestamps
//         ?.trim() || ""
//     );
//   } catch (error) {
//     console.error(`Error scraping ${url}:`, error);
//     return "";
//   }
// };

// // Main execution
// createCollection()
//   .then(() => loadSampleData())
//   .catch(console.error);

// import { DataAPIClient } from "@datastax/astra-db-ts";
// import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
// import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// import "dotenv/config";

// type SimilarityMetric = "cosine" | "dot_product" | "euclidean";

// const {
//   ASTRA_DB_NAMESPACE,
//   ASTRA_DB_COLLECTION,
//   ASTRA_DB_API_ENDPOINT,
//   ASTRA_DB_APPLICATION_TOKEN,
// } = process.env;

// // Initialize BGE embedding model
// const embeddings = new HuggingFaceTransformersEmbeddings({
//   model: "BAAI/bge-large-en-v1.5", // 1024 dimensions
// });

// const f1Data = [
//   "https://www.formula1.com/en/results.html",
//   "https://www.formula1.com/en/latest.html",
//   "https://www.autosport.com/f1/news/",
//   "https://www.motorsport.com/f1/news/",
//   "https://www.espn.com/f1/",
//   "https://en.wikipedia.org/wiki/History_of_Formula_One",
//   "https://en.wikipedia.org/wiki/History_of_Formula_One_regulations",
//   "https://en.wikipedia.org/wiki/H%C3%A4kkinen%E2%80%93Schumacher_rivalry",
//   "https://www.autosport.com/f1/news/history-of-safety-devices-in-formula-1-the-halo-barriers-more-4982360/4982360/",
//   "https://www.autosport.com/f1/news/the-10-biggest-innovations-in-formula-1-history-active-suspension-halo-fan-car-more/10125979/",
//   "https://www.autosport.com/f1/news/the-10-best-formula-1-drivers-ever-hamilton-schumacher-senna-more-4983210/4983210/",
//   "https://www.autosport.com/f1/news/how-an-unloved-march-carved-out-a-slice-of-f1-history/10701195/",
//   "https://www.autosport.com/f1/news/the-f1-moments-that-defined-the-1980s-4982738/4982738/",
//   "https://atlasf1.autosport.com/evolution/1950s.html",
//   "https://atlasf1.autosport.com/evolution/1980s.html",
//   "https://atlasf1.autosport.com/timeline/90s.html",
//   "https://arstechnica.com/cars/2017/04/formula-1-technology/",
//   "https://www.motorsport.com/f1/news/f1-tech-review-deep-dive-how-marginal-gains-made-red-bulls-rb19-so-good/10559452/",
//   "https://driver61.com/formula-one/how-f1-brakes-work/",
//   "https://www.formula1.com/en/latest/article/watch-the-tech-talk-team-take-a-deep-dive-into-drs.5ezU7RkaB5hFipzZfDKZWK",
//   "https://www.racefans.net/f1-information/going-to-a-race/",
//   "https://www.racefans.net/f1-information/going-to-a-race/circuit-americas-track-information/",
//   "https://www.racefans.net/f1-information/going-to-a-race/silverstone-circuit-information/",
//   "https://www.racefans.net/f1-information/going-to-a-race/autodromo-hermanos-rodriguez-circuit-information/",
//   "https://www.racefans.net/f1-information/going-to-a-race/bahrain-international-circuit-track-information/",
//   "https://www.racefans.net/2025-f1-season/2025-f1-calendar/",
//   "https://www.thegistsports.com/article/a-deep-dive-into-formula-1-and-f1-academy/",
//   "https://arxiv.org/abs/2503.05421",
//   "https://arxiv.org/abs/2501.04068",
//   "https://arxiv.org/abs/2303.00372",
//   "https://www.wired.com/story/how-formula-one-engineers-test-timing-equipment-on-race-day",
//   "https://www.autosport.com/f1/news/a-history-of-f1s-second-half-comebacks-do-mclaren-and-mercedes-have-a-chance/10641296/",
//   "https://www.comscore.com/Insights/Blog/The-Changing-Face-of-Formula-1",
//   "https://forums.autosport.com/topic/221641-the-golden-era-of-formula-1/",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_drivers",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_constructors",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_circuits",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_seasons",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_Grand_Prix_winners",
//   "https://www.statsf1.com/en/statistiques/pilote/victoire/nombre.aspx",
//   "https://en.wikipedia.org/wiki/Formula_One",
// ];

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 512,
//   chunkOverlap: 100,
// });

// const createCollection = async (
//   similarityMetric: SimilarityMetric = "cosine"
// ) => {
//   try {
//     // Check if collection exists first
//     const collections = await db.listCollections();
//     const collectionExists = collections.some(
//       (col) => col.name === ASTRA_DB_COLLECTION
//     );

//     if (!collectionExists) {
//       const res = await db.createCollection(ASTRA_DB_COLLECTION, {
//         vector: {
//           dimension: 1024, // BGE-large-en-v1.5 uses 1024 dimensions
//           metric: similarityMetric,
//         },
//       });
//       console.log("Collection created:", res);
//     } else {
//       console.log("Collection already exists, skipping creation");
//     }
//   } catch (error) {
//     if (error.name === "CollectionAlreadyExistsError") {
//       console.log(
//         "Collection already exists, continuing with existing collection"
//       );
//     } else {
//       console.error("Error creating collection:", error);
//       throw error;
//     }
//   }
// };

// const loadSampleData = async () => {
//   const collection = await db.collection(ASTRA_DB_COLLECTION);

//   for (const url of f1Data) {
//     try {
//       console.log(`Processing: ${url}`);
//       const content = await scrapePage(url);

//       if (!content || content.trim().length === 0) {
//         console.log(`No content found for ${url}, skipping...`);
//         continue;
//       }

//       const chunks = await splitter.splitText(content);

//       for (const text of chunks) {
//         if (text.trim().length === 0) continue;

//         try {
//           // Generate embeddings using BGE model
//           const vector = await embeddings.embedQuery(text);

//           const res = await collection.insertOne({
//             $vector: vector,
//             text: text,
//             url: url,
//             timestamp: new Date().toISOString(),
//           });

//           console.log(`✓ Inserted chunk from ${url}`);
//         } catch (embeddingError) {
//           console.error(
//             `Error generating embedding for chunk from ${url}:`,
//             embeddingError
//           );
//           continue;
//         }
//       }
//     } catch (error) {
//       console.error(`Error processing ${url}:`, error);
//       // Continue with next URL instead of failing completely
//       continue;
//     }
//   }

//   console.log("Data loading completed!");
// };

// const scrapePage = async (url: string): Promise<string> => {
//   try {
//     const loader = new PuppeteerWebBaseLoader(url, {
//       launchOptions: {
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       },
//       gotoOptions: {
//         waitUntil: "domcontentloaded",
//         timeout: 30000,
//       },
//       evaluate: async (page, browser) => {
//         const result = await page.evaluate(() => document.body.innerHTML);
//         await browser.close();
//         return result;
//       },
//     });

//     const scrapedContent = await loader.scrape();
//     // Remove HTML tags and clean up the content
//     return (
//       scrapedContent
//         ?.replace(/<[^>]*>?/gm, "")
//         .replace(/\s+/g, " ")
//         .trim() || ""
//     );
//   } catch (error) {
//     console.error(`Error scraping ${url}:`, error);
//     return "";
//   }
// };

// // Main execution
// createCollection()
//   .then(() => loadSampleData())
//   .catch(console.error);

// import { DataAPIClient } from "@datastax/astra-db-ts";
// import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
// // import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";

// import OpenAi from "openai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// import "dotenv/config";

// type SimilarityMetric = "cosine" | "dot_product" | "euclidean";

// const {
//   ASTRA_DB_NAMESPACE,
//   ASTRA_DB_COLLECTION,
//   ASTRA_DB_API_ENDPOINT,
//   ASTRA_DB_APPLICATION_TOKEN,
//   OPENAI_API_KEY,
//   GOOGLE_API_KEY,
// } = process.env;

// const openapi = new OpenAi({ apiKey: OPENAI_API_KEY });

// const f1Data = [
//   "https://en.wikipedia.org/wiki/Formula_One",
//   "https://www.formula1.com/",
//   "https://www.fia.org/",
//   "https://www.fia.com/F126",
//   "https://www.fia.com/events/fia-formula-one-world-championship/season-2025/2025-fia-formula-one-world-championship",
//   "https://www.mclaren.com/racing/",
//   "https://www.mercedesamgf1.com/",
//   "https://www.ferrari.com/en-EN/formula1",
//   "https://www.redbullracing.com/int-en/team",
//   "https://www.astonmartinf1.com/en-GB",
//   "https://www.haasf1team.com/",
//   "https://www.foxsports.com/motor/formula-1",
//   "https://www.motorsport.com/",
//   "https://www.autosport.com/",
//   "https://www.motorsport-total.com/",
//   "https://www.formel1.de/",
//   "https://www.skysports.com/f1",
//   "https://www.tvinsider.com/show/formula-1/",
//   "https://espnpressroom.com/us/media-kits/formula-1/",
//   "https://pitwall.app/",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_seasons",
//   "https://liquipedia.net/formula1/Main_Page",
//   "https://www.statsf1.com/en/default.aspx",
//   "https://openf1.org/",
//   "https://www.racingarchives.org/tag/formula-one/",
//   "https://en.wikipedia.org/wiki/List_of_Formula_One_driver_records",
//   "https://www.f1-photo.com/F1-Archives",
//   "https://www.wallpaper.com/transportation/formula-1-the-impossible-collection-book-assouline",
//   "https://f1i.com/category/magazine/magazine-technical",
//   "https://racingnews365.com/tech",
//   "https://www.astonmartinf1.com/en-GB/news/feature/the-road-to-2026-f1s-new-era-and-regulations-explained",
//   "https://www.f1academy.com/About/5tFG4jMNrPG2LzxYgk5mxU/rules-and-regulations",
//   "https://www.racecar-engineering.com/",
//   "https://www.haasf1team.com/race-engineering",
//   "https://fluidjobs.com/blog/benetton-s-illegal-traction-control-system-a-technical-analysis-of-f1-innovation-in-1994",
//   "https://www.theseus.fi/bitstream/handle/10024/856650/Msakamali_Baraka.pdf?sequence=6",
//   "https://en.wikipedia.org/wiki/Formula_One_regulations",
//   "https://www.racefans.net/forums/",
//   "https://forums.ea.com/category/f1-24-en/discussions/f1-24-general-discussion-en",
//   "https://www.formula1.com/en/page/discover-unlocked",
//   "https://www.f1academy.com/",
//   "https://forums.ea.com/category/f1-games-en/discussions/f1-games-franchise-discussion-en",
//   "https://forum.planetf1.com/",
// ];

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 512,
//   chunkOverlap: 100,
// });

// const createCollection = async (
//   similarityMetric: SimilarityMetric = "dot_product"
// ) => {
//   const res = await db.createCollection(ASTRA_DB_COLLECTION, {
//     vector: {
//       dimension: 1536,
//       metric: similarityMetric,
//     },
//   });
//   console.log(res);
// };

// const loadSampleData = async () => {
//   const collection = await db.collection(ASTRA_DB_COLLECTION);
//   for await (const url of f1Data) {
//     const content = await scrapePage(url);
//     const chunk = await splitter.splitText(content);
//     for await (const text of chunk) {
//       const embedding = await openapi.embeddings.create({
//         model: "text-embedding-3-small",
//         input: chunk,
//         encoding_format: "float",
//       });
//       const vector = embedding.data[0].embedding;

//       const res = await collection.insertOne({
//         $vector: vector,
//         text: chunk,
//       });
//       console.log(res);
//     }
//   }
// };

// const scrapePage = async (url: string) => {
//   const loader = new PuppeteerWebBaseLoader(url, {
//     launchOptions: {
//       headless: true,
//     },
//     gotoOptions: {
//       waitUntil: "domcontentloaded",
//     },
//     evaluate: async (page, browser) => {
//       const result = await page.evaluate(() => document.body.innerHTML);
//       await browser.close();
//       return result;
//     },
//   });
//   return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
// };

// createCollection().then(() => loadSampleData());
