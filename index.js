function highlightText(element) {
  const range = document.createRange()
  //select all the content inside the element vv
  range.selectNodeContents(element)
  const selection = window.getSelection()
  // remove existing selections
  selection.removeAllRanges()
  selection.addRange(range)
}

// number: 1 to the next section, -1 to the previous
function switchEnterSection(nodeList, index, number) {
  const whereTo = nodeList[index + number]
  whereTo.contentEditable = 'true'
  whereTo.focus()
  highlightText(whereTo)
}

//quickly select the displayed counting number
function selectContainer(containerIndex) {
  const displayMin = document.querySelector(`#c${containerIndex + 1} .min`)
  const displaySec = document.querySelector(`#c${containerIndex + 1} .sec`)
  return [displayMin, displaySec]
}

//quickly change the textContent of a selected element
function modifyHTML(eleSelector, text) {
  document.querySelector(eleSelector).textContent = String(text)
}

// pass the btn and the timer indices to this function and start counting
function tick(btn, index) {
  btn.textContent = 'PAUSE'
  const displayMin = document.querySelector(`#c${index + 1} .min`)
  const displaySec = document.querySelector(`#c${index + 1} .sec`)

  // current timestamp + timer convert to ms = alarm timestamp
  //timerRecord: [25, 01, 05, 01] 
  const getTime = (Number(timerRecord[index * 2]) * 60 + Number(timerRecord[index * 2 + 1])) * 1000
  const end = Date.now() + getTime
  timerID = setInterval(() => {
    //sometimes timestamp we get from Date.now() can be larger than the real time due to lagging from cpu, browser, etc; Causing the result being negative. use math.max to avoid it
    const remainSec = Math.max(0, Math.round((end - Date.now()) / 1000))
    const newMin = String(Math.floor(remainSec / 60)).padStart(2, '0')
    const newSec = String(remainSec % 60).padStart(2, '0')
    displayMin.textContent = newMin
    displaySec.textContent = newSec
    
    if (remainSec === 0) {
      timeUpAlarm.play()
      clearInterval(timerID)
      isPause = true
      btn.textContent = 'STOP'
      // when time is up, if workTimer is displaying, do the following
      const displayW = getComputedStyle(timerW).display
      displayW === 'flex' ? guide.textContent = "Good work! Let's stop and take a break!" : guide.textContent = "Time is up! Let's get productive!"
      const toFlash = document.querySelector(`#c${index + 1}`)
      flashID = setInterval(() => {
        toFlash.style.opacity = (toFlash.style.opacity === "1") ? "0" : "1" 
      }, 800);
    }
  }, 1000);
}

//index = of the selected start/reset buttons; (index + 1) locates the id of the target element(#c1, #c2, #r1, #r2...)
//switchBoolean: true/false; decide if switching the current displaying timer
function reset(index, switchBoolean) {
  if (timerID) clearInterval(timerID)
  if (flashID) {
    document.querySelector(`#c${index + 1}`).style.opacity = '1'
    clearInterval(flashID)
  }
  if (switchBoolean === true) {
    switchTimerVisibility()
  }
  
  modifyHTML(`#s${index + 1}`, 'START')
  timeUpAlarm.currentTime = 0
  timeUpAlarm.pause()
  const [min, sec] = selectContainer(index)
  if (index === 0) {
    [min.textContent, sec.textContent] = [timerRecord[0], timerRecord[1]]
  } else {
    [min.textContent, sec.textContent] = [timerRecord[2], timerRecord[3]]
  }
}

function btnEffect(btn) {
  btn.animate(
    [
      {transform: "scale(0.9)"},
      {transform: "scale(1)"},
    ],
    {
      duration: 100,
      iterations: 1,
    }
  )
}

const quote = document.querySelector('.quote')
const author = document.querySelector('.author')
const quoteContainer = document.querySelector('.quoteContainer')
function getQuote() {
  const target = encodeURIComponent('https://zenquotes.io/api/random');
  fetch(`http://localhost:3001/proxy?url=${target}`)
  .then(res => res.json())
  .then(data => {
    console.log(data[0].q, data[0].a)
    quote.textContent = data[0].q
    author.textContent = `-${data[0].a}`
  })
  .catch(err => console.error(err))
}

// getQuote()
// quoteContainer.addEventListener('click', () => getQuote())

// two timers: default set as 45:00, 15:00. workTimer gets [45, 00, 15, 00]
const workTimer = document.querySelectorAll('.countdown div')
let timerRecord = []
// vv get the min and sec of alarms and store them to the timerRecord array
workTimer.forEach((timer, index) => {
  timerRecord[index] = timer.textContent
})

// editable timer
const breakTimeLabel = document.querySelector('.breakTimeLabel')
breakTimeLabel.textContent = `Break time: ${timerRecord[2]}:${timerRecord[3]}`
const breakTimeInput = document.getElementById('breaktime')
breakTimeInput.addEventListener('change', (e) => {
  const time = breakTimeInput.value
  const min = time[0] + time[1]
  const sec = time[2] + time[3]
  timerRecord[2] = min
  timerRecord[3] = sec
  breakTimeLabel.textContent = `Break time: ${min}:${sec}`
})
workTimer.forEach((timer, index) => {
  timer.addEventListener('click', () => {
    timer.contentEditable = 'true'
    timer.focus()
    highlightText(timer)
  })
  // when use press "tab" key in editing, switch to the next div
  timer.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && timer.contentEditable) {
      e.preventDefault()
      //if user only input one number and hit 'tab', add a 0 to the beginning
      if (timer.textContent.length === 1) {
        timerRecord[index] = timer.textContent.padStart(2, '0')
        timer.textContent = timerRecord[index]
        console.log(timerRecord)
      }
      
      if (index < 3) {
        switchEnterSection(workTimer, index, 1)
      }
    }
  })
  // when use a combination of "shift + tab" is pressed in editing, switch to the previous div
  timer.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      console.log(index)
      
      if (index > 0) {
        switchEnterSection(workTimer, index, -1)
      }
    }
  })
  timer.addEventListener('blur', () => {
    timer.contentEditable = 'false'
  })
  //limit the input to 2 digits
  timer.addEventListener('input', () => {
    // anything besides digits will be omit
    let digitOnly = timer.textContent.replace(/[^\d]/g,'')
    timer.textContent = digitOnly
    // switch to the next edit section after the second digit is entered. when index === 3, cut the third digit
    if (digitOnly.length >= 2) {
      if (index === 3) {
        timer.textContent = timer.textContent.slice(0, 2)
        highlightText(timer)
        timerRecord[index] = timer.textContent
        console.log(timerRecord)
        return
      }
      timerRecord[index] = timer.textContent
      switchEnterSection(workTimer, index, 1)
      console.log(timerRecord)
    }
  })
})

//if no action in 5 seconds, play an animation of mouse clicking the timer
const mouseIcon = new Image('./lib/left-click')

// start|pause timer
const mainBtns = document.querySelectorAll('.main')
const resetBtns = document.querySelectorAll('.resetBtn')
let isPause = true
let timerID, flashID

// when the button is hit, and the timer is not running(isPause=true), get the current display number and start counting down; otherwise reverse the flag and stop the counter
const guide = document.querySelector('.guide span')
const timerW = document.querySelector('.workTimer')
const timerR = document.querySelector('.relaxTimer')
const timeUpAlarm = new Audio('./lib/ambient-piano-music-1.wav')

//when the time is up and the stop button is hit, check which timer is displaying and switch visibility
function switchTimerVisibility() {
  const displayW = getComputedStyle(timerW).display
  if (displayW === 'flex') {
    timerW.style.display = 'none'
    timerR.style.display = 'flex'
    console.log("switched to relax timer")
  } else {
    timerW.style.display = 'flex'
    timerR.style.display = 'none'
    console.log("switched to work timer")
  }
}

mainBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    //click effect
    btnEffect(btn)
    
    if (btn.textContent === 'STOP') {
      reset(index, false)
      
      //when the time is up and the stop button is hit, check which timer is displaying and switch visibility
      switchTimerVisibility()
      //automatically start the relaxTimer
      // if (getComputedStyle(timerR).display === 'flex') {
      //   tick(document.querySelector('#s2'), 1)
      // }

      return
    }
    if (btn.textContent === 'START') {
      btn.textContent = 'PAUSE'
      tick(btn, index)
    } else {
      btn.textContent = 'START'
      clearInterval(timerID)
      isPause = true
    }
  })
})

//reset button
resetBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    btnEffect(btn)
    const displayW = getComputedStyle(timerW).display
    displayW === 'flex' ? reset(index, false) : reset(index, true)
  })
})

// day/night mode toggle
// const themeToggle = document.querySelector('.switchWrapper .slider')
// const switchContainer = document.querySelector('.switchWrapper')
// const body = document.body
// const timers = document.querySelectorAll('.workTimer, .relaxTimer')
// let isDarkMode = false
// switchContainer.addEventListener('click', () => {
//   console.log('clicked')
//   if (isDarkMode) {
//     themeToggle.style.transform = "translateX(0px)"
//     body.classList.replace('dark', 'light')
//     switchContainer.classList.replace('dark', 'light')
//     timers.forEach((timer) => {
//       timer.classList.replace('dark', 'light')
//     })
//     isDarkMode = false
//   } else {
//     themeToggle.style.transform = "translateX(20px)"
//     body.classList.replace('light', 'dark')
//     switchContainer.classList.replace('light', 'dark')
//     timers.forEach((timer) => {
//       timer.classList.replace('light', 'dark')
//     })
//     isDarkMode = true
//   }
// })

//To do list: enter and display as list item
const memoInput = document.querySelector('#to-do-input')
const memoBtn = document.querySelector('.to-do-enter-field button')
const toDoList = document.querySelector('.to-do-list')
let todoItems = ['121','1','1']
memoBtn.addEventListener('click', (e) => {
  e.preventDefault()
  toDoList.innerHTML = todoItems.map((item) => {
    return `<li>${item}<li>`
  })
})

// function renderTodoList(arr) {
// }