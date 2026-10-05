type Post = {slug:string;title:string;description:string;publishedAt:string;body:string;tokenSummary:string;topics?:readonly string[]};
type Page = {path:string;title:string;body:string;description?:string;language?:string;nav?:boolean;navLabel?:string;structuredData?:unknown;html?:string;shell?:'default'|'wide'|'full';tokenSummary?:string;seoTitle?:string;canonicalPath?:string;imagePath?:string;headerHtml?:string;footerHtml?:string;alternates?:{language:string;path:string}[]};
type Site = {title:string;description:string;url?:string;author?:string;authorUrl?:string;followLabel?:string;sourceUrl?:string;language:string;styles:string;headerHtml:string;footerHtml:string;posts:(Omit<Post,'topics'>&{topics?:string[]})[];pages:Page[]};
export function createSite(settings: Record<string, unknown>, posts: readonly Post[], pages: readonly Page[]): Site;
export function escape(value: unknown): string;
export function mailto(lang: string): string;
