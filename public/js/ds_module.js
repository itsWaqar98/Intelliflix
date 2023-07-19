const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function runCompletion () {
    const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Enlist only IMDB ids without their movie names using this plot: 'i want to watch horror movies with a little taste of romance inside.'",
    max_tokens:4000
    });
  const result = completion.data.choices[0].text;
  const movieIds = result.split(',').map(result => result.trim());

  console.log(movieIds);
}

runCompletion();
