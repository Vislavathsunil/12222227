
import logger from '../Logging Middleware/logger';

const STORAGE_KEY = 'shortenedUrls';
const SHORTCODE_LENGTH = 6;
const VALID_SHORTCODE_REGEX = /^[a-zA-Z0-9]{4,12}$/;

function generateShortcode(existingShortcodes) {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 2 + SHORTCODE_LENGTH);
  } while (existingShortcodes.has(code));
  return code;
}

function getAllShortenedUrls() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveShortenedUrls(urls) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

export function shortenUrls(urlInputs) {
  
  const results = [];
  const allUrls = getAllShortenedUrls();
  const existingShortcodes = new Set(allUrls.map(u => u.shortcode));

  urlInputs.forEach(({ longUrl, validity, customCode }) => {
    let shortcode = customCode;
    let expiryMinutes = parseInt(validity);
    if (!expiryMinutes || expiryMinutes <= 0) expiryMinutes = 30;
    const expiryDate = new Date(Date.now() + expiryMinutes * 60000);

    
    try {
      new URL(longUrl);
    } catch {
      logger.error(`Invalid URL: ${longUrl}`);
      results.push({ error: 'Invalid URL', longUrl });
      return;
    }

     
    if (shortcode) {
      if (!VALID_SHORTCODE_REGEX.test(shortcode)) {
        logger.warn(`Invalid shortcode: ${shortcode}`);
        results.push({ error: 'Invalid shortcode', longUrl });
        return;
      }
      if (existingShortcodes.has(shortcode)) {
        logger.warn(`Shortcode already exists: ${shortcode}`);
        results.push({ error: 'Shortcode already exists', longUrl });
        return;
      }
    } else {
      shortcode = generateShortcode(existingShortcodes);
    }

   
    const shortUrlObj = {
      longUrl,
      shortcode,
      expiryDate: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
      visits: 0,
    };
    allUrls.push(shortUrlObj);
    existingShortcodes.add(shortcode);
    logger.info(`Shortened URL created: ${shortcode} for ${longUrl}`);
    results.push({ ...shortUrlObj });
  });

  saveShortenedUrls(allUrls);
  return results;
}

export function getShortenedUrl(shortcode) {
  const allUrls = getAllShortenedUrls();
  return allUrls.find(u => u.shortcode === shortcode);
}

export function incrementVisit(shortcode) {
  const allUrls = getAllShortenedUrls();
  const urlObj = allUrls.find(u => u.shortcode === shortcode);
  if (urlObj) {
    urlObj.visits = (urlObj.visits || 0) + 1;
    saveShortenedUrls(allUrls);
    logger.info(`Visit incremented for shortcode: ${shortcode}`);
  }
}

export function getAllUrls() {
  return getAllShortenedUrls();
}
class URLShortenerService {
  constructor() {
    this.urls = this.loadURLsFromStorage();
    this.baseUrl = window.location.origin;
    logger.info('URLShortenerService initialized', { urlCount: this.urls.length });
  }

  loadURLsFromStorage() {
    try {
      const stored = localStorage.getItem('url_shortener_data');
      const urls = stored ? JSON.parse(stored) : [];
      logger.debug('Loaded URLs from storage', { count: urls.length });
      return urls;
    } catch (error) {
      logger.error('Failed to load URLs from storage', error);
      return [];
    }
  }

  saveURLsToStorage() {
    try {
      localStorage.setItem('url_shortener_data', JSON.stringify(this.urls));
      logger.debug('URLs saved to storage', { count: this.urls.length });
    } catch (error) {
      logger.error('Failed to save URLs to storage', error);
    }
  }

  generateShortCode() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
 
    if (this.urls.some(url => url.shortCode === result)) {
      logger.debug('Generated shortcode collision, regenerating', { shortCode: result });
      return this.generateShortCode();
    }
    
    logger.debug('Generated unique shortcode', { shortCode: result });
    return result;
  }

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateShortCode(shortCode) {
     
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(shortCode);
  }

  isShortCodeUnique(shortCode) {
    return !this.urls.some(url => url.shortCode === shortCode);
  }

  isURLExpired(url) {
    return new Date() > new Date(url.expiryDate);
  }

  shortenURL(originalUrl, customShortCode = null, validityMinutes = 30) {
    logger.info('Attempting to shorten URL', { 
      originalUrl, 
      customShortCode, 
      validityMinutes 
    });

    
    if (!this.validateURL(originalUrl)) {
      const error = 'Invalid URL format';
      logger.warn('URL shortening failed - invalid format', { originalUrl });
      throw new Error(error);
    }

     
    let shortCode;
    if (customShortCode) {
      if (!this.validateShortCode(customShortCode)) {
        const error = 'Invalid shortcode format. Must be 3-20 alphanumeric characters.';
        logger.warn('URL shortening failed - invalid shortcode format', { customShortCode });
        throw new Error(error);
      }
      
      if (!this.isShortCodeUnique(customShortCode)) {
        const error = 'Shortcode already exists. Please choose a different one.';
        logger.warn('URL shortening failed - shortcode exists', { customShortCode });
        throw new Error(error);
      }
      
      shortCode = customShortCode;
    } else {
      shortCode = this.generateShortCode();
    }

    
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + validityMinutes);

     
    const urlData = {
      id: Date.now() + Math.random(),
      originalUrl,
      shortCode,
      shortUrl: `${this.baseUrl}/${shortCode}`,
      createdAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      validityMinutes,
      clicks: 0,
      isActive: true
    };

    this.urls.push(urlData);
    this.saveURLsToStorage();

    logger.info('URL shortened successfully', { 
      shortCode, 
      originalUrl, 
      expiryDate: urlData.expiryDate 
    });

    return urlData;
  }

  getOriginalURL(shortCode) {
    logger.debug('Attempting to resolve shortcode', { shortCode });
    
    const urlData = this.urls.find(url => url.shortCode === shortCode);
    
    if (!urlData) {
      logger.warn('Shortcode not found', { shortCode });
      throw new Error('Short URL not found');
    }

    if (this.isURLExpired(urlData)) {
      logger.warn('Shortcode expired', { shortCode, expiryDate: urlData.expiryDate });
      throw new Error('Short URL has expired');
    }

    if (!urlData.isActive) {
      logger.warn('Shortcode inactive', { shortCode });
      throw new Error('Short URL is inactive');
    }

    
    urlData.clicks++;
    this.saveURLsToStorage();

    logger.info('Shortcode resolved successfully', { 
      shortCode, 
      originalUrl: urlData.originalUrl,
      clicks: urlData.clicks 
    });

    return urlData;
  }

  getAllURLs() {
    logger.debug('Retrieving all URLs', { count: this.urls.length });
    return this.urls.map(url => ({
      ...url,
      isExpired: this.isURLExpired(url)
    }));
  }

  getActiveURLs() {
    const activeUrls = this.urls.filter(url => 
      url.isActive && !this.isURLExpired(url)
    );
    logger.debug('Retrieving active URLs', { count: activeUrls.length });
    return activeUrls;
  }

  deleteURL(shortCode) {
    logger.info('Attempting to delete URL', { shortCode });
    
    const index = this.urls.findIndex(url => url.shortCode === shortCode);
    if (index === -1) {
      logger.warn('URL not found for deletion', { shortCode });
      throw new Error('URL not found');
    }

    const deletedUrl = this.urls.splice(index, 1)[0];
    this.saveURLsToStorage();

    logger.info('URL deleted successfully', { shortCode, originalUrl: deletedUrl.originalUrl });
    return deletedUrl;
  }

  getStatistics() {
    const stats = {
      totalUrls: this.urls.length,
      activeUrls: this.getActiveURLs().length,
      expiredUrls: this.urls.filter(url => this.isURLExpired(url)).length,
      totalClicks: this.urls.reduce((sum, url) => sum + url.clicks, 0),
      topUrls: this.urls
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5)
        .map(url => ({
          shortCode: url.shortCode,
          originalUrl: url.originalUrl,
          clicks: url.clicks
        }))
    };

    logger.debug('Generated statistics', stats);
    return stats;
  }

  clearAllData() {
    logger.warn('Clearing all URL data');
    this.urls = [];
    this.saveURLsToStorage();
    logger.info('All URL data cleared');
  }
}

export const urlShortenerService = new URLShortenerService();