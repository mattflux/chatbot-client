const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY,
});


console.log("api key?", process.env.OPEN_API_KEY);
const openai = new OpenAIApi(configuration);

module.exports = openai;