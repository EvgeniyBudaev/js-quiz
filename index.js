function generateId(questions) {

  questions.forEach(q => {
    q.id = Math.random().toString(36).substring(7) // generate uniq id for questions
    if (q.children) generateId(q.children)
  });
  
}

class Quiz {
  constructor(questions) {
    this.questions = questions
    generateId(this.questions)
    this.currentQuestion = null;
    //this.questionIndex = 0
    this.display()
  }

  quess(id) {
    //this.questionIndex++
    this.currentQuestion = this.currentQuestion ? this.findQuestion(id, this.currentQuestion.children || []) : this.questions.find(q => q.id === id)
    
    if (this.currentQuestion && this.currentQuestion.children) {
      this.display()
    } else {
      alert('finish, go to next page');
    }
    
    
  }

  findQuestion(id,questions) {
    for (let i=0; i<questions.length; i++) {
      const q = questions[i]
      if (q.id === id) return q;
      if (q.children) this.findQuestion(id,q.children)
      return null
    }
  }

  // getQuestionIndex() {
  //   console.log('this.questionIndex', this.questionIndex)
  //   return this.questions[this.questionIndex]
  // }

  display() {
    // console.log('this.getQuestionIndex()', this.getQuestionIndex())
    // let choices = this.getQuestionIndex().choices
    // console.log('choices', choices);
    const questions = this.currentQuestion && this.currentQuestion.children || this.questions;
    const assistantCards = document.querySelector('.assistant__cards')
    let arrayNumbers = []
    let number
    for (let i = 0; i < questions.length; i++) {
      number = questions[i].category
      console.log('number', number);
      arrayNumbers.push(number)
      
      assistantCards.insertAdjacentHTML('beforeend', card.render(questions[i]))
    }

    assistantCards.querySelectorAll("a").forEach(el => el.addEventListener('click', event => {
      const category = event.target.dataset.category
      const id = event.target.dataset.id
      console.log('category', category);
      console.log('arrayNumbers', arrayNumbers);

      // for (let k = 0; k < arrayNumbers.length; k++) {      
      //   if (category === arrayNumbers[k]) {
      assistantCards.innerHTML = ''
      this.quess(id)
      //   }
      // };
      event.stopPropagation()

    }, true))
  }

}


class Question {
  constructor(params) {
    this.title = params.title
    this.category = params.category
    this.children = params.children
  }
}


class Card {
  constructor(choice, category) {
    this.choice = choice
    this.category = category
  }

  render(choice) {
    return `
      <a class="assistant__card" data-category="${choice.category}" data-id=${choice.id} data-card="true">${choice.title}</a>
    `
  }
}


const card = new Card()


// Data
let questions = [
  new Question({title: "Жилое помещение", category: '1', children: [
    new Question({title: "Земельный участок 1", category: '2', children: [
      new Question({title: "Apple", category: '3'}),
      new Question({title: "Сооружение", category: '4'}),
      new Question({title: "Юр лицо", category: '5'})
    ]}),
    new Question({title: "Земельный участок 2", category: '6'}),
    new Question({title: "Земельный участок 2", category: '7'}),
  ]}),
  new Question({title: "Нежилое помещение", category: '8', children: [
    new Question({title: "Право", category: '9'})
  ]})
]

// Create quiz
new Quiz(questions)

