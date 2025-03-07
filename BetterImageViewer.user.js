// @ts-check
// ==UserScript==
// @name        Discord Better Image Viewer
// @namespace   https://github.com/Legend-Master
// @version     1.6
// @author      Tony
// @icon        data:image/webp;base64,UklGRkgEAABXRUJQVlA4WAoAAAAQAAAAPwAAPwAAQUxQSNgBAAABkBttf5x4n7A64GjBQxVUchVAvnQAEetGNt3/kUNMhnvYM8NjWfpmLA5bHwVEhCO3bSTJzuKu7plTLUk9AR1oLFpOF8X/8uMSwuWj/F/Mp2hpDR6yqzKz/aniA1an/cwkEa2abEqS9I0PISIE33iSPL+MAdsPmcFw90t658OjELzz5O92CJP1G11/kc6zI70jv9Y9Bk2G/EjWgT0YavKQIzOdMABW7kb1FG4FDLp5QTomoCNfW+vib2w8k9A3fGvtsb+zZjLWfH9kptXRE1qU5h4yFNHTWoHs7nxbsWFiNlzB3tG5o08NT5ffSoMDHZPT8QhzM7ZmTQFrrmGv9PCLQYHAryFMzNuYNWkH24rJb8ya9DuBsdjQUUTHTUxnehU8SwPMoutsBuzpdHDcAydtOGFaMegQWE3nMSvTomCjRMPivzr8LxmUCCw/1PioKGYV1Ah6yB8u+k/0f6Sft/p1s1CHuX7fkO9b+n3zCfZt8blxNhCfWy+w4nNzjJh2unN7C6uvG56gbkGUR03ddIDR123yulFet+rrZnndLu8bpH1LAQzkfVPnvu2Qom875siMum/s2bdu+/Wtu3t9a4/B8ebcuW/eTAD7dH17j3uD+f17g0X3ewMAVlA4IEoCAACwDgCdASpAAEAAPpE2mUgloqKhLBqsALASCWwAxRHafqutG9jvN7hLjr8YdTzxMP0r3gG6Af2D/AdYB6AHls+x/+4NdmkTqwGtr3xA8IEpMmdcb/HoTI9ljnld2lkv6bDaLgUfTJtXeD7xsfhzMmrjaq2CjxNQR8vlRcq/1gAA/vBCf/8ID/+DN//8EPvnKiXB2s35zA3/KS9/E7Mx/0bAoL0AY/9uszh2TIa1P+dYln5DaQVCLEFoJoq23HQ7a9OPW7+twdNI4dJFjv8vEBe3IvGozGhKQq3WekqoxaajZkvR53VPqyYyMcia0701hXjIfsweD9r+rcXe+CwCHpr/bnzdhk9t74KBMyR+Gr15LZtHzJUArub03h8//nxhVy7sgOCIytDJ9wQse3m6t6ce+xi8ulPhSzIzMXLM8wm6eJq4ZknsERBsECQ0EuzO43NY1OQfzp92XwU/Mor8ov6VRkyLX8NIDPhb08wqgdfIs7x67TT5OwjllIoFMzQENS7ntyRVJ9Lt8WgD04Ow6EHksa3gxcLhtBldHWJ/+VTK5hZ5JEXZs+sNdNCOBFQnJZJWKBpe8cfQR//HnMc8SpB9fW5nm1r9DEXEsffFFIP6FYbJRoUcx8Eh4QUvY8MWLGCA9UM3BFgHMDP8RMBhdHAKzBI1DW4e68oX+ln0+c4viNnk+AuG9PqbWeYTvptfOdORJqvYPA5qAt0PFc2/6KfGgTyjnN/zsYM5NqJpDfVjsI5BGvOR3aJ5vRegbWbxb7qsz5G6VXth0IAA
// @homepage    https://github.com/Legend-Master/discord-better-image-viewer
// @downloadURL https://github.com/Legend-Master/discord-better-image-viewer/raw/main/BetterImageViewer.user.js
// @updateURL   https://github.com/Legend-Master/discord-better-image-viewer/raw/main/BetterImageViewer.user.js
// @supportURL  https://github.com/Legend-Master/discord-better-image-viewer/issues
// @match       https://discord.com/*
// @grant       none
// ==/UserScript==

const SCALE_FACTOR = 1.2
const KEY_MOVE_STEP_PX = 100
const TRANSITION_DURATION_MS = 150

/**
 * @param {number} num
 * @param {number} min
 * @param {number} max
 */
function clamp(num, min, max) {
	// if (min > max) {
	// 	const temp = min
	// 	min = max
	// 	max = temp
	// }
	return Math.min(max, Math.max(min, num))
}

class SimleImageViewer {
	scale = 1
	deltaX = 0
	deltaY = 0
	moved = false

	/**
	 * @type {MutationObserver}
	 */
	imageObserver

	// originalImageWidth = 0
	// originalImageHeigth = 0

	/**
	 * @type {HTMLImageElement}
	 */
	image
	/**
	 * @type {HTMLDivElement}
	 */
	imageWrapper
	/**
	 * @type {HTMLDivElement}
	 */
	backdrop

	/**
	 * @param {HTMLImageElement} image
	 * @param {HTMLDivElement} imageWrapper
	 * @param {HTMLDivElement} backdrop
	 */
	constructor(image, imageWrapper, backdrop) {
		this.image = image
		this.imageWrapper = imageWrapper
		this.backdrop = backdrop

		this.updateInitalImage()

		// document.body.style.overflow = 'hidden'
		// document.body.style.cursor = 'move'
		this.imageWrapper.style.cursor = 'move'

		this.initialTransition = image.style.transition
		this.transitionStyles = [
			`scale ${TRANSITION_DURATION_MS}ms`,
			`translate ${TRANSITION_DURATION_MS}ms`,
		]
		this.initialTransition && this.transitionStyles.push(this.initialTransition)

		this.applyBasicImageStyle()
		// Do it again on loaded since Chrome will override it on image finishes loading
		// https://source.chromium.org/chromium/chromium/src/+/refs/heads/main:third_party/blink/renderer/core/html/image_document.cc;drc=255b4e7036f1326f2219bd547d3d6dcf76064870;l=404
		// image.addEventListener('load', updateAllImageStyles)

		// window.addEventListener('resize', updateAllImageStyles)

		document.addEventListener('mousedown', this.onMouseDown)
		document.addEventListener('keydown', this.onKeyDown)
		document.addEventListener('wheel', this.onWheel, { passive: false })
		this.imageWrapper.addEventListener('click', this.onClick)
		this.image.addEventListener('load', this.updateInitalImage)

		// Can get swapped to another image
		this.imageObserver = new MutationObserver((records) => {
			for (const record of records) {
				for (const node of record.addedNodes) {
					if (node instanceof HTMLImageElement) {
						this.updateInitalImage()
						return
					}
				}
			}
		})
		this.imageObserver.observe(this.imageWrapper, { childList: true, subtree: true })
	}

	exit() {
		// document.body.style.overflow = ''
		// document.body.style.cursor = ''
		this.imageWrapper.style.cursor = ''

		document.removeEventListener('mousedown', this.onMouseDown)
		document.removeEventListener('keydown', this.onKeyDown)
		document.removeEventListener('wheel', this.onWheel)
		this.imageWrapper.removeEventListener('click', this.onClick)
		this.image.removeEventListener('load', this.updateInitalImage)
		this.imageObserver.disconnect()
	}

	/**
	 * @param {MouseEvent} ev
	 */
	onClick = (ev) => {
		if (!this.moved) {
			this.closeImage()
		}
		ev.stopImmediatePropagation()
	}

	closeImage() {
		this.backdrop.click()
	}

	updateInitalImage = () => {
		// Can get swapped to another image
		if (!document.contains(this.image)) {
			this.image.removeEventListener('load', this.updateInitalImage)
			const image = this.imageWrapper.querySelector('img')
			if (!image) {
				alert('nope')
				return
			}
			this.image = image
			this.image.addEventListener('load', this.updateInitalImage)
		}

		const url = new URL(this.image.src)
		url.searchParams.delete('width')
		url.searchParams.delete('height')
		const urlString = url.toString()
		if (urlString !== this.image.src) {
			this.image.src = urlString
		}

		this.image.style.position = 'unset'
		this.image.style.top = 'unset'
		this.image.style.left = 'unset'
		this.image.style.width = 'unset'
		this.image.style.height = 'unset'
		this.image.style.maxWidth = '90vw'
		this.image.style.maxHeight = '90vh'

		// const { width, height } = this.image.getBoundingClientRect()
		// this.originalImageWidth = width
		// this.originalImageHeigth = height

		// alert(`${this.image.width}, ${this.image.height}`)
		// this.image.width = Math.min(this.image.width, this.wrapperWidth)
		// this.image.height = Math.min(this.image.height, this.wrapperHeight)
	}

	get wrapperWidth() {
		return this.imageWrapper.clientWidth
	}

	get wrapperHeight() {
		return this.imageWrapper.clientHeight
	}

	/**
	 * @param {MouseEvent} ev
	 */
	onMouseMove = (ev) => {
		if (this.scale === 1) {
			return
		}
		if (ev.movementX === 0 && ev.movementY === 0) {
			return
		}
		this.moved = true
		this.move(ev.movementX, ev.movementY)
	}

	/**
	 * @param {MouseEvent} ev
	 */
	onMouseDown = (ev) => {
		this.moved = false
		document.addEventListener('mousemove', this.onMouseMove)
		document.addEventListener(
			'mouseup',
			(ev) => {
				ev.stopImmediatePropagation()
				document.removeEventListener('mousemove', this.onMouseMove)
			},
			{ once: true, capture: true }
		)
		ev.preventDefault()
	}

	/**
	 * @param {KeyboardEvent} ev
	 */
	onKeyDown = (ev) => {
		if (ev.key === 'ArrowUp') {
			this.move(0, KEY_MOVE_STEP_PX)
		} else if (ev.key === 'ArrowDown') {
			this.move(0, -KEY_MOVE_STEP_PX)
		} else if (ev.key === 'ArrowLeft') {
			this.move(KEY_MOVE_STEP_PX, 0)
		} else if (ev.key === 'ArrowRight') {
			this.move(-KEY_MOVE_STEP_PX, 0)
		}
	}

	/**
	 * @param {WheelEvent} ev
	 */
	onWheel = (ev) => {
		// scale -= (ev.deltaX || ev.deltaY || ev.deltaZ) / 100
		const delta = ev.deltaX || ev.deltaY || ev.deltaZ
		if (delta === 0) {
			return
		}
		const isZoomIn = delta < 0
		let targetScale = this.scale
		if (isZoomIn) {
			targetScale *= SCALE_FACTOR
		} else {
			targetScale /= SCALE_FACTOR
		}
		if (targetScale <= 1) {
			this.scale = 1
			this.deltaX = 0
			this.deltaY = 0
		} else {
			const initialSize = this.getImageSize()
			const width = initialSize.width * this.scale
			const height = initialSize.height * this.scale
			// Hard coded width height 90%
			const left = (this.wrapperWidth - width) / 2 + this.deltaX + innerWidth * 0.05
			const right = (this.wrapperWidth + width) / 2 + this.deltaX + innerWidth * 0.05
			const top = (this.wrapperHeight - height) / 2 + this.deltaY + innerHeight * 0.05
			const bottom = (this.wrapperHeight + height) / 2 + this.deltaY + innerHeight * 0.05
			const centerX = left + width / 2
			const centerY = top + height / 2
			const deltaScale = targetScale - this.scale
			// const dx = ((centerX - clamp(ev.clientX, left, right)) / scale) * deltaScale
			// const dy = ((centerY - clamp(ev.clientY, top, bottom)) / scale) * deltaScale
			const isCursorOutSide =
				ev.clientX < left || ev.clientX > right || ev.clientY < top || ev.clientY > bottom
			const dx = isCursorOutSide
				? 0
				: ((centerX - clamp(ev.clientX, left, right)) / this.scale) * deltaScale
			const dy = isCursorOutSide
				? 0
				: ((centerY - clamp(ev.clientY, top, bottom)) / this.scale) * deltaScale
			if (isZoomIn) {
				this.deltaX += dx
				this.deltaY += dy
			} else {
				// Interpolate delta = 0 on scale = 1 to delta = current delta on scale = current scale
				const minDeltaX = this.deltaX * ((targetScale - 1) / (this.scale - 1))
				const minDeltaY = this.deltaY * ((targetScale - 1) / (this.scale - 1))
				this.deltaX += dx
				this.deltaY += dy
				if (this.deltaX > 0) {
					this.deltaX = Math.min(this.deltaX, minDeltaX)
				} else {
					this.deltaX = Math.max(this.deltaX, minDeltaX)
				}
				if (this.deltaY > 0) {
					this.deltaY = Math.min(this.deltaY, minDeltaY)
				} else {
					this.deltaY = Math.max(this.deltaY, minDeltaY)
				}
			}
			this.scale = targetScale
		}
		this.updateImageStyle()
		this.addImageTransitionStyle(true)
		ev.preventDefault()
	}

	applyBasicImageStyle() {
		this.image.style.cursor = 'move'
	}

	updateImageStyle() {
		this.image.style.scale = String(this.scale)
		this.image.style.translate = `${this.deltaX}px ${this.deltaY}px`
		// this.imageWrapper.style.scale = String(this.scale)
		// this.imageWrapper.style.translate = `${this.deltaX}px ${this.deltaY}px`
	}

	/**
	 * @param {boolean} enableTransitions
	 */
	addImageTransitionStyle(enableTransitions) {
		this.image.style.transition = enableTransitions
			? this.transitionStyles.join(',')
			: this.initialTransition
	}

	updateAllImageStyles() {
		this.applyBasicImageStyle()
		this.updateImageStyle()
		// Shouldn't need to do it here since we'll add it on zooming only
		// addImageTransitionStyle()
	}

	getImageSize() {
		// let width
		// let height
		// if (this.image instanceof SVGElement) {
		// 	width = Number(this.image.getAttribute('width'))
		// 	height = Number(this.image.getAttribute('height'))
		// 	const aspectRatio = width / height
		// 	const widthFitScale = width / this.wrapperWidth
		// 	const heightFitScale = height / this.wrapperHeight
		// 	if (widthFitScale > heightFitScale) {
		// 		if (widthFitScale > 1) {
		// 			width = this.wrapperWidth
		// 			height = width / aspectRatio
		// 		}
		// 	} else {
		// 		if (heightFitScale > 1) {
		// 			height = this.wrapperHeight
		// 			width = height * aspectRatio
		// 		}
		// 	}
		// } else {
		// 	width = this.image.width
		// 	height = this.image.height
		// }
		// return { width, height }
		return {
			// width: this.originalImageWidth,
			// height: this.originalImageHeigth,
			width: this.image.width,
			height: this.image.height,
		}
	}

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	move(dx, dy) {
		const { width, height } = this.getImageSize()
		const deltaWidth = Math.max((width * this.scale - this.wrapperWidth) / 2, 0)
		const deltaHeight = Math.max((height * this.scale - this.wrapperHeight) / 2, 0)
		const maxDeltaX = Math.max(deltaWidth, this.deltaX)
		const minDeltaX = Math.min(-deltaWidth, this.deltaX)
		const maxDeltaY = Math.max(deltaHeight, this.deltaY)
		const minDeltaY = Math.min(-deltaHeight, this.deltaY)
		this.deltaX += dx
		this.deltaY += dy
		this.deltaX = clamp(this.deltaX, minDeltaX, maxDeltaX)
		this.deltaY = clamp(this.deltaY, minDeltaY, maxDeltaY)
		this.updateImageStyle()
		this.addImageTransitionStyle(false)
	}
}

/** @type {SimleImageViewer | undefined} */
let imageViewer
/** @type {HTMLDivElement | undefined} */
let imageWrapper

function exitImageView() {
	imageViewer?.exit()
	imageViewer = undefined
	imageWrapper = undefined
}

/**
 * @param {HTMLDivElement} wrapper
 */
function attachImageViewer(wrapper) {
	/** @type {HTMLDivElement | null} */
	const loadingOverlay = wrapper.querySelector('[class*="loadingOverlay_"]')
	if (!loadingOverlay) {
		return
	}

	/** @type {HTMLDivElement | null} */
	const backdrop = document.querySelector('[class*="backdrop_"]')
	if (!backdrop) {
		return
	}

	let image = wrapper.querySelector('img')
	if (!image) {
		return
	}

	if (!wrapper.parentElement) {
		return
	}

	// imageWrapper.style.width = ''
	// imageWrapper.style.height = ''
	// wrapper.style.display = 'grid'
	// wrapper.style.placeItems = 'center'
	// image.style.maxWidth = '90vw'
	// image.style.maxHeight = '90vh'

	wrapper.style.width = '90vw'
	wrapper.style.height = '90vh'

	loadingOverlay.style.display = 'grid'
	loadingOverlay.style.placeItems = 'center'

	exitImageView()
	imageViewer = new SimleImageViewer(image, wrapper, backdrop)
	imageWrapper = wrapper

	return true
}

const IMAGE_WRAPPER_SELECTOR =
	'div[class*="imageWrapper_"]:not([class*="lazyImg"], [class*="imageZoom"])'

/**
 * @param {HTMLElement} element
 * @returns {HTMLDivElement | null | undefined}
 */
function getImageWrapperFromAddedNode(element) {
	// Single image
	if (element.matches('div[class*="layer_"]')) {
		return /** @type {HTMLDivElement | null} */ (element.querySelector(IMAGE_WRAPPER_SELECTOR))
	}
	// Gallery view
	else if (element.matches('div[class*="zoomedMediaFitWrapper_"]')) {
		return /** @type {HTMLDivElement | null} */ (element.querySelector(IMAGE_WRAPPER_SELECTOR))
	} else if (element.matches(IMAGE_WRAPPER_SELECTOR)) {
		return /** @type {HTMLDivElement} */ (element)
	}
	// For bigger images on gallery view's initial load,
	// img is added after the wrapper and other UIs
	else if (element instanceof HTMLImageElement) {
		const imageWrapper = document.querySelector(IMAGE_WRAPPER_SELECTOR)
		if (imageWrapper && imageWrapper.contains(element)) {
			return /** @type {HTMLDivElement} */ (imageWrapper)
		}
	}
}

// function start() {}

// function stop() {
// 	imageViewer?.exit()
// }

/**
 * @param {MutationRecord} records
 */
function observer(records) {
	if (imageWrapper && !document.contains(imageWrapper)) {
		exitImageView()
	}
	for (const node of records.addedNodes) {
		if (!(node instanceof HTMLElement)) {
			continue
		}
		const imageWrapper = getImageWrapperFromAddedNode(node)
		if (imageWrapper) {
			const succeed = attachImageViewer(imageWrapper)
			if (succeed) {
				break
			}
		}
	}
}

new MutationObserver((records) => {
	for (const record of records) {
		observer(record)
	}
}).observe(document.documentElement, {
	childList: true,
	subtree: true,
})
