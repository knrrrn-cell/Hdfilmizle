const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

// 1. MANIFEST: Hem YAYIN hem de KATALOG desteği veriyoruz
const builder = new addonBuilder({
    id: "com.burak.tr.superpack",
    version: "2.0.0",
    name: "Süper TR Medya Motoru",
    description: "HDFilmcehennemi, Dizigom, Animecix, ÇizgiMax özel katalogları ve canlı kaynakları.",
    resources: ["catalog", "stream"],
    types: ["movie", "series", "anime"],
    idPrefixes: ["tt"],
    
    // Stremio "Keşfet / Discover" Menüsünde Görünecek Özel Site Katalogları
    catalogs: [
        {
            type: "movie",
            id: "hdfilmcehennemi_cat",
            name: "HDFilmcehennemi (Filmler)"
        },
        {
            type: "series",
            id: "dizigom_cat",
            name: "Dizigom (Diziler)"
        },
        {
            type: "anime",
            id: "animecix_cat",
            name: "Animecix (Animeler)"
        },
        {
            type: "series",
            id: "cizgimax_cat",
            name: "ÇizgiMax (Çizgi Diziler)"
        }
    ]
});

// HTTP Başlıkları (Site Engellerini Aşmak İçin Tarayıcı Taklidi)
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

// ==========================================
// A) KATALOG HANDLER (Ana Sayfada İçerik Gösterme)
// ==========================================
builder.defineCatalogHandler(async (args) => {
    console.log(`[📂] Katalog istendi: ${args.id}`);
    
    // Örnek: Stremio ana sayfasında bu kataloglar seçildiğinde gösterilecek afişler
    // Gerçek kullanımda ilgili sitelerin ana sayfaları cheerio ile taranıp güncel filmler çekilir
    let metas = [];

    if (args.id === "hdfilmcehennemi_cat") {
        metas = [
            { id: "tt0816692", type: "movie", name: "Interstellar", poster: "https://image.tmdb.org/t/p/w500/gEU2GfiQqG3339233.jpg" },
            { id: "tt1375666", type: "movie", name: "Inception", poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09m932.jpg" }
        ];
    } else if (args.id === "dizigom_cat") {
        metas = [
            { id: "tt0944947", type: "series", name: "Game of Thrones", poster: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01s.jpg" }
        ];
    } else if (args.id === "animecix_cat") {
        metas = [
            { id: "tt9335498", type: "series", name: "Demon Slayer", poster: "https://image.tmdb.org/t/p/w500/xUfRStL138v2.jpg" }
        ];
    }

    return { metas: metas };
});

// ==========================================
// B) STREAM HANDLER (Video Linklerini Sunma)
// ==========================================

// Site 1: HDFilmcehennemi Arama Fonksiyonu
async function getHDFilmcehennemiStreams(imdbId) {
    // Burada HDFilmcehennemi taraması yapılır
    return [{
        name: "HDFilmcehennemi", // Ekranda sol tarafta çıkacak site adı!
        title: "🎬 1080p Full HD\n🔊 Türkçe Dublaj",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }];
}

// Site 2: Dizigom Arama Fonksiyonu
async function getDizigomStreams(imdbId, season, episode) {
    // Burada Dizigom taraması yapılır
    return [{
        name: "Dizigom", // Ekranda sol tarafta çıkacak site adı!
        title: `🎬 S${season}E${episode} 1080p\n🔊 Türkçe Altyazılı`,
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    }];
}

// Site 3: Animecix Arama Fonksiyonu
async function getAnimecixStreams(imdbId, episode) {
    return [{
        name: "Animecix", // Ekranda sol tarafta çıkacak site adı!
        title: `🌸 Bölüm ${episode} - 1080p\n🔊 Türkçe Altyazılı`,
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    }];
}

// Ana Oynatıcı Motoru
builder.defineStreamHandler(async (args) => {
    const parts = args.id.split(":");
    const imdbId = parts[0];
    const season = parts[1] || 1;
    const episode = parts[2] || 1;

    console.log(`[🚀] Yayın İstendi: ID=${imdbId}`);

    // Bütün siteleri eşzamanlı (paralel) olarak sorguluyoruz
    const results = await Promise.allSettled([
        getHDFilmcehennemiStreams(imdbId),
        getDizigomStreams(imdbId, season, episode),
        getAnimecixStreams(imdbId, episode)
    ]);

    let allStreams = [];
    results.forEach(res => {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
            allStreams = allStreams.concat(res.value);
        }
    });

    return { streams: allStreams };
});

// Sunucuyu Başlatma
const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
