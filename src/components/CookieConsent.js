import React, {useEffect, useState} from "react"
import {getConsent, setConsent, OPEN_SETTINGS_EVENT} from "../consent"

// Shown in both languages at once: it appears before the visitor has picked one,
// and Quebec requires the French version to be at least as prominent
function CookieConsent() {
	const [open, setOpen] = useState(() => getConsent() === null)

	useEffect(() => {
		const handleOpen = () => setOpen(true)
		window.addEventListener(OPEN_SETTINGS_EVENT, handleOpen)
		return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handleOpen)
	}, [])

	function choose(value) {
		setOpen(false)
		setConsent(value)
	}

	if (!open) return null

	return (
		<div className="cookie-consent" role="dialog" aria-label="Témoins / Cookies">
			<div className="cookie-text">
				<p lang="fr">
					<strong>Témoins (cookies)</strong> — Avec votre accord, nous utilisons Google Analytics et Google AdSense,
					qui déposent des témoins pour mesurer l'audience et afficher des publicités, possiblement personnalisées.
					Vos images restent toujours sur votre appareil.
				</p>
				<p lang="en">
					<strong>Cookies</strong> — With your consent, we use Google Analytics and Google AdSense, which set cookies
					to measure traffic and show ads, possibly personalized. Your images always stay on your device.
				</p>
				<a href={process.env.PUBLIC_URL + "/privacy.html"} target="_blank" rel="noopener noreferrer">
					Politique de confidentialité / Privacy policy
				</a>
			</div>
			<div className="cookie-actions">
				<button type="button" className="cookie-button" onClick={() => choose("denied")}>Refuser / Decline</button>
				<button type="button" className="cookie-button" onClick={() => choose("granted")}>Accepter / Accept</button>
			</div>
		</div>
	)
}

export default CookieConsent
