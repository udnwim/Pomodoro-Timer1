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
// btn: there are 2 buttons correspond to two timers with the same classname; selected with queryselectAll
function tick(btn, index) {
  btn.textContent = 'PAUSE'
  const displayMin = document.querySelector(`#c${index + 1} .min`)
  const displaySec = document.querySelector(`#c${index + 1} .sec`)

  //reference: timerRecord = ['25', '01', '05', '01']
  // current timestamp + timer convert to ms = alarm timestamp
  const getTime = (Number(timerRecord[index * 2]) * 60 + Number(timerRecord[index * 2 + 1])) * 1000
  const end = Date.now() + getTime
  timerID = setInterval(() => {
    //sometimes timestamp we get from Date.now() can be larger than the actual time due to lagging from cpu, browser, etc..., causing the result being negative. use math.max to avoid it
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
      // when time is up, display the following text according to the visibility of timer
      const displayW = getComputedStyle(timerW).display
      displayW === 'flex' ? guide.textContent = "Good work! Let's stop and take a break!" : guide.textContent = "Time is up! Let's get productive!"
      btnTimerToggle.classList.add('hidden')
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
  
  const displayW = getComputedStyle(timerW).display
  btnTimerToggle.classList.remove('hidden')
  
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
      {transform: "scale(0.8)"},
      {transform: "scale(1)"},
    ],
    {
      duration: 100,
      iterations: 1,
    }
  )
}

//display a quote
// const quote = document.querySelector('.quote')
// const author = document.querySelector('.author')
// const quoteContainer = document.querySelector('.quoteContainer')
// function getQuote() {
//   const target = encodeURIComponent('https://zenquotes.io/api/random');
//   fetch(`http://localhost:3001/proxy?url=${target}`)
//   .then(res => res.json())
//   .then(data => {
//     // console.log(data[0].q, data[0].a)
//     quote.textContent = data[0].q
//     author.textContent = `-${data[0].a}`
//   })
//   .catch(err => console.error(err))
// }
// getQuote()
// quoteContainer.addEventListener('click', () => getQuote())

//when the timer for break is displaying, add the number from the timerRecord array, and display it
//timerRecord: record the min and sec of each timer. format: ['25', '00', '05', '00']
let timerRecord = ['25', '00', '05', '00']
let totalProductiveHr = 0
let totalProductiveMin = 0
// arr is the arr timerRecord 
function updateTotalProductive(arr) {
  const arrN = arr.map(Number)
  totalProductiveMin += arrN[0]
  if (totalProductiveMin > 99) {
    totalProductiveHr += Math.floor(totalProductiveMin / 60)
    totalProductiveMin = totalProductiveMin % 60
  }
  totalProductiveHr = String(totalProductiveHr).length < 2 ? `0${totalProductiveHr}` : totalProductiveHr
  totalProductiveMin = String(totalProductiveMin).length < 2 ? `0${totalProductiveMin}` : totalProductiveMin

  const displayTotalHr = document.querySelector('.total-productive-time-wrapper .total-hour')
  const displayTotalMin = document.querySelector('.total-productive-time-wrapper .total-min')
  displayTotalHr.textContent = totalProductiveHr
  displayTotalMin.textContent = totalProductiveMin
}
// updateTotalProductive(timerRecord)


const workTimer = document.querySelectorAll('.countdown div')
// vv get the min and sec of alarms and store them to the timerRecord array
workTimer.forEach((timer, index) => {
  timerRecord[index] = timer.textContent
})

//a button to toggle the visibility of two timers
function changeTimer() {
  btnTimerToggle.classList.remove('hidden')
  const displayW = getComputedStyle(timerW).display
  btnTimerToggle.textContent = displayW === 'flex' ? 'I want to take a break' : 'I am ready to work!'
}
const btnTimerToggle = document.querySelector('.toggle-btn')
btnTimerToggle.addEventListener('click', () => {
  switchTimerVisibility()
  changeTimer()
})

// modify break time in the input box
// const breakTimeLabel = document.querySelector('.breakTimeLabel')
// breakTimeLabel.textContent = `Break time: ${timerRecord[2]}:${timerRecord[3]}`
// const breakTimeInput = document.getElementById('breaktime')
// breakTimeInput.addEventListener('change', (e) => {
//   const time = breakTimeInput.value
//   const min = time[0] + time[1]
//   const sec = time[2] + time[3]
//   timerRecord[2] = min
//   timerRecord[3] = sec
//   breakTimeLabel.textContent = `Break time: ${min}:${sec}`
// })
//modify the timer in the counting box
workTimer.forEach((timer, index) => {
  timer.addEventListener('click', () => {
    timer.contentEditable = 'true'
    timer.focus()
    highlightText(timer)
  })
  //if "tab" key is pressed while entering the time, switch to the next div
  timer.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && timer.contentEditable) {
      e.preventDefault()
      //if user only input one number and hit 'tab', add a 0 to the beginning
      if (timer.textContent.length === 1) {
        timerRecord[index] = timer.textContent.padStart(2, '0')
        timer.textContent = timerRecord[index]
        // console.log(timerRecord)
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
      // console.log(index)
      
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
    // switch to the next section when the second digit is entered. If index(the third element in array timerRecord) === 3, cut the third digit
    if (digitOnly.length >= 2) {
      if (index === 3) {
        timer.textContent = timer.textContent.slice(0, 2)
        highlightText(timer)
        timerRecord[index] = timer.textContent
        // console.log(timerRecord)
        return
      }
      timerRecord[index] = timer.textContent
      switchEnterSection(workTimer, index, 1)
      // console.log(timerRecord)
    }
  })
})

//[to do]if no action in 5 seconds, play an animation of mouse clicking the timer
const mouseIcon = new Image('./lib/left-click')

// start|pause timer
const mainBtns = document.querySelectorAll('.main')
const resetBtns = document.querySelectorAll('.resetBtn')
let isPause = true
let timerID, flashID

// when the round button for displaying 'STRAT' or 'PAUSE' is hit, and the timer is not running(isPause=true), get the current display number and start the count down; otherwise reverse the flag and stop the timer
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

//start/pause/stop button click event listener
mainBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    //clicking effect
    btnEffect(btn)
    
    if (btn.textContent === 'STOP') {
      reset(index, false)
      
      //when the time is up and the stop button is hit, check which timer is displaying and switch visibility
      switchTimerVisibility()
      changeTimer()

      //if the break timer is displaying, update the total productive time
      const displayR = getComputedStyle(timerR).display
      console.log(displayR)
      if (displayR === 'flex') {
        updateTotalProductive(timerRecord)
      }

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

//add click effect on all buttons
const btnsAll = document.querySelectorAll('button')
btnsAll.forEach(btn => {
  btn.addEventListener('click', () => {
    btnEffect(btn)
  })
})

//reset button (timer)
resetBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const displayW = getComputedStyle(timerW).display
    reset(index, false)
    //if the break timer is displaying, switch to the work timer
    // displayW === 'flex' ? reset(index, false) : reset(index, true)
  })
})

//reset button (accumulated study time)
const resetBtnTotal = document.querySelector('.total-productive-time-wrapper button')
resetBtnTotal.addEventListener('click', () => {
  const totalTime = document.querySelectorAll('.total-productive-time-wrapper span')
  for (let i = 0; i < totalTime.length; i++) {
    totalTime[i].textContent = '00'
  }
})

// a switch for toggling different color theme (day/night)
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

//To do list: enter your goal(s) and display them as list items
let todoItems = ['Study Javascript']
const memoInput = document.querySelector('#to-do-input')
const memoBtn = document.querySelector('.to-do-enter-field button')
const toDoList = document.querySelector('.to-do-list')
// button clicking event: add todo item to the list
memoBtn.addEventListener('click', (e) => {
  e.preventDefault()
  if (!memoInput.value) return

  todoItems.push(memoInput.value)
  renderToDo()
  memoInput.value = ''
  memoInput.focus()
})
// if user press "enter" in the to-do input box, add content in the to do list
memoInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    if (!memoInput.value) return

    todoItems.push(memoInput.value)
    renderToDo()
    memoInput.value = ''
    memoInput.focus()
  }
})

//hightlight text in the to-do-list input when focus
// memoInput.addEventListener('focus', () => {
//   memoInput.select()
// })

// display everything in the toDoItems array
function renderToDo() {
  const displayList = document.querySelector('.to-do-list')
  const itemToRender = todoItems.map((item, index) => {
    return `
      <li id=${index + 1}>
        <label>
          <input type='checkbox'></input>
          <span>${item}</span>
        </label>
        <button id=${index + 1} class="deleteBtn">Delete</button>
      </li>
    `
    // return `
    //   <div>
    //     <li id=${index + 1}>
    //       <input type='checkbox' name=item${index + 1}></input>
    //       <label for="item${index + 1}">${item}</label>
    //     </li>
    //     <button id=${index + 1} class="deleteBtn">Delete</button>
    //   </div>
    // `
  }).join('')
  displayList.innerHTML = itemToRender
}
renderToDo()

//button clicking event: delete items from to do list/edit to do list
toDoList.addEventListener('click', (e) => {
  // console.log(e.target)
  const {tagName, id} = e.target
  if (tagName === 'BUTTON') {
    // console.log("You clicked the delete button")
    const itemID = document.getElementById(`item${id}`)
    todoItems.splice(itemID, 1)
    renderToDo()
  }
  if (tagName === 'INPUT') {
    console.log('You clicked on the list item')
  }
})

