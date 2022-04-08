const openai = require("./openai");
const file = require("./filename");

const getResponse = async (query) => {
    let response;

    try {
        response = await openai.createAnswer({
            search_model: "davinci",
            model: "davinci",
            question: query,
            file,
            examples_context:
                'A 3D model can be added by right clicking on the root, looking for \'add model\' and then clicking it. Only .mod and .kicad_mod files are supported. Right click on root folder and select "add" > "Footprint". This will create a new footprint object in the Objects panel.',
            examples: [
                [
                    "What file types are supported?",
                    "We currently accept .mod or .kicad_mod files.",
                ],
            ],
            max_tokens: 32,
            return_metadata: true,
            stop: [". "]
        });
    } catch (e) {
        console.log(e);
    }
    console.log(response.data);
    return response;
};

module.exports = getResponse;
