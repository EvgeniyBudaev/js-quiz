class Quiz {
  constructor(questions) {

    this.$progressbar = document.getElementById("progressbar")
    this.progressbarMaxLevel = 0
    this.progressbarLevel = 1    
    
    this.questions = questions
    this.generateId(this.questions)
    this.currentQuestion = null;    
    
    this.quizQuestionTitle = document.querySelector('[data-quiz-question=""]')
    this.display()

    this.arrayLinks = []
    this.links = document.querySelector('[data-quiz-links=""]')
  }

  generateId(questions) {
    this.progressbarMaxLevel++
    questions.forEach(q => {
      q.id = Math.random().toString(36).substring(7) // generate uniq id for questions
      q.progressbarLevel = this.progressbarMaxLevel+1
      if (q.children) this.generateId(q.children)
    });
  }

  quess(id) {
    const lcq = this.currentQuestion // сделано чтобы работала навигация после окончания вопросов. в реальной версии можно убрать
    this.currentQuestion = (this.currentQuestion) ? this.findQuestion(id, this.currentQuestion.children || []) : this.questions.find(q => q.id === id)
    
    console.log('this.currentQuestion', this.currentQuestion)
    
    this.progressbarLevel++
    
    if (this.currentQuestion && this.currentQuestion.children) {
      this.arrayLinks.push(this.currentQuestion)
      this.choiceQuizTitleQuestion(this.currentQuestion)
      this.display()
      this.showLinks(this.currentQuestion)      
    } else {
      alert('finish, go to next page, last question id is' + id);
      this.currentQuestion = lcq  // сделано чтобы работала навигация после окончания вопросов. в реальной версии можно убрать
    }
  }

  showLinks(q) {
    // if (title) this.arrayLinks.push({title,id})
    console.log('this.arrayLinks', this.arrayLinks)
    let linkQuestion = this.arrayLinks.map(link => `<a href="#" data-type="breadcrumbs" data-id="${link.id}" data-pbar=${link.progressbarLevel}>${link.title}</a>`)
    this.links.innerHTML = linkQuestion.join('').toString()
    
    document.querySelectorAll("[data-type='breadcrumbs']").forEach(el => el.addEventListener('click',e => {
      // this.quess(e.target.dataset.id)
      console.log(this.currentQuestion)
      // if (e.target.dataset.id == this.currentQuestion.id) return
      this.currentQuestion = this.findParent(e.target.dataset.id,this.questions) //this.findQuestion(e.target.dataset.id,this.questions)
      if (this.currentQuestion) {
        this.choiceQuizTitleQuestion(this.currentQuestion)
        this.progressbarLevel = this.currentQuestion.progressbarLevel
        this.display()
        this.arrayLinks = [this.currentQuestion]
        this.showLinks(this.currentQuestion)
      } else {
        this.arrayLinks = []
        this.progressbarLevel = 1
      }
      this.display()
      this.showLinks(this.currentQuestion)
    }))
    
  }

  choiceQuizTitleQuestion({quizQuestionTitle}) {
    quizQuestionTitle ? this.quizQuestionTitle.innerHTML = quizQuestionTitle : this.quizQuestionTitle.innerHTML = ''
  }

  findParent(id,questions) {

    for (let i = 0; i < questions.length; i++) {

      const q = questions[i]
      const child = q.children.find(q => q.id == id)
      if (child) {
        return q
      } else {
        this.findParent(id,q)
      }

    }

  }
  
  findQuestion(id,questions) {
    for (let i = 0; i < questions.length; i++) {

      const q = questions[i]
      if (q.id === id) return q;
      if (q.children) {
        this.arrayLinks.push({title: q.title,id: q.id})
        this.findQuestion(id,q.children)
      }
      return null
    }
  }

  display() {
    const questions = this.currentQuestion && this.currentQuestion.children || this.questions;
    console.log('questions', questions)
    const assistantCards = document.querySelector('.assistant__cards')

    this.$progressbar.style.width = (this.progressbarLevel / this.progressbarMaxLevel * 100) + "%"
    assistantCards.innerHTML = ''
    
    // console.log('assistantCards', assistantCards)
    // console.log('quizQuestionTitle', quizQuestionTitle)

    for (let i = 0; i < questions.length; i++) {
      // console.log('questions[i]', questions[i])
      assistantCards.insertAdjacentHTML('beforeend', card.render(questions[i]))
    }

    assistantCards.querySelectorAll("a").forEach(el => el.addEventListener('click', event => {
      const id = event.target.dataset.id      
      this.quess(id)
      event.stopPropagation()

    }, true))
  }
}


class Question {
  constructor(params) {
    this.quizQuestionTitle = params.quizQuestionTitle
    this.title = params.title
    this.children = params.children
  }
}


class Card {
  constructor(choice) {
    this.choice = choice
  }

  render(choice) {
    return `
          <a class="assistant__card" data-id=${choice.id} data-card="true">${choice.title}</a>
        `
  }
}

const card = new Card()


// Data
let questions = [
  new Question({quizQuestionTitle: "Какое Вы хотите жилое помещение?", title: "Жилое помещение", children: [
    new Question({quizQuestionTitle: "Хотите Apple?", title: "Земельный участок 1", children: [
      new Question({title: "Apple"}),
      new Question({title: "Сооружение"}),
      new Question({title: "Юр лицо"})
    ]}),
    new Question({title: "Земельный участок 2"}),
    new Question({title: "Земельный участок 2"}),
  ]}),
  new Question({quizQuestionTitle: "Какое Вы хотите нежилое помещение?", title: "Нежилое помещение", children: [
    new Question({title: "Право"})
  ]})
]

// Create quiz
new Quiz(questions)

