import React from "react"
import {openConsentSettings} from "../consent"

function Footer(){
	return (
		<footer>
			<h2>Copyrights <a href="https://toogreen.ca" target="_blank" rel="noopener noreferrer">David Gagnon</a> 2020-2026 </h2>
			<nav className="footer-links">
				<a href={process.env.PUBLIC_URL + "/privacy.html"}>Confidentialité / Privacy</a>
				<span aria-hidden="true">·</span>
				<button type="button" onClick={openConsentSettings}>Témoins / Cookies</button>
			</nav>
		</footer>
	)
}

export default Footer
