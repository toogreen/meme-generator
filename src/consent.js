// Cookie consent (Quebec Law 25): Google Analytics and AdSense stay off until
// the visitor explicitly accepts. The choice is stored locally and re-asked
// after CONSENT_MAX_AGE so it doesn't live forever.

const CONSENT_KEY = "cookieConsent"
const CONSENT_MAX_AGE = 1000 * 60 * 60 * 24 * 395 // ~13 months
const GA_ID = "G-XYLQP27RQQ"
const ADSENSE_CLIENT = "ca-pub-7401520800104068"

export const OPEN_SETTINGS_EVENT = "open-cookie-settings"

// Returns "granted", "denied", or null when the visitor hasn't chosen yet
export function getConsent() {
	try {
		const stored = JSON.parse(localStorage.getItem(CONSENT_KEY))
		if (!stored || Date.now() - stored.date > CONSENT_MAX_AGE) return null
		return stored.value === "granted" || stored.value === "denied" ? stored.value : null
	} catch (e) {
		return null
	}
}

export function setConsent(value) {
	const previous = getConsent()
	localStorage.setItem(CONSENT_KEY, JSON.stringify({value, date: Date.now()}))

	if (value === "granted") {
		loadTrackers()
	} else if (previous === "granted") {
		// Scripts that already ran can't be unloaded: clear their cookies and reload without them
		clearGoogleCookies()
		window.location.reload()
	}
}

export function openConsentSettings() {
	window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))
}

function addScript(src, attributes = {}) {
	const script = document.createElement("script")
	script.async = true
	script.src = src
	Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value))
	document.head.appendChild(script)
}

export function loadTrackers() {
	if (window.__trackersLoaded) return
	window.__trackersLoaded = true

	// Google tag (gtag.js)
	addScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
	window.dataLayer = window.dataLayer || []
	window.gtag = function gtag() { window.dataLayer.push(arguments) }
	window.gtag("js", new Date())
	window.gtag("config", GA_ID)

	// AdSense
	addScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`, {crossorigin: "anonymous"})
}

function clearGoogleCookies() {
	const hostParts = window.location.hostname.split(".")
	// Cookies may be set on the bare domain or any parent domain, so try each
	const domains = hostParts.map((_, i) => hostParts.slice(i).join(".")).filter(d => d.includes("."))

	document.cookie.split(";").forEach(cookie => {
		const name = cookie.split("=")[0].trim()
		if (!/^(_ga|_gid|_gat|__gads|__gpi|__eoi)/.test(name)) return
		const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
		document.cookie = expired
		domains.forEach(domain => { document.cookie = `${expired}; domain=.${domain}` })
	})
}
