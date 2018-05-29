var pinRadius = 10

var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')
var recordButton = document.getElementById('record-button')
var playButton = document.getElementById('play-button')
var pinTableBody = document.getElementById('pin-table-body')

var pins = []
var isRecording = false
var isPlaying = false


recordButton.onclick = function () 
{
    if (isPlaying) 
	{
        return
    }

    isRecording = true
    pins = []
    clearCanvas()
    updatePinTable()
}


playButton.onclick = function () 
{
    if (isPlaying) 
	{
        return
    }

    isRecording = false
    isPlaying = true
    clearCanvas()
    playPinsStartingAt(0)
}


canvas.onmousemove = function (event) 
{
    if (!isRecording) 
	{
        return
    }

    var mouse = getMouseCoords(event)

    clearCanvas()
    drawPins()
    drawCircle(mouse[0], mouse[1], pinRadius)
}


canvas.onclick = function (event) 
{
    if (!isRecording) 
	{
        return
    }

    var mouse = getMouseCoords(event)
    pins.push({
        x: mouse[0],
        y: mouse[1],
        label: '',
    })

    clearCanvas()
    drawPins()
    updatePinTable()

    var modal = createModal(function (label) 
	{
        pins[pins.length - 1].label = label
        modal.remove()
        drawPins()
        updatePinTable()
    })
}


/************************************************************************/

function clearCanvas() 
{
    context.clearRect(0, 0, canvas.width, canvas.height)
}


function drawCircle(x, y, r) 
{
    context.fillStyle = 'red'
    context.beginPath()
    context.arc(x, y, r, 0, 2 * Math.PI)
    context.fill()
}


function drawLine(x1, y1, x2, y2) 
{
    context.fillStyle = 'black'
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}


function drawPins() 
{
    drawPinsUpTo(pins.length - 1)
}


function drawPinsUpTo(index) 
{
    for (var i = 0; i <= index; i++) 
	{
        var pin = pins[i]

        drawCircle(pin.x, pin.y, pinRadius)

        if (i !== 0) 
		{
            var previousPin = pins[i - 1]

            drawLine(previousPin.x, previousPin.y, pin.x, pin.y)
        }
    }
}


function drawPinLabel(index) 
{
    var pin = pins[index]
    var xOffset = 2 * pinRadius
    var yOffset = 2 * pinRadius
    context.font = '25px serif'
    var labelHeight = 30
    var labelWidth = context.measureText(pin.label).width + 10

    if (pin.x > canvas.width / 2) 
	{
        xOffset += labelWidth
        xOffset *= -1
    }
    if (pin.y > canvas.height / 2) 
	{
        yOffset += labelHeight
        yOffset *= -1
    }

    context.fillStyle = 'white'
    context.fillRect(pin.x + xOffset, pin.y + yOffset, labelWidth, labelHeight)
    context.textBaseline = 'top'
    context.fillStyle = 'black'
    context.fillText(pin.label, pin.x + xOffset + 5, pin.y + yOffset)
}


function playPinsStartingAt(index) 
{
    if (index >= pins.length) 
	{
        clearCanvas()
        drawPins()
        isPlaying = false
        return
    }

    clearCanvas()
    drawPinsUpTo(index)
    if (pins[index].label !== '') 
	{
        drawPinLabel(index)
    }

    setTimeout(function () 
	{
        clearCanvas()
        drawPinsUpTo(index)
        setTimeout(function () 
		{
            playPinsStartingAt(index + 1)
        }, 400)
    }, 1000)
}


function updatePinTable() 
{
    pinTableBody.innerHTML = ''

    pins.forEach(function (pin, index) 
	{
        var tr = document.createElement('tr')

        var moveTd = document.createElement('td')
        var moveUpButton = document.createElement('button')
        moveUpButton.innerHTML = 'up'
        moveUpButton.onclick = function () 
		{
            if (isPlaying) 
			{
                return
            }
            if (index <= 0) 
			{
                return
            }

            var otherPin = pins[index - 1]
            pins[index - 1] = pin
            pins[index] = otherPin

            clearCanvas()
            drawPins()
            updatePinTable()
        }
        var moveDownButton = document.createElement('button')
        moveDownButton.innerHTML = 'down'
        moveDownButton.onclick = function () 
		{
            if (isPlaying) 
			{
                return
            }
            if (index >= pins.length - 1) 
			{
                return
            }

            var otherPin = pins[index + 1]
            pins[index + 1] = pin
            pins[index] = otherPin

            clearCanvas()
            drawPins()
            updatePinTable()
        }
        moveTd.appendChild(moveUpButton)
        moveTd.appendChild(moveDownButton)
        tr.appendChild(moveTd)

        var labelTd = document.createElement('td')
        var labelInput = document.createElement('input')
        labelInput.setAttribute('type', 'text')
        labelInput.value = pin.label
        labelInput.oninput = function (event) 
		{
            if (isPlaying) 
			{
                return
            }

            pin.label = event.target.value
        }
        labelTd.appendChild(labelInput)
        tr.appendChild(labelTd)

        var xTd = document.createElement('td')
        xTd.innerHTML = pin.x
        tr.appendChild(xTd)

        var yTd = document.createElement('td')
        yTd.innerHTML = pin.y
        tr.appendChild(yTd)

        var deleteTd = document.createElement('td')
        var deleteButton = document.createElement('button')
        deleteButton.innerHTML = 'delete'
        deleteButton.onclick = function () 
		{
            if (isPlaying) 
			{
                return
            }

            pins.splice(index, 1)

            clearCanvas()
            drawPins()
            updatePinTable()
        }
        deleteTd.appendChild(deleteButton)
        tr.appendChild(deleteTd)

        pinTableBody.appendChild(tr)
    })
}


function createModal(onsave) 
{
    var container = document.createElement('div')
    container.setAttribute('id', 'modal')
    var modal = document.createElement('div')
    var title = document.createElement('h3')
    title.innerHTML = 'Label Your Pin'
    var input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.onkeypress = function (event) 
	{
        if (event.keyCode === 13) 
		{
            onsave(input.value)
        }
    }
    var saveButton = document.createElement('button')
    saveButton.innerHTML = 'save'
    saveButton.onclick = function() 
	{
        onsave(input.value)
    }
    modal.appendChild(title)
    modal.appendChild(input)
    modal.appendChild(saveButton)
    container.appendChild(modal)
    document.body.appendChild(container)

    input.focus()

    return container
}


function getMouseCoords(event) 
{
    if (!event) var event = window.event;

    var posx = 0;
    var posy = 0;

    if (event.pageX || event.pageY) 
	{
        posx = event.pageX;
        posy = event.pageY;
    } 
	else if (event.clientX || event.clientY) 
	{
        posx = event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = event.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }

    // get the offsets of the object that triggered the eventhandler
    var totaloffset = findPos(event.target);

    var totalXoffset = totaloffset[0];
    var totalYoffset = totaloffset[1];

    var canvasX = posx- totalXoffset;
    var canvasY = posy- totalYoffset;
    // return coordinates in an array
    return [canvasX, canvasY];
}


function findPos(obj) 
{
    var curleft = curtop = 0;

    if (obj.offsetParent) 
	{
        do 
		{
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } 
		while (obj = obj.offsetParent);

        return [curleft,curtop];
    }
}
