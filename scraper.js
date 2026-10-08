const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.hdfilmizle.live';

// İsteğin engellenmemesi için standart tarayıcı başlıkları (User-Agent)
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': BASE_URL
};

// 1. SİTEDEN KATALOG ÇEKME (Film ve Diziler)
async function getCatalog(type) {
  try {
    // Site yapısına göre film veya dizi kategorisi bağlantısı
    const targetUrl = type === 'movie' ? `${BASE_URL}/film-izle/` : `${BASE_URL}/dizi-izle/`;
    const { data } = await axios.get(targetUrl, { headers });
    const $ = cheerio.load(data);
    const metas = [];

    // hdfilmizle.live üzerindeki film/dizi kartları (box/poster sınıfları)
    $('.poster-pop, .movie-box, article.item').each((i, el) => {
      const title = $(el).find('.title, .entry-title, h2').text().trim();
      let poster = $(el).find('img').attr('data-src') \vert{}\vert{}$(el).find('img').attr('src');
      const pageLink = $(el).find('a').attr('href');

      if (poster && !poster.startsWith('http')) {
        poster = `${BASE_URL}${poster}`;
      }

      if (title && pageLink) {
        // Linki Base64 ile encode edip ID yapıyoruz
        const uniqueId = Buffer.from(pageLink).toString('base64');
        metas.push({
          id: `ozel_${type}_${uniqueId}`,
          type: type,
          name: title,
          poster: poster || ''
        });
      }
    });

    return metas;
  } catch (error) {
    console.error("Katalog çekme hatası:", error.message);
    return [];
  }
}

// 2. DETAY SAYFASINDAN OYNATILABİLİR YAYIN (STREAM) LINKI ÇEKME
async function getStreams(type, id) {
  try {
    const rawBase64 = id.replace(`ozel_${type}_`, '');
    const pageUrl = Buffer.from(rawBase64, 'base64').toString('utf-8');

    const { data } = await axios.get(pageUrl, { headers });
    const $ = cheerio.load(data);
    const streams = [];

    // Detay sayfasındaki video player iframe kaynakları
    $('iframe').each((i, el) => {
      let src = $(el).attr('src') \vert{}\vert{}$(el).attr('data-src');
      if (src) {
        if (src.startsWith('//')) {
          src = `https:${src}`;
        }
        
        // Reklam veya sosyal medya iframe'lerini ayıkla
        if (!src.includes('facebook') && !src.includes('google') && !src.includes('twitter')) {
          streams.push({
            title: `HDFilmIzle - Kaynak ${i + 1} (1080p)`,
            url: src
          });
        }
      }
    });

    return streams;
  } catch (error) {
    console.error("Stream çekme hatası:", error.message);
    return [];
  }
}

module.exports = { getCatalog, getStreams };