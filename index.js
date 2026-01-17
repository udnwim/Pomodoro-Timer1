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

  const displayTotalHr = document.querySelector('.app-header .total-hour')
  const displayTotalMin = document.querySelector('.app-header .total-min')
  displayTotalHr.textContent = totalProductiveHr
  displayTotalMin.textContent = totalProductiveMin
}
// updateTotalProductive(timerRecord)

const workTimer = document.querySelectorAll('.countdown div')
// vv get the min and sec of alarms and store them to the timerRecord array
workTimer.forEach((timer, index) => {
  timerRecord[index] = timer.textContent
})

//change the text on the button based on which timer is currently displaying
// function changeBtnText() {
//   let timerIndex
//   btnTimerToggle.classList.remove('hidden')
//   const displayW = getComputedStyle(timerW).display
//   if (displayW === 'flex') {
//     btnTimerToggle.textContent = 'I want to take a break'
//     timerIndex = 0
//   } else {
//     btnTimerToggle.textContent = 'I am ready to work!'
//     timerIndex = 1
//   }
//   // stop the current timer
//   reset(timerIndex, false)

//   // btnTimerToggle.textContent = displayW === 'flex' ? 'I want to take a break' : 'I am ready to work!'

// }

//the "Confirm" button 
//when clicked, reset the study timer, hide the confirm button, hide the edit area text, display the break timer, and start counting down
function toggleConfirmBtn() {
  const confirmBtn = document.querySelector('.switch-timer-btn')
  const inputContainer = document.querySelector('.timer-toggle-edit')
  if (confirmBtn.textContent === 'Confirm') {
    confirmBtn.textContent = 'Skip this break'
    inputContainer.style.display = 'none'
    return true
  } else {
    confirmBtn.textContent = 'Confirm'
    inputContainer.style.display = 'block'
    return false
  }
}

const confirmBtn = document.querySelector('.switch-timer-btn')
confirmBtn.addEventListener('click', () => {
  const getInput = document.querySelector('.timer-toggle-input').value
  if (!getInput) return

  const confirmIsDisplayed = toggleConfirmBtn()

  if (confirmIsDisplayed) {
    timerRecord[2] = getInput.padStart(2, '0')
    timerRecord[3] = '00'
    document.querySelector('#c2 .min').textContent = getInput.padStart(2, '0')
    document.querySelector('#c2 .sec').textContent = '00'

    reset(0, true)
    const mainBtn = document.querySelector('#s2')
    tick(mainBtn, 1)
  } else {
    reset(0, true)
  }
})

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

// variables to start and pause timer
const mainBtns = document.querySelectorAll('.main')
const resetBtns = document.querySelectorAll('.resetBtn')
let isPause = true
let timerID, flashID
// ^^when the button that displays 'PAUSE'(isPause=true) is clicked, get the current displaying time and start the count down; otherwise reverse the flag and stop the timer

const guide = document.querySelector('.guide span')
const timerW = document.querySelector('.workTimer')
const timerR = document.querySelector('.relaxTimer')
const timeUpAlarm = new Audio('./lib/ambient-piano-music-1.wav')

//start,pause,stop - button event listener
mainBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    //clicking effect
    btnEffect(btn)
    
    if (btn.textContent === 'STOP') {
      reset(index, false)
      
      //this function returns the timer id after switching
      const timerID = switchTimerVisibility()

      // updateTotalProductive(timerRecord)

    //  when timer n is displaying, display the corresponding text block
      const textToDisplay = document.getElementById(`timer-toggle-text${timerID}`)
      const textToHide = document.getElementById(`timer-toggle-text${timerID === 1 ? 2 : 1}`)
      textToDisplay.style.display = 'flex'
      textToHide.style.display = 'none'

      const inputContainer = document.querySelector('.timer-toggle-edit')
      if (timerID === 1 && inputContainer.style.display === 'none') {
        toggleConfirmBtn()
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

//add click effect to all buttons
const btnsAll = document.querySelectorAll('button')
btnsAll.forEach(btn => {
  btn.addEventListener('click', () => {
    btnEffect(btn)
  })
})

//reset button for timer
resetBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const displayW = getComputedStyle(timerW).display
    reset(index, false)
    //if the break timer is displaying, switch to the work timer
    // displayW === 'flex' ? reset(index, false) : reset(index, true)
  })
})

//reset button (accumulated study time)
// const resetBtnTotal = document.querySelector('.app-header button')
// resetBtnTotal.addEventListener('click', () => {
//   const totalTime = document.querySelectorAll('.app-header span')
//   for (let i = 0; i < totalTime.length; i++) {
//     totalTime[i].textContent = '00'
//   }
// })

//TO DO LIST
let toDoItems
if (localStorage.getItem('data')) {
  toDoItems = JSON.parse(localStorage.getItem('data'))
} else {
  toDoItems = [{
      id: 1,
      task: 'Study Javascript',
      isCompleted: false,
    }
  ]
}

const todoInput = document.querySelector('#to-do-input')
const todoBtn = document.querySelector('.to-do-enter-field button')
const toDoList = document.querySelector('.to-do-list')

function getTodoInput(element, arrayToUpdate) {
  const trimInput = element.value.trim()
  if (!trimInput) return

  arrayToUpdate.push({id: arrayToUpdate.length + 1, task: trimInput, isCompleted: false})
  console.log(toDoItems)
  renderToDo()
  element.value = ''
  element.focus()
}

// Add input to the list: click button
todoBtn.addEventListener('click', (e) => {
  e.preventDefault()
  getTodoInput(todoInput, toDoItems)
})
// Add input to the list: keyboard enter
todoInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    getTodoInput(todoInput, toDoItems)
  }
})

function saveData() {
  localStorage.setItem('data', JSON.stringify(toDoItems))
}

// render items from toDoItems array; save data locally
function renderToDo() {
  const displayList = document.querySelector('.to-do-list')
  const itemToRender = toDoItems.map((item, index) => {
    return `
      <li id='item${index + 1}'>
        <span data-id='${index + 1}'>${item.task}</span>
        <div class='todolist-btncontainer'>
          <button 
            data-id='${index + 1}'
            class="editBtn"
          ></button>
          <button 
            data-id='${index + 1}'
            class="deleteBtn"
          ></button>
        </div>
      </li>
    `
  }).join('')

  displayList.innerHTML = itemToRender
  saveData()
}
renderToDo()

//TASK CHECK OFF EVENT
const checkbox = document.querySelector('.todo-checkbox-container')
//play a sound if a task is checked off
const rewardSound = new Audio('./lib/task-finished.mp3')
// when the to do list is clicked, find which item in the list is clicked and checkoff this item
toDoList.addEventListener('click', (e) => {
  // console.log(e.target.nodeName)
  if (e.target && e.target.nodeName === 'SPAN' ) {
    // if list item is currently not being edited
    if (e.target.contentEditable === 'false' || e.target.contentEditable === 'inherit') {
      const currentID = e.target.dataset.id
      const currentItem = document.querySelector(`#item${e.target.dataset.id} span`)
      btnEffect(currentItem)
      console.log(currentID)
      
      const checkStatus = currentItem.classList
      if (!checkStatus.contains('checked')) {
        rewardSound.currentTime = 0
        rewardSound.play()
        
        // move the finished task to the bottom
      }
      toDoItems[currentID - 1].isCompleted = !toDoItems[currentID - 1].isCompleted
      checkStatus.toggle('checked')
    }
  }
})

//button clicking event: delete items from to do list/edit to do list
toDoList.addEventListener('click', (e) => {
  const {tagName, dataset, classList} = e.target
  // console.log(e.target.classList)
  console.log(e.target)
  if (tagName === 'BUTTON' && 
    classList.contains('deleteBtn')) {
    deleteTask(dataset.id - 1, toDoItems)
  }
  if (tagName === 'BUTTON' && 
    classList.contains('editBtn')) {
    const itemID = document.querySelector(`#item${dataset.id} span`)
    // console.log(itemID)
    itemID.contentEditable = 'true'
    highlightText(itemID)
  }
})

// 
function deleteTask(itemIndex, arr) {
  arr.splice(itemIndex, 1)
  // rearrange task id
  arr.forEach((item, index) => {
    item.id = index + 1
  })
  renderToDo()
}

// when the span lose focus(finish editing), disable contentEditable 
// blur event does not bubble, used capture: true
toDoList.addEventListener('blur', (e) => {
  if (e.target.tagName === 'SPAN') {
    updateToDoArray(e.target)
  }
}, true)

// if 'enter' is pressed when editing list item, update the to do list array
toDoList.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    updateToDoArray(e.target)
  }
})

function updateToDoArray(element) {
  const index = element.dataset.id - 1
  toDoItems[index].task = element.textContent
  element.contentEditable = 'false'
}

// SIDE MENU
const sideMenuBtn = document.querySelector('.side-menu-btn')
const sideMenu = document.querySelector('.side-menu')
sideMenuBtn.addEventListener('click', function() {
  sideMenu.classList.toggle('activeMenu')
  sideMenuBtn.classList.toggle('activeBtn')
})
let completedTasks = []
document.getElementById('clearCompleted').addEventListener('click', () => {
  toDoItems.forEach(item => {
    if (item.isCompleted === true) {
      const {id, task, isCompleted} = item
      completedTasks.push(
        {
          id: completedTasks.length + 1,
          task: task,
          isCompleted: isCompleted
        }
      )
      deleteTask(id - 1, toDoItems)
      // console.log(toDoItems, completedTasks)
    }
  })
})
document.getElementById('clearAll').addEventListener('click', () => {
  // confirmation dialog

  toDoItems.length = 0
  renderToDo()
  // console.log(toDoItems)
})
document.getElementById('showStats').addEventListener('click', () => {
  //completed tasks: total number, what had been done
  //total time of working (only when time is up and "STOP" is displayed? clicked?)
  // number of skipping?
})
// About: import a doc of researches explaining pomodoro timer
// log in/register?
// setting:
//   layout checkbox: display a quote/option to skip
//   color theme?

// Drag and drop to adjust tasks

// ============FUNCTIONS==============
function highlightText(element) {
  const range = document.createRange()
  //select all the content inside the element vv
  range.selectNodeContents(element)
  const selection = window.getSelection()
  // remove existing selections
  selection.removeAllRanges()
  selection.addRange(range)
}

//check which timer is displaying and switch visibility
function switchTimerVisibility() {
  const displayW = getComputedStyle(timerW).display
  if (displayW === 'flex') {
    timerW.style.display = 'none'
    timerR.style.display = 'flex'
    return 2
    // console.log("switched to relax timer")
  } else {
    timerW.style.display = 'flex'
    timerR.style.display = 'none'
    document.querySelector('.switch-timer-btn').style.display = 'flex'
    document.querySelector('.timer-toggle-container').style.display = 'flex'
    return 1
    // console.log("switched to work timer")
  }
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
// btn: array of the big round MAIN buttons(queryselectAll)
// index: either 0 or 1
function tick(btn, index) {
  btn.textContent = 'PAUSE'
  // console.log(btn, btn.textContent)
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
      // const displayW = getComputedStyle(timerW).display
      // displayW === 'flex' ? guide.textContent = "Good work! Let's stop and take a break!" : guide.textContent = "Time is up! Let's get productive!"
      // btnTimerToggle.classList.add('hidden')

      // flash the timer when time is up
      const toFlash = document.querySelector(`#c${index + 1}`)
      flashID = setInterval(() => {
        toFlash.style.opacity = (toFlash.style.opacity === "1") ? "0" : "1" 
      }, 800);
    }
  }, 1000);
}

//index = of the selected start/reset buttons; (index + 1) locates the id of the target element(#c1, #c2, #r1, #r2...)
//switchBoolean: true/false; decide if switching the displaying timer
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
  // btnTimerToggle.classList.remove('hidden')
  
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