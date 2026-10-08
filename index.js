const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const manifest = require("./manifest");
const { getCatalog, getStreams } = require("./scraper");

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id }) => {
  if (id === "ozel_film_katalog" || id === "ozel_dizi_katalog") {
    const metas = await getCatalog(type);
    return { metas };
  }
  return { metas: [] };
});

builder.defineStreamHandler(async ({ type, id }) => {
  if (id.startsWith("ozel_")) {
    const streams = await getStreams(type, id);
    return { streams };
  }
  return { streams: [] };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
