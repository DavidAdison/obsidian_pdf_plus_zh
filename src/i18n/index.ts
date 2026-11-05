import uiZhCN from './ui-zh-cn.json';
import zhCN from './zh-cn.json';
import { moment } from 'obsidian';

type TranslationParams = Record<string, string | number>;
type TranslationDict = Record<string, string>;

const translations: Record<string, TranslationDict> = { 'zh-cn': zhCN };
let currentLocale = detectLocale();

function detectLocale(): string {
	const locale = moment.locale().toLowerCase();
	if (locale.startsWith('zh')) return 'zh-cn';
	if (locale.startsWith('ja')) return 'ja';
	if (locale.startsWith('ko')) return 'ko';
	return locale;
}

export function initI18n(): void {
	currentLocale = detectLocale();
}

export function registerTranslation(locale: string, dict: TranslationDict): void {
	translations[locale] = dict;
}

export function t(key: string, fallback?: string | readonly string[], params?: TranslationParams): string {
	const dict = translations[currentLocale];
	let text: string | undefined;

	if (dict) {
		text = dict[key];
	}

	if (text === undefined) {
		text = Array.isArray(fallback) ? fallback.join('\n') : (fallback as string | undefined) ?? key;
	}

	if (params) {
		for (const [k, v] of Object.entries(params)) {
			text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), () => String(v));
		}
	}

	return text;
}

export function tn(key: string, fallback: string, count: number, params?: TranslationParams): string {
	const actualKey = count === 1 ? `${key}_one` : `${key}_other`;
	return t(actualKey, fallback, { count, ...params });
}

export { currentLocale };

/** Translate exact plugin-owned UI labels at presentation time. Never rewrite stored templates. */
export function ui(text: string, params?: Record<string, unknown>): string {
	const dict: TranslationDict = currentLocale === 'zh-cn' ? uiZhCN : {};
	let result = dict[text] ?? text;
	if (params) {
		result = result.replace(/\{([A-Za-z_][\w]*|\d+)\}/g, (match, key: string) =>
			Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match);
	}
	return result;
}

/** Only localize an unmodified built-in name/template pair; preserve user-created labels. */
export function templateName(template: { name: string; template: string }, defaults: readonly { name: string; template: string }[]): string {
	return defaults.some(item => item.name === template.name && item.template === template.template)
		? ui(template.name) : template.name;
}

/** Preserve custom color names; localize only a built-in color with its original RGB value. */
export function colorName(name: string, colors: Record<string, string>, defaults: Record<string, string>): string {
	const entry = Object.entries(defaults).find(([key, value]) =>
		key.toLowerCase() === name.toLowerCase() && value.toLowerCase() === colors[name]?.toLowerCase());
	return entry ? ui(entry[0]) : name;
}
