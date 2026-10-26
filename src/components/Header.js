import React from "react"

function Header() {
	return (
		<header className="navbar">
			<img 
				src={`${process.env.PUBLIC_URL}/img/Trollface.png`} 
				alt="Problem?" 
			/>
	 		<p>Meme Generator</p>
		</header>
	)
}

export default Header