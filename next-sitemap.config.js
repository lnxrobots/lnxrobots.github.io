/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://lnxrobots.github.io',
  generateRobotsTxt: true,
  outDir: './out',
  generateIndexSitemap: false,

  changefreq: undefined,
  priority: undefined,
  autoLastmod: false,

  exclude: ['/icon.svg', '/icon.svg/']
}
