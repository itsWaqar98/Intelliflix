const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const port = 4000;

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const bodyParser = require('body-parser');

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Handle the OpenAI API request
app.post('/search', async (req, res) => {
  try{
  const srchText = req.body.srchText;
  // Use the srchText value as needed
  // Call OpenAI API or perform any other operations
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Act as a movie search engine. I will provide you the description of a movie. You will provide the top 10 most possible movies's IMDB IDS. The description of the movie is: ${srchText}. Please list the IMDb IDs in the following format: 'tt0111161, tt1375666, tt0133093'.`,
      temperature: 0.5,
      top_p: 0.5,
      frequency_penalty: 0.0,
      max_tokens: 100,
      
    }); 

  //result of chat gpt
  const result = completion.data.choices[0].text;
    const movieIds = result.split(',').map(result => result.trim());
    console.log('Movie IDs:', movieIds);

    // Return the response with the movie IDs
    res.json({ movieIds });
  
}
catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'rola pe gya' });
}

});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  

});
