module.exports = {
  id: "com.siteniz.nuvioaddon",
  version: "1.0.0",
  name: "Özel Film/Dizi Kaynağı",
  description: "Özel siteden çekilen film ve dizi kataloğu",
  resources: ["catalog", "stream"],
  types: ["movie", "series"],
  catalogs: [
    { type: "movie", id: "ozel_film_katalog", name: "Sitem - Filmler" },
    { type: "series", id: "ozel_dizi_katalog", name: "Sitem - Diziler" }
  ],
  idPrefixes: ["ozel_"]
};