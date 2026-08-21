import { contentPages, posts } from "./generated/content.js";
import { siteSettings } from "./generated/site-settings.js";

export const site = {
  title: siteSettings.title,
  description: siteSettings.description,
  url: siteSettings.url,
  author: siteSettings.author,
  authorUrl: siteSettings.authorUrl,
  followLabel: siteSettings.followLabel,
  sourceUrl: siteSettings.sourceUrl,
  language: "en",
  posts: [...posts],
  pages: [
    {
      path: "/",
      title: siteSettings.title,
      description: siteSettings.description,
      body: "",
      nav: false,
      tokenSummary: "Minimal article index for Lautaro Gärtner's writing about inspectable software and the agent-readable web."
    },
    ...contentPages
  ]
};
