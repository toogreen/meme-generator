import React, {useEffect, useState} from "react"
import {isMobile, isIOS, isIPad13} from "react-device-detect"

const DISMISS_KEY = "installPromptDismissed"

function isStandalone() {
	return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
}

function InstallPrompt({lang}) {
	const [deferredPrompt, setDeferredPrompt] = useState(null)
	const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1")

	// iOS has no install prompt, so we show "Add to Home Screen" instructions instead
	const showIOSHelp = (isIOS || isIPad13) && !isStandalone()

	useEffect(() => {
		// Android / Chrome: hold on to the native prompt so our button can trigger it
		const handleBeforeInstall = event => {
			event.preventDefault()
			setDeferredPrompt(event)
		}
		const handleInstalled = () => setDeferredPrompt(null)

		window.addEventListener("beforeinstallprompt", handleBeforeInstall)
		window.addEventListener("appinstalled", handleInstalled)
		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
			window.removeEventListener("appinstalled", handleInstalled)
		}
	}, [])

	function handleInstall() {
		deferredPrompt.prompt()
		deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
	}

	function handleDismiss() {
		localStorage.setItem(DISMISS_KEY, "1")
		setDismissed(true)
	}

	if (dismissed || !(isMobile || isIPad13) || !(deferredPrompt || showIOSHelp)) return null

	return (
		<div className="install-prompt" role="dialog" aria-label={lang ? "Installer l'application" : "Install the app"}>
			<img src={process.env.PUBLIC_URL + "/apple-touch-icon.png"} alt="" className="install-icon" />

			<div className="install-text">
				<strong>{lang ? "Installer l'application" : "Install the app"}</strong>
				{deferredPrompt ? (
					<span>{lang ? "Ajoutez-la à votre écran d'accueil pour un accès rapide." : "Add it to your home screen for quick access."}</span>
				) : (
					<span>
						{lang ? "Touchez " : "Tap "}
						<span className="install-share" aria-label="Share">
							<svg width="14" height="16" viewBox="0 0 14 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1v11M3 5l4-4 4 4M1 9v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9" /></svg>
						</span>
						{lang ? " puis « Sur l'écran d'accueil »" : " then “Add to Home Screen”"}
					</span>
				)}
			</div>

			{deferredPrompt && (
				<button type="button" className="install-button" onClick={handleInstall}>{lang ? "Installer" : "Install"}</button>
			)}
			<button type="button" className="install-dismiss" onClick={handleDismiss} aria-label={lang ? "Fermer" : "Dismiss"}>✕</button>
		</div>
	)
}

export default InstallPrompt
