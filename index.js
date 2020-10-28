class Quiz {
  constructor(questions) {
    this.questions = questions
    // console.log('questions', questions);
    this.questionIndex = 0
    this.display()
  }

  quess() {
    this.questionIndex++
    this.display()
  }

  getQuestionIndex() {
    // console.log('this.questionIndex', this.questionIndex)
    return this.questions[this.questionIndex]
  }

  display() {
    // console.log('this.getQuestionIndex()', this.getQuestionIndex())
    let choices = this.getQuestionIndex().choices
    // console.log('choices', choices);
    const assistantCards = document.querySelector('.assistant__cards')
    let arrayNumbers = []
    let number
    for (let i = 0; i < choices.length; i++) {
      number = this.getQuestionIndex().choices[i].category
      console.log('number', this.getQuestionIndex().choices[i].category);
      arrayNumbers.push(number)
      
      assistantCards.insertAdjacentHTML('beforeend', card.render(choices[i]))
    }
  
    assistantCards.addEventListener('click', event => {
      const category = event.target.dataset.category
      console.log('category', category);
      console.log('arrayNumbers', arrayNumbers);

      for (let k = 0; k < arrayNumbers.length; k++) {      
        if (category === arrayNumbers[k]) {
          assistantCards.innerHTML = ''
          this.quess()
        }
      }

    })
  }

}


class Question {
  constructor(choices) {
    this.choices = choices
  }
}


class Card {
  constructor(choice, category) {
    this.choice = choice
    this.category = category
  }

  render(choice) {
    return `
      <a class="assistant__card" data-category="${choice.category}" data-card="true">${choice.title}</a>
    `
  }
}


const card = new Card()


// Data
let questions = [
  new Question([{title: "Жилое помещение", category: '1'}]),
  new Question([{title: "Земельный участок", category: '2'}, {title: "Сооружение", category: '1'}, {title: "Юр лицо", category: '1'}]),
  new Question([{title: "Apple", category: '99'}]),
]


// let questions2 = [
//   new Question([{title: "Нежилое помещение", category: '9'}]),
//   new Question([{title: "Товарный знак", category: '7'}, {title: "Изобретение", category: '8'}, {title: "Бренд", category: '9'}]),
// ]

// Create quiz
new Quiz(questions)

// new Quiz(questions2)

