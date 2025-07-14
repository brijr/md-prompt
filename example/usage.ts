import prompt from './weather.md';

// TypeScript will enforce that all required variables are provided
const weatherPrompt = prompt({ 
  city: 'San Francisco', 
  temp: 22,
  conditions: 'sunny' // optional
});

console.log(weatherPrompt);

// This would cause a TypeScript error:
// const invalidPrompt = prompt({ city: 'London' }); // Error: missing 'temp'