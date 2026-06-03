#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");

async function sortGames() {
    const file = path.join(__dirname, "..", "games.json");
    try {
        const raw = await fs.readFile(file, "utf8");
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr))
            throw new Error("Expected array in games.json");
        arr.sort((a, b) => {
            const A = (a.game || "").toLowerCase();
            const B = (b.game || "").toLowerCase();
            if (A < B) return -1;
            if (A > B) return 1;
            return 0;
        });
        await fs.writeFile(file, JSON.stringify(arr, null, 4) + "\n", "utf8");
        console.log("Sorted games.json by title (`game`) and saved.");
    } catch (err) {
        console.error("Error sorting games.json:", err.message || err);
        process.exit(1);
    }
}

sortGames();
