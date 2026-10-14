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
			optionalText: "",
			randomImg: "http://i.imgflip.com/1bij.jpg",
			allMemeImgs: [],
			count: 0,
			favImage: "",
			foo: "",
			lang: false,
			topX: 50,
			topY: 8,
			bottomX: 50,
			bottomY: 92,
			optionalX: 50,
			optionalY: 50,
			isDragging: null,
			isDragOver: false
		}
		this.memeRef = React.createRef()
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleCopy = this.handleCopy.bind(this)
		this.handleSelect = this.handleSelect.bind(this)
		this.resetTopPosition = this.resetTopPosition.bind(this)
		this.resetBottomPosition = this.resetBottomPosition.bind(this)
		this.resetOptionalPosition = this.resetOptionalPosition.bind(this)
		this.handlePointerDown = this.handlePointerDown.bind(this)
		this.handleTouchStart = this.handleTouchStart.bind(this)
		this.handlePointerMove = this.handlePointerMove.bind(this)
		this.handleTouchMove = this.handleTouchMove.bind(this)
		this.handlePointerUp = this.handlePointerUp.bind(this)
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleImageUpload = this.handleImageUpload.bind(this)
		this.loadLocalImage = this.loadLocalImage.bind(this)
		this.handleFileDragOver = this.handleFileDragOver.bind(this)
		this.handleFileDragLeave = this.handleFileDragLeave.bind(this)
		this.handleFileDrop = this.handleFileDrop.bind(this)
		this.handleImageClick = this.handleImageClick.bind(this)
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

	componentWillUnmount() {
		window.removeEventListener("pointermove", this.handlePointerMove)
		window.removeEventListener("pointerup", this.handlePointerUp)
		window.removeEventListener("pointercancel", this.handlePointerUp)
		window.removeEventListener("touchmove", this.handleTouchMove)
		window.removeEventListener("touchend", this.handlePointerUp)
		window.removeEventListener("touchcancel", this.handlePointerUp)
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

	handleImageClick(event) {
		// If the user uploaded a custom image, don't accidentally replace it on click
		if (this.state.randomImg && this.state.randomImg.startsWith("data:")) {
			return
		}
		this.handleSubmit(event)
	}

	handleImageUpload(event) {
		const file = event.target.files && event.target.files[0]
		if (file) {
			this.loadLocalImage(file)
		}
		// Reset input value so the same file can be re-selected if desired
		event.target.value = ""
	}

	loadLocalImage(file) {
		if (!file.type || !file.type.match(/^image\//)) {
			alert(this.state.lang ? "Veuillez sélectionner un fichier image valide." : "Please select a valid image file.")
			return
		}

		// Read purely client-side into base64 data URL (never uploaded to any server)
		const reader = new FileReader()
		reader.onload = e => {
			if (e.target && e.target.result) {
				this.setState({ randomImg: e.target.result })
			}
		}
		reader.readAsDataURL(file)
	}

	handleFileDragOver(event) {
		event.preventDefault()
		event.stopPropagation()
		if (!this.state.isDragOver) {
			this.setState({ isDragOver: true })
		}
	}

	handleFileDragLeave(event) {
		event.preventDefault()
		event.stopPropagation()
		this.setState({ isDragOver: false })
	}

	handleFileDrop(event) {
		event.preventDefault()
		event.stopPropagation()
		this.setState({ isDragOver: false })
		const dataTransfer = event.dataTransfer || (event.nativeEvent && event.nativeEvent.dataTransfer)
		const file = dataTransfer && dataTransfer.files && dataTransfer.files[0]
		if (file) {
			this.loadLocalImage(file)
		}
	}

	resetTopPosition() {
		this.setState({ topX: 50, topY: 8 })
	}

	resetBottomPosition() {
		this.setState({ bottomX: 50, bottomY: 92 })
	}

	resetOptionalPosition() {
		this.setState({ optionalX: 50, optionalY: 50 })
	}

	startDrag(target, clientX, clientY, currentTarget) {
		const initX = this.state[target + "X"]
		const initY = this.state[target + "Y"]

		const memeEl = this.memeRef.current
		let halfW = 0
		let halfH = 0
		if (memeEl && currentTarget) {
			const memeRect = memeEl.getBoundingClientRect()
			const textRect = currentTarget.getBoundingClientRect()
			if (memeRect.width > 0 && memeRect.height > 0) {
				halfW = (textRect.width / (2 * memeRect.width)) * 100
				halfH = (textRect.height / (2 * memeRect.height)) * 100
			}
		}

		this.dragInfo = {
			target,
			startX: clientX,
			startY: clientY,
			initX,
			initY,
			halfW,
			halfH
		}

		window.addEventListener("pointermove", this.handlePointerMove)
		window.addEventListener("pointerup", this.handlePointerUp)
		window.addEventListener("pointercancel", this.handlePointerUp)
		window.addEventListener("touchmove", this.handleTouchMove, { passive: false })
		window.addEventListener("touchend", this.handlePointerUp)
		window.addEventListener("touchcancel", this.handlePointerUp)

		this.setState({ isDragging: target })
	}

	handlePointerDown(target, event) {
		if (event.button !== undefined && event.button !== 0) return

		event.preventDefault()
		event.stopPropagation()

		try {
			if (event.currentTarget && event.currentTarget.setPointerCapture && event.pointerId !== undefined) {
				event.currentTarget.setPointerCapture(event.pointerId)
			}
		} catch (err) {}

		const clientX = typeof event.clientX === "number" ? event.clientX : (event.nativeEvent && typeof event.nativeEvent.clientX === "number" ? event.nativeEvent.clientX : 0)
		const clientY = typeof event.clientY === "number" ? event.clientY : (event.nativeEvent && typeof event.nativeEvent.clientY === "number" ? event.nativeEvent.clientY : 0)

		this.startDrag(target, clientX, clientY, event.currentTarget)
	}

	handleTouchStart(target, event) {
		if (this.dragInfo) return
		if (!event.touches || event.touches.length === 0) return
		event.stopPropagation()
		const touch = event.touches[0]
		this.startDrag(target, touch.clientX, touch.clientY, event.currentTarget)
	}

	handlePointerMove(event) {
		if (!this.dragInfo) return
		const clientX = typeof event.clientX === "number" ? event.clientX : (event.nativeEvent && typeof event.nativeEvent.clientX === "number" ? event.nativeEvent.clientX : 0)
		const clientY = typeof event.clientY === "number" ? event.clientY : (event.nativeEvent && typeof event.nativeEvent.clientY === "number" ? event.nativeEvent.clientY : 0)
		this.updatePosition(clientX, clientY)
	}

	handleTouchMove(event) {
		if (!this.dragInfo) return
		if (event.cancelable) event.preventDefault()
		if (event.touches && event.touches[0]) {
			this.updatePosition(event.touches[0].clientX, event.touches[0].clientY)
		}
	}

	updatePosition(clientX, clientY) {
		if (!this.dragInfo) return
		const { target, startX, startY, initX, initY, halfW, halfH } = this.dragInfo
		const memeEl = this.memeRef.current
		if (!memeEl) return

		const rect = memeEl.getBoundingClientRect()
		if (rect.width <= 0 || rect.height <= 0) return

		const deltaX = ((clientX - startX) / rect.width) * 100
		const deltaY = ((clientY - startY) / rect.height) * 100

		if (isNaN(deltaX) || isNaN(deltaY)) return

		const minX = Math.min(50, Math.max(2, halfW || 0))
		const maxX = Math.max(50, Math.min(98, 100 - (halfW || 0)))
		const minY = Math.min(50, Math.max(2, halfH || 0))
		const maxY = Math.max(50, Math.min(98, 100 - (halfH || 0)))

		const newX = Math.round(Math.min(Math.max(initX + deltaX, minX), maxX))
		const newY = Math.round(Math.min(Math.max(initY + deltaY, minY), maxY))

		this.setState({
			[target + "X"]: newX,
			[target + "Y"]: newY
		})
	}

	handlePointerUp() {
		if (!this.dragInfo) return

		window.removeEventListener("pointermove", this.handlePointerMove)
		window.removeEventListener("pointerup", this.handlePointerUp)
		window.removeEventListener("pointercancel", this.handlePointerUp)
		window.removeEventListener("touchmove", this.handleTouchMove)
		window.removeEventListener("touchend", this.handlePointerUp)
		window.removeEventListener("touchcancel", this.handlePointerUp)

		this.dragInfo = null
		this.setState({ isDragging: null })
	}

	handleKeyDown(target, event) {
		const step = event.shiftKey ? 5 : 2
		let dx = 0
		let dy = 0

		if (event.key === "ArrowUp") dy = -step
		else if (event.key === "ArrowDown") dy = step
		else if (event.key === "ArrowLeft") dx = -step
		else if (event.key === "ArrowRight") dx = step
		else return

		event.preventDefault()
		event.stopPropagation()

		this.setState(prev => ({
			[target + "X"]: Math.round(Math.min(Math.max(prev[target + "X"] + dx, 2), 98)),
			[target + "Y"]: Math.round(Math.min(Math.max(prev[target + "Y"] + dy, 2), 98))
		}))
	}

	handleCopy(event){

		event.preventDefault()

		const node = this.memeRef.current || document.getElementById('meme');
		if (node) node.classList.add('generating');

		// Copy the content of the "meme" DIV and make it an image
		const render = targetNode =>
		  domtoimage.toPng(targetNode)
		  .then(dataUrl => {
		    if (targetNode) targetNode.classList.remove('generating');
		    console.log(performance.now() - pf)
		    const img = new Image();
		    img.src = dataUrl;


			$('.imgZone').append(this.state.count > 0 && "<hr />").append("<h2>Image # " + this.state.count+ "</h2>")
		    $('.imgZone').append(img)
		    $('.hidden').show();

		  })
		  .catch(error => {
		    if (targetNode) targetNode.classList.remove('generating');
		    console.error('oops, something went wrong!', error);
		  });

		var pf = performance.now();
		render(node);

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

								<div className="field">
									<div className="field-header">
										<span>{lang ? "Texte du haut" : "Top text"}</span>
										{(this.state.topX !== 50 || this.state.topY !== 8) && (
											<button
												type="button"
												className="btn-reset-pos"
												onClick={this.resetTopPosition}
												title={lang ? "Réinitialiser la position" : "Reset position"}
											>
												↺ {lang ? "Réinitialiser" : "Reset"}
											</button>
										)}
									</div>
									<input 
										type="text"
										name="topText"
										value={this.state.topText}
										placeholder={lang ? "Texte du haut" : "Top Text"} 
										onChange={this.handleChange} 
									/>
								</div>

								<div className="field">
									<div className="field-header">
										<span>{lang ? "Texte du bas" : "Bottom text"}</span>
										{(this.state.bottomX !== 50 || this.state.bottomY !== 92) && (
											<button
												type="button"
												className="btn-reset-pos"
												onClick={this.resetBottomPosition}
												title={lang ? "Réinitialiser la position" : "Reset position"}
											>
												↺ {lang ? "Réinitialiser" : "Reset"}
											</button>
										)}
									</div>
									<input 
										type="text"
										name="bottomText"
										value={this.state.bottomText}
										placeholder={lang ? "Texte du bas" : "Bottom Text"}
										onChange={this.handleChange} 
									/>
								</div>

								<div className="field">
									<div className="field-header">
										<span>{lang ? "Texte optionnel" : "Optional text"}</span>
										{(this.state.optionalX !== 50 || this.state.optionalY !== 50) && (
											<button
												type="button"
												className="btn-reset-pos"
												onClick={this.resetOptionalPosition}
												title={lang ? "Réinitialiser la position" : "Reset position"}
											>
												↺ {lang ? "Réinitialiser" : "Reset"}
											</button>
										)}
									</div>
									<input 
										type="text"
										name="optionalText"
										value={this.state.optionalText}
										placeholder={lang ? "Texte optionnel" : "Optional Text"}
										onChange={this.handleChange} 
									/>
								</div>

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

								<label className="btn btn-secondary upload-btn">
									📁 {lang ? "Téléverser votre propre image" : "Upload your own image"}
									<input 
										type="file" 
										accept="image/*" 
										onChange={this.handleImageUpload} 
										style={{ display: "none" }} 
										aria-label={lang ? "Téléverser une image locale" : "Upload local image"}
									/>
								</label>
								<p className="privacy-note">
									🔒 {lang ? "Votre image reste 100 % locale sur votre appareil" : "Your image stays 100% local on your device"}
								</p>

							</form>

							<button id="buttonCopy" className="btn btn-primary" onClick={this.handleCopy}>✨ {lang ? "Générer une image pour la copier ailleurs" : "Generate an Image to copy it elsewhere"}</button>
						</div>

						<div className="preview">
							<div className="meme-frame">
								<div 
									id="meme" 
									className={`meme ${this.state.isDragOver ? "drag-over" : ""}`} 
									ref={this.memeRef}
									onDragOver={this.handleFileDragOver}
									onDragLeave={this.handleFileDragLeave}
									onDrop={this.handleFileDrop}
								> 
									{this.state.isDragOver && (
										<div className="drop-overlay">
											<span style={{ fontSize: "2.2rem" }}>📥</span>
											<span>{lang ? "Déposez votre image ici" : "Drop your image here"}</span>
										</div>
									)}
									<img 
										src={this.state.randomImg} 
										alt="" 
										onClick={this.handleImageClick}
										draggable={false} 
									/>
									<h2 
										className={`top ${this.state.isDragging === "top" ? "dragging" : ""}`}
										style={{
											left: `${this.state.topX}%`,
											top: `${this.state.topY}%`,
											transform: "translate(-50%, -50%)"
										}}
										onPointerDown={e => this.handlePointerDown("top", e)}
										onTouchStart={e => this.handleTouchStart("top", e)}
										onKeyDown={e => this.handleKeyDown("top", e)}
										tabIndex={this.state.topText ? 0 : -1}
										role="button"
										aria-label={lang ? "Texte du haut déplaçable" : "Draggable top text"}
										title={lang ? "Cliquez et glissez pour déplacer le texte" : "Click and drag to move text"}
									>
										{this.state.topText}
									</h2>
									<h2 
										className={`middle ${this.state.isDragging === "optional" ? "dragging" : ""}`}
										style={{
											left: `${this.state.optionalX}%`,
											top: `${this.state.optionalY}%`,
											transform: "translate(-50%, -50%)"
										}}
										onPointerDown={e => this.handlePointerDown("optional", e)}
										onTouchStart={e => this.handleTouchStart("optional", e)}
										onKeyDown={e => this.handleKeyDown("optional", e)}
										tabIndex={this.state.optionalText ? 0 : -1}
										role="button"
										aria-label={lang ? "Texte optionnel déplaçable" : "Draggable optional text"}
										title={lang ? "Cliquez et glissez pour déplacer le texte" : "Click and drag to move text"}
									>
										{this.state.optionalText}
									</h2>
									<h2 
										className={`bottom ${this.state.isDragging === "bottom" ? "dragging" : ""}`}
										style={{
											left: `${this.state.bottomX}%`,
											top: `${this.state.bottomY}%`,
											transform: "translate(-50%, -50%)"
										}}
										onPointerDown={e => this.handlePointerDown("bottom", e)}
										onTouchStart={e => this.handleTouchStart("bottom", e)}
										onKeyDown={e => this.handleKeyDown("bottom", e)}
										tabIndex={this.state.bottomText ? 0 : -1}
										role="button"
										aria-label={lang ? "Texte du bas déplaçable" : "Draggable bottom text"}
										title={lang ? "Cliquez et glissez pour déplacer le texte" : "Click and drag to move text"}
									>
										{this.state.bottomText}
									</h2>
								</div>
							</div>
							<p className="hint">
								{lang 
									? "Astuce : déplacez le texte avec la souris ou le doigt • Déposez votre propre image ou cliquez pour changer" 
									: "Tip: drag text with mouse or finger • Drop your own image or click to randomize"}
							</p>
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