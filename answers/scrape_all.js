const puppeteer = require("puppeteer");
const fs = require("fs");

const urls = [
    "https://docs.flux.ai/getting-started/getting-started-with-flux",
    "https://docs.flux.ai/getting-started/drawing-your-first-schematic",
    "https://docs.flux.ai/getting-started/how-parts-work",
    "https://docs.flux.ai/getting-started/creating-and-importing-parts",
    "https://docs.flux.ai/getting-started/importing-footprints---3d-models",
    "https://docs.flux.ai/getting-started/collaboration-in-flux",
    "https://docs.flux.ai/getting-started/how-to-simulate-your-circuit",
    "https://docs.flux.ai/getting-started/PCB-tutorial-with-sub-layouts",
    "https://docs.flux.ai/getting-started/pcb-layout-rule-selectors",
];

const scrapeVideos = () => {
    return new Promise(function (success, nosuccess) {
        const { spawn } = require("child_process");
        const pyprog = spawn("python3", ["./scrape_videos.py"]);

        pyprog.stdout.on("data", function (data) {
            success(data);
        });

        pyprog.stderr.on("data", (data) => {
            nosuccess(data);
        });

        pyprog.on("error", (data) => {
            nosuccess(data);
        });

        pyprog.on("close", (data) => {
            success(data);
        });
    });
};

const scrapeArticles = async () => {
    for (url of urls) {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector("p", {
            timeout: 10000,
        });
        const extractedText = await page.$eval("*", (el) => {
            function isHeader(element) {
                return (
                    element.nodeName.toLowerCase().includes("h") ||
                    (element.firstChild.nodeName.toLowerCase() === "strong" &&
                        element.childNodes.length === 1)
                );
            }
            const dict = {};
            const paragraphs = [...document.querySelectorAll("p")];
            paragraphs.forEach((p) => {
                if (isHeader(p)) {
                    return;
                }
                let header;
                let sibling = p.previousElementSibling;
                while (sibling && !isHeader(sibling)) {
                    sibling = sibling.previousElementSibling;
                }
                if (sibling && isHeader(sibling)) {
                    header = sibling.textContent;
                }
                if (header && p.textContent) {
                    dict[header] = dict[header]
                        ? dict[header] + " " + p.textContent
                        : p.textContent;
                }
            });
            return dict;
        });
        const objects = Object.entries(extractedText).map(
            ([header, content]) => {
                return {
                    text: content,
                    metadata: {
                        article_id: url,
                        header: header.toLowerCase().split(" ").join("-"),
                    },
                };
            }
        );

        objects.forEach((object) => {
            fs.appendFileSync(
                "./all_content.jsonl",
                JSON.stringify(object) + "\n"
            );
        });

        await browser.close();
    }
};

module.exports = async () => {
    await scrapeVideos();
    await scrapeArticles();
};
