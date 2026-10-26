import React from "react"
import Header from "./components/Header"
import MemeGenerator from "./components/MemeGenerator"
import Footer from "./components/Footer"
import CookieConsent from "./components/CookieConsent"
import "./App.css"

function App() {
  return (
    <div>
      <Header />
      <MemeGenerator />
      <Footer />
      <CookieConsent />
    </div>
  )
}

export default App