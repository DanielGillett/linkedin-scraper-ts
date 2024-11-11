export default () => ({
  linkedin: {
    email: process.env.LINKEDIN_EMAIL,
    password: process.env.LINKEDIN_PASSWORD,
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    headless: process.env.HEADLESS !== 'false',
  },
});