import { generateBatch } from "./src/server/horoscope-automation/batch-generator.js";

async function main() {
    try {
        const result = await generateBatch({
            period: "daily",
            dateFor: "2026-08-05",
            signs: ["aries"],
            variants: [1],
            maxRetries: 0
        });
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}
main();
