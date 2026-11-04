// Maestro-compatible JS: no Node, TypeScript, network or filesystem access.
const card = maestro.copiedText;
if (typeof card !== 'string')
  throw new Error('Vacancy card text was not captured.');
const lines = card.split('\n');
const title = lines[0];
const employer = lines[1];
if (!title || !employer)
  throw new Error('The observed title/employer card structure changed.');
function literal(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// Match identity rather than the changing relative-update timestamp.
output.publicVacancyCard =
  '(?s)(?-i)^' + literal(title) + '\n' + literal(employer) + '\n.*$';
output.publicVacancyTitle = '(?-i)^' + literal(title) + '$';
// Detail accessibility merges the exact title with subsequent metadata lines.
output.publicVacancyDetailTitle = '(?s)(?-i)^' + literal(title) + '(?:\n.*)?$';
output.publicVacancyEmployer = '(?-i)^' + literal(employer) + '$';
