import * as fs from 'fs/promises';
import * as path from 'path';
const matter = require('gray-matter');
const handlebars = require('handlebars');

describe('Email template compilation', () => {
  const templatesDir = path.join(__dirname, '..', 'templates');
  const templateFile = path.join(templatesDir, 'iris_juror_invitation.html');

  it('injects currentYear by default and allows override', async () => {
    const raw = await fs.readFile(templateFile, 'utf8');
    const parsed = matter(raw);
    const htmlBody = parsed.content;

    const year = new Date().getFullYear();

    const compiledParams = { currentYear: year };
    const compiled = handlebars.compile(htmlBody)(compiledParams);
    expect(compiled).toContain(String(year));

    const override = handlebars.compile(htmlBody)({ currentYear: 1999 });
    expect(override).toContain('1999');
  });
});
