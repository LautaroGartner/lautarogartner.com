import { contentPages, posts } from './generated/content.js';
import { siteSettings } from './generated/site-settings.js';
import { createSite } from '../site/presentation.mjs';
export const site = createSite(siteSettings, posts, contentPages);
