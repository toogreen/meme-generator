import React, {Component} from "react"
import Ad from "./Ad"
import $ from "jquery"
import domtoimage from "dom-to-image"
import MemePicker from "./MemePicker"
import InstallPrompt from "./InstallPrompt"
import {isSafari, isIPad13, isIPhone13} from "react-device-detect"

class MemeGenerator extends Component {

	constructor() {
		super()
		this.state = {
			topText: "",
			bottomText: "",
			randomImg: "http://i.imgflip.com/1bij.jpg",
			allMemeImgs: [],
			count: 0,
			favImage: "",
			foo: "",
			lang: false
		}
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleCopy = this.handleCopy.bind(this)
		this.handleSelect = this.handleSelect.bind(this)
	}

	componentDidMount() {
		this.setState({loading: true})

		// Each source is fetched independently so one being down doesn't break the other
		const imgflip = fetch("https://api.imgflip.com/get_memes")
			.then(response => response.json())
			.then(response => response.data.memes.map(meme => ({id: meme.id, name: meme.name, url: meme.url, thumb: meme.url.replace("i.imgflip.com/", "i.imgflip.com/2/")})))
			.catch(() => [])

		const memegen = fetch("https://api.memegen.link/templates")
			.then(response => response.json())
			.then(templates => templates.map(template => ({id: "memegen-" + template.id, name: template.name, url: template.blank, thumb: template.blank + "?width=96"})))
			.catch(() => [])

		Promise.all([imgflip, memegen]).then(([imgflipMemes, memegenMemes]) => {
			// Both sources share many classics (and memegen lists a few twice), so drop
			// duplicates by name, keeping the first one seen (imgflip wins)
			const normalize = name => name.toLowerCase().replace(/[^a-z0-9]/g, "")
			const seen = new Set()
			const memes = [...imgflipMemes, ...memegenMemes]
				.filter(meme => {
					const key = normalize(meme.name)
					if (seen.has(key)) return false
					seen.add(key)
					return true
				})
				.sort((a, b) => a.name.localeCompare(b.name))
			this.setState({ allMemeImgs: memes, loading: false })
		})
	}

	handleChange(event){
		const {name, value} = event.target
		this.setState({[name]: value})

	}

	handleSelect(url){
		this.setState({ randomImg: url })
	}

	handleSubmit(event){

		event.preventDefault()

		//get a a random number
		const randNum = Math.floor(Math.random() * this.state.allMemeImgs.length)

		// get the meme from that index
		const randMemeImg = this.state.allMemeImgs[randNum].url

		// set "randomImg" to the ".url"  of the random item I grabbed
		this.setState({ randomImg: randMemeImg})

	}

	handleCopy(event){

		event.preventDefault()

		// Copy the content of the "meme" DIV and make it an image
		const render = node =>
		  domtoimage.toPng(node)
		  .then(dataUrl => {
		    console.log(performance.now() - pf)
		    const img = new Image();
		    img.src = dataUrl;


			$('.imgZone').append(this.state.count > 0 && "<hr />").append("<h2>Image # " + this.state.count+ "</h2>")
		    $('.imgZone').append(img)
		    $('.hidden').show();

		  })
		  .catch(error =>
		    console.error('oops, something went wrong!', error)
		  ),

		foo = document.getElementById('meme');

		var pf = performance.now();
		render(foo);

		// Increment the value of count
		this.setState(prevState => {
			return {
				count: prevState.count + 1
			}
		})

		// scroll down to new image
		window.scrollTo(0,document.body.scrollHeight);
 
	}

	closeModal() {
		$('.hidden').hide();
	}

	toggleLang() {
        this.setState(prevState => ({ lang: !prevState.lang }));
    }


	render() {

		const {lang} = this.state

		return(
			<main>

				<section className="card">

					<div className="card-header">
						<div>
							<h1 className="card-title">{lang ? "Créez votre meme" : "Create your meme"}</h1>
							<p className="card-subtitle">{lang ? "Choisissez une image, ajoutez du texte, partagez." : "Pick an image, add your text, share it."}</p>
						</div>
						<button type="button" className="langButton" onClick={() => {this.toggleLang(); }} >{lang ? "EN" : "FR"}</button>
					</div>

					<div className="workspace">

						<div className="controls">
							<form className="meme-form" onSubmit={this.handleSubmit}>

								<label className="field">
									{lang ? "Texte du haut" : "Top text"}
									<input 
										type="text"
										name="topText"
										value={this.state.topText}
										placeholder={lang ? "Texte du haut" : "Top Text"} 
										onChange={this.handleChange} 
									/>
								</label>

								<label className="field">
									{lang ? "Texte du bas" : "Bottom text"}
									<input 
										type="text"
										name="bottomText"
										value={this.state.bottomText}
										placeholder={lang ? "Texte du bas" : "Bottom Text"}
										onChange={this.handleChange} 
									/>
								</label>

								<div className="field">
									{lang ? "Modèle" : "Template"}
									<MemePicker
										memes={this.state.allMemeImgs}
										selectedUrl={this.state.randomImg}
										onSelect={this.handleSelect}
										lang={lang}
									/>
								</div>

								<button type="submit" className="btn btn-secondary">🎲 {lang ? "Image aléatoire" : "Random Image"}</button>

							</form>

							<button id="buttonCopy" className="btn btn-primary" onClick={this.handleCopy}>✨ {lang ? "Générer une image pour la copier ailleurs" : "Generate an Image to copy it elsewhere"}</button>
						</div>

						<div className="preview">
							<div className="meme-frame">
								<div id="meme" className="meme"> 
									<img src={this.state.randomImg} alt="" onClick={this.handleSubmit} />
									<h2 className="top">{this.state.topText}</h2>
									<h2 className="bottom">{this.state.bottomText}</h2>
								</div>
							</div>
							<p className="hint">{lang ? "Astuce : cliquez sur l'image pour en obtenir une au hasard" : "Tip: click the image to get a random one"}</p>
						</div>

					</div>
				</section>

				<section className="hidden card">

					{/* Added this for warning users on iPad or iPhone or Safari that the image may not copy on first try - this is a bug i'm trying to figure out. */}
					{lang ? (
						<p className="warning">{(this.state.count > 0 && (isSafari || isIPad13 || isIPhone13)) && "Erreur? Cliquez de nouveau sur le bouton (c'est un bogue d'Apple)"}</p>
					) : (
						<p className="warning">{(this.state.count > 0 && (isSafari || isIPad13 || isIPhone13)) && "If it didn't work on the last click, try clicking the above button one more time (Apple Bug)"}</p>
					)
					}

					<div className="imgContainer">
						<div className="card-header">
							{lang ? (
								<h1>Copiez et collez {this.state.count > 1 ? "les " : "l'"}image{this.state.count > 1 && "s"} ci-bas</h1>
							) : (
								<h1>Copy and paste the image{this.state.count > 1 && "s"} from below</h1>
							)
							}
							<button type="button" className="close" onClick={this.closeModal} aria-label="Close">✕</button>
						</div>
						
						<span className="imgZone"></span>
					</div>
				</section>

				<Ad />

				<InstallPrompt lang={lang} />

			</main>
		)
	}

}

export default MemeGenerator