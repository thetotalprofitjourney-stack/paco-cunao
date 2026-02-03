const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, '../../prompts');

const loadPrompt = (filename) => {
  const filePath = path.join(promptsDir, filename);
  return fs.readFileSync(filePath, 'utf8');
};

const getSystemPrompt = (context) => {
  const template = loadPrompt('system.txt');
  return template.replace('{{CONTEXTO_PARTIDA}}', context);
};

const getAckPrompt = (playerMessages) => {
  const template = loadPrompt('ack.txt');
  return template.replace('{{player_messages}}', playerMessages);
};

const getResultsPrompt = (days, playerSuggestion) => {
  const template = loadPrompt('results.txt');
  return template
    .replace('{{days}}', days)
    .replace('{{player_suggestion}}', playerSuggestion);
};

const getTriggerPrompt = () => {
  return loadPrompt('trigger.txt');
};

module.exports = {
  getSystemPrompt,
  getAckPrompt,
  getResultsPrompt,
  getTriggerPrompt,
};
