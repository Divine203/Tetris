const cvs = document.querySelector('canvas')
const ctx = cvs.getContext('2d')

ctx.scale(20, 20)
alert('press `W` to rotate piece')

class Tetris {
	constructor() {
		this.ctx = ctx

		this.tPiece = document.querySelector('.t-piece')
		this.lPiece = document.querySelector('.l-piece')
		this.jPiece = document.querySelector('.j-piece')
		this.iPiece = document.querySelector('.i-piece')
		this.oPiece = document.querySelector('.o-piece')
		this.sPiece = document.querySelector('.s-piece')
		this.zPiece = document.querySelector('.z-piece')

		this.scoreTxt = document.querySelector('p.score')

		this.pieceShapes = [this.tPiece, this.lPiece, this.jPiece, this.iPiece, this.oPiece, this.sPiece, this.zPiece]
		this.piecesId = 'ILJOTSZ'
		this.nextPiece = 'L'
		this.score = 0

		this.pieces = {
			T: [
				[0, 0, 0],
				[1, 1, 1],
				[0, 1, 0]
			],
			L: [
				[2, 0, 0],
				[2, 0, 0],
				[2, 2, 0]
			],
			J: [
				[0, 0, 3],
				[0, 0, 3],
				[0, 3, 3]
			],
			I: [
				[0, 4, 0, 0],
				[0, 4, 0, 0],
				[0, 4, 0, 0],
				[0, 4, 0, 0]
			],
			O: [
				[5, 5],
				[5, 5]
			],
			S: [
				[0, 0, 0],
				[0, 6, 6],
				[6, 6, 0]
			],
			Z: [
				[0, 0, 0],
				[7, 7, 0],
				[0, 7, 7]
			]
		}

		this.player = {
			pos: { x: 5, y: 5 },
			piece: this.createPiece(this.nextPiece)
		}
		this.arena = this.createMatrix(17, 25);

	}

	createPiece(type) {
		return this.pieces[type];
	}

	createMatrix(width, height) {
		const matrix = []
		while (height--) {
			matrix.push(new Array(width).fill(0));
		}
		return matrix;
	}

	draw() {
		this.ctx.fillStyle = 'BLACK'
		this.ctx.fillRect(0, 0, cvs.width, cvs.height)

		this.drawMatrix(this.arena, { x: 0, y: 0 })
		this.drawMatrix(this.player.piece, this.player.pos)
	}

	checkLineClear() {
		const newRow = new Array(17).fill(0);
		for (let i = 0; i < this.arena.length; i++) {
			if (!this.arena[i].includes(0)) {
				this.arena.splice(i, 1)
				this.arena.unshift(newRow)
				this.score++
				this.scoreTxt.textContent = this.score
			}
		}
	}

	drawMatrix(piece, offset) {
		piece.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value == 1) this.ctx.fillStyle = 'PURPLE'
				else if (value == 2) this.ctx.fillStyle = 'ORANGE'
				else if (value == 3) this.ctx.fillStyle = 'PINK'
				else if (value == 4) this.ctx.fillStyle = 'BLUE'
				else if (value == 5) this.ctx.fillStyle = 'YELLOW'
				else if (value == 6) this.ctx.fillStyle = 'RED'
				else if (value == 7) this.ctx.fillStyle = 'GREEN'

				if (value !== 0) this.ctx.fillRect(x + offset.x, y + offset.y, 1, 1)
			})
		})
	}

	collide(arena, player) {
		const m = player.piece
		const p = player.pos
		for (let y = 0; y < m.length; ++y) {
			for (let x = 0; x < m[y].length; ++x) {
				if (m[y][x] !== 0 && (arena[y + p.y] && arena[y + p.y][x + p.x]) !== 0) {
					return true
				}
			}
		}

		return false
	}

	createNextPiece() {
		this.nextPiece = this.piecesId[Math.floor(this.piecesId.length * Math.random())]
	}

	reset() {
		this.player.piece = this.createPiece(this.nextPiece)
		this.player.pos.y = 0
		this.player.pos.x = Math.floor(this.arena[0].length / 2) - Math.floor(this.player.piece[0].length / 2)

		if (this.collide(this.arena, this.player)){
			this.arena.forEach(row => row.fill(0))
			this.score = 0
			this.scoreTxt.textContent = this.score
		}
		this.createNextPiece()
	}

	merge(arena, player) {
		player.piece.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					arena[y + player.pos.y][x + player.pos.x] = value;
				}
			})
		})
	}

	rotate(piece, dir) {
		for (let y = 0; y < piece.length; ++y) {
			for (let x = 0; x < y; ++x) {
				[
					piece[x][y],
					piece[y][x]
				] = [
						piece[y][x],
						piece[x][y]
					]
			}
		}

		if (dir > 0) piece.forEach(row => row.reverse())
		else piece.reverse()
	}

	pieceDrop() {
		this.player.pos.y++;
		if (this.collide(this.arena, this.player)) {
			this.player.pos.y--;
			this.merge(this.arena, this.player);
			this.checkLineClear()
			this.reset()
		}
		dropCounter = 0;
	}


	pieceMove(dir) {
		this.player.pos.x += dir;
		if (this.collide(this.arena, this.player)) this.player.pos.x -= dir
	}

	pieceRotate(dir) {
		const pos = this.player.pos.x
		let offset = 1
		this.rotate(this.player.piece, dir)
		while (this.collide(this.arena, this.player)) {
			this.player.pos.x += offset
			offset = -(offset + (offset > 0 ? 1 : -1))
			if (offset > this.player.piece[0].length) {
				rotate(this.player.piece, -dir)
				this.player.pos.x = pos
				return
			}
		}
	}

	showNextPiece() {
		this.pieceShapes.forEach(p => p.style.display = 'none')
		if (this.nextPiece === 'T') this.tPiece.style.display = 'block'
		else if (this.nextPiece === 'L') this.lPiece.style.display = 'block'
		else if (this.nextPiece === 'J') this.jPiece.style.display = 'block'
		else if (this.nextPiece === 'I') this.iPiece.style.display = 'block'
		else if (this.nextPiece === 'O') this.oPiece.style.display = 'block'
		else if (this.nextPiece === 'S') this.sPiece.style.display = 'block'
		else if (this.nextPiece === 'Z') this.zPiece.style.display = 'block'
	}


}

const tetrisGame = new Tetris()

tetrisGame.createNextPiece()






let dropCounter = 0
let dropInterval = 1000;
let lastTime = 0;


const update = (time = 0) => {
	const deltaTime = time - lastTime
	lastTime = time
	tetrisGame.showNextPiece()
	dropCounter += deltaTime
	if (dropCounter > dropInterval) tetrisGame.pieceDrop()
	tetrisGame.draw()
	requestAnimationFrame(update)
}

document.addEventListener('keydown', ({ keyCode }) => {
	if (keyCode === 37) tetrisGame.pieceMove(-1)
	else if (keyCode === 39) tetrisGame.pieceMove(1)
	else if (keyCode === 40) tetrisGame.pieceDrop()
	else if (keyCode === 81) tetrisGame.pieceRotate(-1)
	else if (keyCode === 87) tetrisGame.pieceRotate(1)
})




update()