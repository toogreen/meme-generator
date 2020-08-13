import React, {Component} from "react"
import Header from "./Header"
import MemeGenerator from "./MemeGenerator"
import Footer from "./Footer"
import "./App.css"

function App() {
	return (
		<div>
			<Header />
			<MemeGenerator />
			<Footer />
		</div>
	)
}

export default App