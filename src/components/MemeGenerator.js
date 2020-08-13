import React, {Component} from "react"
import Ad from "./Ad"
import $ from "jquery"
import domtoimage from "dom-to-image"

class MemeGenerator extends Component {
	constructor() {
		super()
		this.state = {
			topText: "",
			bottomTet: "",
			randomImg: "http://i.imgflip.com/1bij.jpg",
			allMemeImgs: [],
			count: 0
		}
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleCopy = this.handleCopy.bind(this)
	}

	componentDidMount() {
		this.setState({loading: true})
		fetch("https://api.imgflip.com/get_memes")
			.then(response => response.json())
			.then(response => {
				const {memes} = response.data

				this.setState({ allMemeImgs: memes })
				console.log(memes[1])

			})
	}

	handleChange(event){
		const {name, value} = event.target
		this.setState({[name]: value})

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

	handleCopy(){

		// Copy the content of the "meme" DIV and make it an image
		const render = node =>
		  domtoimage.toPng(node)
		  .then(dataUrl => {
		    console.log(performance.now() - pf)
		    const img = new Image();
		    img.src = dataUrl;

		    $('.imgZone').append(this.state.count > 1 && "<hr />").append("<h2>Your generated image # " + this.state.count+ "</h2>").append(img)
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

		// Disabled the below as I don't like popup alerts
		//const alertString = "Your image #" + (this.state.count + 1) + " was generated! Scroll down to see it below"
		//alert(alertString)

		// scroll down to new image
		window.scrollTo(0,document.body.scrollHeight);
 
	}

	closeModal() {
		$('.hidden').hide();
	}

	render() {

		return(
			<main>
				<form className="meme-form" onSubmit={this.handleSubmit}>

				<button>Change image</button>

				<input 
					type="text"
					name="topText"
					value={this.state.topText}
					placeholder="Top Text" 
					onChange={this.handleChange} 
				/>

				<br />
				
				<input 
					type="text"
					name="bottomText"
					value={this.state.bottomText}
					placeholder="Bottom Text" 
					onChange={this.handleChange} 
				/>

				<br />
					
				</form>

				<div id="meme" className="meme"> 
					<img src={this.state.randomImg} alt="" onClick={this.handleSubmit} />
					<h2 className="top">{this.state.topText}</h2>
					<h2 className="bottom">{this.state.bottomText}</h2>
				</div>

				<button id="buttonCopy" onClick={this.handleCopy}>Generate an Image to copy it elsewhere</button>


				<div className="hidden">
					<br />
					<div className="imgContainer">
						<div className="close" onClick={this.closeModal}>X</div>
						<h1>Copy and paste the image{this.state.count > 1 && "s"} below</h1>
						<span className="imgZone"></span>
					</div>
				</div>

				

				<br />
				<br />

				<Ad />

			</main>
		)
	}

}

export default MemeGenerator