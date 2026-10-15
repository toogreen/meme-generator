import React, {useEffect, useRef, useState} from "react"

// Searchable dropdown that shows a small thumbnail next to each meme
function MemePicker({memes, selectedUrl, onSelect, lang}) {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [activeIndex, setActiveIndex] = useState(0)
	const rootRef = useRef(null)
	const searchRef = useRef(null)
	const listRef = useRef(null)

	const selected = memes.find(meme => meme.url === selectedUrl || (selectedUrl && meme.url === selectedUrl.replace(/^http:\/\//i, "https://")))
	const filtered = memes.filter(meme => meme.name.toLowerCase().includes(query.trim().toLowerCase()))

	// Close when clicking or tapping outside the picker
	useEffect(() => {
		if (!open) return
		const handleOutside = event => {
			if (!rootRef.current.contains(event.target)) setOpen(false)
		}
		document.addEventListener("mousedown", handleOutside)
		document.addEventListener("touchstart", handleOutside)
		return () => {
			document.removeEventListener("mousedown", handleOutside)
			document.removeEventListener("touchstart", handleOutside)
		}
	}, [open])

	useEffect(() => {
		if (open) {
			setQuery("")
			setActiveIndex(0)
			searchRef.current.focus()
		}
	}, [open])

	// Keep the keyboard-highlighted item in view
	useEffect(() => {
		const item = listRef.current && listRef.current.children[activeIndex]
		if (item) item.scrollIntoView({block: "nearest"})
	}, [activeIndex])

	function choose(meme) {
		onSelect(meme.url)
		setOpen(false)
	}

	function handleKeyDown(event) {
		if (event.key === "ArrowDown") {
			event.preventDefault()
			setActiveIndex(index => Math.min(index + 1, filtered.length - 1))
		} else if (event.key === "ArrowUp") {
			event.preventDefault()
			setActiveIndex(index => Math.max(index - 1, 0))
		} else if (event.key === "Enter") {
			event.preventDefault()
			if (filtered[activeIndex]) choose(filtered[activeIndex])
		} else if (event.key === "Escape") {
			setOpen(false)
		}
	}

	return (
		<div className="picker" ref={rootRef}>
			<button
				type="button"
				className="picker-toggle"
				aria-haspopup="listbox"
				aria-expanded={open}
				onClick={() => setOpen(!open)}
			>
				{selected && <img src={selected.thumb} alt="" className="picker-thumb" />}
				{!selected && selectedUrl && selectedUrl.startsWith("data:") && (
					<img src={selectedUrl} alt="" className="picker-thumb" />
				)}
				<span className="picker-label">
					{selected 
						? selected.name 
						: (selectedUrl && selectedUrl.startsWith("data:")
							? (lang ? "Image personnalisée (locale)" : "Custom Image (local)")
							: (lang ? "CHOISIR UN MEME" : "SELECT A MEME"))}
				</span>
			</button>

			{open && (
				<div className="picker-panel">
					<input
						ref={searchRef}
						type="text"
						className="picker-search"
						value={query}
						placeholder={lang ? `Rechercher parmi ${memes.length} memes…` : `Search ${memes.length} memes…`}
						onChange={event => { setQuery(event.target.value); setActiveIndex(0) }}
						onKeyDown={handleKeyDown}
					/>

					<ul className="picker-list" role="listbox" ref={listRef}>
						{filtered.map((meme, index) => (
							<li
								key={meme.id}
								role="option"
								aria-selected={meme.url === selectedUrl}
								className={"picker-item" + (index === activeIndex ? " active" : "") + (meme.url === selectedUrl ? " selected" : "")}
								onMouseEnter={() => setActiveIndex(index)}
								onClick={() => choose(meme)}
							>
								<img src={meme.thumb} alt="" loading="lazy" className="picker-thumb" />
								<span>{meme.name}</span>
							</li>
						))}
						{filtered.length === 0 && (
							<li className="picker-empty">{lang ? "Aucun meme trouvé" : "No memes found"}</li>
						)}
					</ul>
				</div>
			)}
		</div>
	)
}

export default MemePicker
