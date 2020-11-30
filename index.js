class Quiz {
  constructor(questions) {

    this.$progressbar = document.getElementById("progressbar")
    this.progressbarMaxLevel = 0 // for generate card levels
    this.progressbarLevel = 1
    
    this.questions = questions
    this.generateId(this.questions,2)
    this.currentQuestion = null

    this.quizQuestionTitle = document.querySelector('[data-quiz-question=""]')
    this.display()

    this.arrayLinks = []
    this.links = document.querySelector('[data-quiz-links=""]')
  }

  generateId(questions,i) {
    this.progressbarMaxLevel = i
    questions.forEach(q => {
      q.id = Math.random().toString(36).substring(7) // generate uniq id for questions
      q.progressbarLevel = i
      if (q.children) this.generateId(q.children, i+1)
    });
  }

  quess(id) {
    const lcq = this.currentQuestion // сделано чтобы работала навигация после окончания вопросов. в реальной версии можно убрать

    this.currentQuestion = this.currentQuestion ? this.findQuestion(id, this.currentQuestion.children || []) : this.questions.find(q => q.id === id)
    console.log('this.currentQuestion', this.currentQuestion)
    
    this.progressbarLevel++
    
    if (this.currentQuestion && this.currentQuestion.children) {
      this.arrayLinks.push(this.currentQuestion)
      this.choiceQuizTitleQuestion(this.currentQuestion)
      this.display()
      this.showLinks(this.currentQuestion)      
    } else {
      // alert('finish, go to next page, last question id is' + id);
       // console.log('lcq', lcq)
      // this.currentQuestion = lcq  // сделано чтобы работала навигация после окончания вопросов. в реальной версии можно убрать
        console.log('this.currentQuestion.linkPath', this.currentQuestion.linkPath)
        location.href = this.currentQuestion.linkPath
    }
  }

  showLinks(q) {
    // if (title) this.arrayLinks.push({title,id})
    // console.log('this.arrayLinks', this.arrayLinks)
    let linkQuestion = this.arrayLinks.map(link => `<a href="#" data-type="breadcrumbs" data-id="${link.id}" data-pbar=${link.progressbarLevel}>${link.title}</a>`)
    this.links.innerHTML = linkQuestion.join('').toString()
    
    document.querySelectorAll("[data-type='breadcrumbs']").forEach(el => el.addEventListener('click',e => {
      // this.quess(e.target.dataset.id)
      // console.log(this.currentQuestion)
      // if (e.target.dataset.id == this.currentQuestion.id) return
      this.currentQuestion = this.findParent(e.target.dataset.id,this.questions) //this.findQuestion(e.target.dataset.id,this.questions)
      if (this.currentQuestion) {        
        this.progressbarLevel = this.currentQuestion.progressbarLevel
        this.display()
        this.arrayLinks = [this.currentQuestion]
        this.showLinks(this.currentQuestion)
        this.choiceQuizTitleQuestion(this.currentQuestion)
      } else {
        this.arrayLinks = []
        this.progressbarLevel = 1
        this.choiceQuizTitleQuestion({})
      }
      
      this.display()
      this.showLinks(this.currentQuestion)
    }))
    
  }

  choiceQuizTitleQuestion({quizQuestionTitle}) {
    quizQuestionTitle ? this.quizQuestionTitle.innerHTML = quizQuestionTitle : this.quizQuestionTitle.innerHTML = 'что у вас?'
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
      // console.log('question',q)
      if (q.id === id) return q;
      if (q.children) {
        //this.arrayLinks.push({title: q.title,id: q.id})
        this.findQuestion(id,q.children)
      }
    }
  }

  display() {
    const questions = this.currentQuestion && this.currentQuestion.children || this.questions;
    // console.log('questions', questions)
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
      this.linkPath = params.linkPath
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
  new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Земельный участок", children: [
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно подготовить документы в гос. органы", children: [
          new Question({title: "Нужен межевой план", linkPath:"https://www.google.com/?hl=ru"}),
          new Question({title: "Нужен технический план", linkPath:"https://yandex.ru"}),
          new Question({title: "Нужен отчет об оценке", linkPath:"https://www.amcharts.com/demos/"}),
          new Question({title: "Нужна выписка ЕГРН", linkPath:"https://www.mazars.com/"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу снизить налоги", children: [
          new Question({title: "Слишком высокий налог"}),
          new Question({title: "Возросла КС"}),
          new Question({title: "Кадастрвоая стоимость превышает рыночную"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно оформить право собственности", children: [
          new Question({title: "Я купил землю"}),
          new Question({title: "Досталась земля в наследство"}),
          new Question({title: "Хочу взять землю в аренду"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужна независимая оценка (Фадеева)", children: [
          new Question({title: "Досталась земля в наследство"}),
          new Question({title: "Хочу продать землю"}),
          new Question({title: "Хочу взять землю в аренду"}),
          new Question({title: "Хочу поставить на баланс"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Изменить целевое назначение", children: [
          new Question({title: "Хочу начать строительство"}),
          new Question({title: "Хочу привести в соответствии с фактическим использованием"}),
          new Question({title: "Хочу вести бизнес на земельном участке"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу купить землю", children: [
          new Question({title: "Хочу начать строительство"}),
          new Question({title: "Для личного использования"}),
          new Question({title: "Хочу вести бизнес"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу арендовать землю", children: [
          new Question({title: "Владею нежилым зданием, находящимся на зем. участке"}),
          new Question({title: "Хочу начать строительство"}),
          new Question({title: "Для сдачи в аренду"}),
          new Question({title: "Хочу вести бизнес"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу сделать межевание", children: [
          new Question({title: "Поделить землю под продажу"}),
          new Question({title: "Поделить землю под аренду"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу начать строительство", children: [
          new Question({title: "Купить земельный участок"}),
          new Question({title: "Взял в аренду земельный участок"}),
          new Question({title: "достался в наследство"})
        ]}),
    ]}),


  new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Нежилая недвижимость", children: [
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно подготовить документы в гос.органы", children: [
          new Question({title: "Нужен технический план"}),
          new Question({title: "Нужно заключение эксперта для легализации самовольной постройки"}),
          new Question({title: "Нужен АГО/АГР"}),
          new Question({title: "Нужен кадастровый паспорт"}),
          new Question({title: "Нужна выписка ЕГРН"}),
          new Question({title: "Нужен Акт ввода в эксплуатацию"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу снизить налоги", children: [
          new Question({title: "Слишком высокий налог"}),
          new Question({title: "Возросла КС"}),
          new Question({title: "Кадастровая стоиомсть превышает рыночную"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно оформить право собственности", children: [
          new Question({title: "Я купил здание"}),
          new Question({title: "Здание досталось в наследство"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужна независимая оценка (Фадеева)", children: [
          new Question({title: "Я купил недвижимость"}),
          new Question({title: "Недвижимость досталась в наследство"}),
          new Question({title: "Хочу взять недвижимость в аренду"}),
          new Question({title: "Хочу  продать недвижимость"}),
          new Question({title: "Поставить на баланс недвижимость"}),
          new Question({title: "Страхование недвижимости"}),
          new Question({title: "Взять кредит"}),
          new Question({title: "Внести в уставной капитал"}),
          new Question({title: "Оспорить КС"}),
          new Question({title: "Изъятие/раздел/выкуп"}),
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу купить здание", children: [
          new Question({title: "Для личного пользования"}),
          new Question({title: "Для ведения предпринимательской деятельности"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу арендовать здание", children: [
          new Question({title: "Для ведения предпринимательской деятельности"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу начать строительство здания)", children: [
          new Question({title: "Нужна проектная и исходно-разрешительная документация"}),
          new Question({title: "Не могу получить разрешение на строительство"}),
          new Question({title: "Нужно изменить целевое назначение участка"}),
          new Question({title: "Нужно изменить ТЭП"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Здание уже построено)", children: [
          new Question({title: "Необходимо оформить право собственности"}),
          new Question({title: "Здание построено не по проекту"}),
          new Question({title: "Здание построено без разрешительной документации"})
        ]})
    ]}),


  new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Машины и оборудование", children: [
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужная оценка", children: [
          new Question({title: "Страхование машин и оборудования"}),
          new Question({title: "Долгосрочная аренда, лизинг"}),
          new Question({title: "Переоценка основных средств"}),
          new Question({title: "Ввоз оборудования из-за рубежа"}),
          new Question({title: "Списание"}),
          new Question({title: "Постановка на баланс"}),
          new Question({title: "Внесение в устаной капитал"}),
          new Question({title: "Определение ущерба"}),
          new Question({title: "Судебные цели"}),
          new Question({title: "Ликвидация"})
        ]})
    ]}),


  new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Бизнес", children: [
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужна оценка"}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Рестуктуризация предприятия", children: [
          new Question({title: "Ликвидация предприятия"}),
          new Question({title: "Слияние/поглощение"}),
          new Question({title: "Банкротство"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Повышение эффективности предприятия", children: [
          new Question({title: "Разработка бизнес-плана"}),
          new Question({title: "Маркетинговое исследование"}),
          new Question({title: "Проверка кредитоспособности предприятия"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Переоценка основных фондов", children: [
          new Question({title: "Оценка для МСФО"}),
        ]})
    ]}),


  new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "HMA", children: [
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Товарный знак", children: [
          new Question({title: "Поставить на баланс"}),
          new Question({title: "Заключить лицензионный договор"}),
          new Question({title: "Продать ТЗ"}),
          new Question({title: "Купить ТЗ"}),
          new Question({title: "Внести в уставной капитал"}),
          new Question({title: "Привлечь инвестора"}),
          new Question({title: "Получить кредит"}),
          new Question({title: "Роялти и лицензионные платежи"}),
          new Question({title: "Ущерб от незаконнного использования"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Ноу-хау, патент, промышленный образец, программное обеспечение, авторское право", children: [
          new Question({title: "Привлечь инвестора"}),
          new Question({title: "поставить на баланс"}),
          new Question({title: "Инвентаризация"}),
          new Question({title: "Получить кредит"}),
          new Question({title: "Заключить лицензионный договор"}),
          new Question({title: "для налога на имущество"}),
          new Question({title: "Внести в уставной капитал"})
        ]}),
      new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "ГудВилл", children: [
          new Question({title: "Определение купли-продажи бренда"}),
          new Question({title: "Ущерб от незаконного использования"}),
          new Question({title: "Право использования"}),
          new Question({title: "Роялти и лицензионные платежи"})
        ]})
    ]}),

]

// Create quiz
new Quiz(questions)

