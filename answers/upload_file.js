const fs = require("fs");

const openai = require("./openai");
const scrapeAll = require("./scrape_all");

const getFiles = async () => {
    const files = await openai.listFiles();
    return files.data.data;
};

const uploadFile = async () => {
    // first delete any old files
    const oldFiles = await getFiles();
    await Promise.all(
        oldFiles.map((file) => {
            return openai.deleteFile(file.id);
        })
    );

    // run scraper
    await scrapeAll();

    // upload new file
    const file = await openai.createFile(
        fs.createReadStream("all_content.jsonl"),
        "answers"
    );

    // write new file id
    fs.writeFileSync("./filename.js", `module.exports = "${file.data.id}";`);
    console.log(file.data.id, "written");
};

uploadFile();
