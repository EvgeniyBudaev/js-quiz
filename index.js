class Quiz {
    constructor(questions) {

        this.$progressbar = document.getElementById("progressbar")
        this.progressbarMaxLevel = 0 // for generate card levels
        this.progressbarLevel = 1

        this.assistant = document.querySelector('[data-assistant=""]')

        this.questions = questions
        this.generateId(this.questions,2)
        this.currentQuestion = null

        this.arrayLinks = []
        this.links = document.querySelector('[data-quiz-links=""]')

        this.inputHidden = document.querySelector('[data-input="hidden"]')
        this.inputHiddenValue = null

        this.quizQuestionTitle = document.querySelector('[data-quiz-question=""]')
        this.display()
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
        // console.log('this.currentQuestion', this.currentQuestion)

        this.progressbarLevel++


        if (this.currentQuestion && this.currentQuestion.children) {
            this.arrayLinks.push(this.currentQuestion)
            this.choiceQuizTitleQuestion(this.currentQuestion)
            this.display()
            this.showLinks(this.currentQuestion)
            //console.log('this.currentQuestion', this.currentQuestion)
            if (this.currentQuestion.displayForm === 'block') {
                this.assistant.classList.add('show')
                // console.log('this.assistant', this.assistant)
                this.inputHiddenValue = this.arrayLinks
                //console.log('this.inputHiddenValue', this.inputHiddenValue)
                this.inputHidden.value= this.inputHiddenValue.map(el => el.title).join(', ')
                //console.log('this.inputHidden.value', this.inputHidden.value)
            }
        } else {
            // alert('finish, go to next page, last question id is' + id);
            // this.currentQuestion = lcq  // сделано чтобы работала навигация после окончания вопросов. в реальной версии можно убрать
            //console.log('this.currentQuestion', this.currentQuestion)
            location.href = this.currentQuestion.linkPath
        }
    }

    showLinks() {
        //console.log('this.arrayLinks', this.arrayLinks)
        let linkQuestion = this.arrayLinks.map(link => `<span data-type="breadcrumbs" data-id="${link.id}" data-pbar=${link.progressbarLevel}>${link.title}</span>`)
        this.links.innerHTML = linkQuestion.join('').toString()

        document.querySelectorAll("[data-type='breadcrumbs']").forEach(el => el.addEventListener('click',e => {
            //console.log('e.target.dataset.id', e.target.dataset.id)
            //console.log('this.questions', this.questions)
            this.currentQuestion = this.findParent(e.target.dataset.id,this.questions) //this.findQuestion(e.target.dataset.id,this.questions)
            //console.log('this.currentQuestion', this.currentQuestion)
            if (this.currentQuestion) {
                this.progressbarLevel = this.currentQuestion.progressbarLevel
                this.display()
                const parent = this.findParent(this.currentQuestion.id,this.questions)
                if (parent) {
                    const pparent = this.findParent(parent.id,this.questions)
                    if (pparent) {
                        this.arrayLinks = [pparent,parent,this.currentQuestion]
                    } else {
                        this.arrayLinks = [parent,this.currentQuestion]
                    }
                } else {
                    this.arrayLinks = [this.currentQuestion]
                }
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
        //console.log('quizQuestionTitle', quizQuestionTitle)
        quizQuestionTitle ? this.quizQuestionTitle.innerHTML = quizQuestionTitle : this.quizQuestionTitle.innerHTML = 'что у вас?'
    }

    findParent(id,questions) {

        // console.log(id)

        // console.log(questions)

        for (let i = 0; i < questions.length; i++) {

            const q = questions[i]
            if (q.children) {
                const child = q.children.find(q => q.id == id)
                
                if (child) {
                    return q
                } else {
                    return this.findParent(id,q.children)
                }
            } else return null
        }

    }

    findAllParents(id, questions) { // return array of Questions

        const el = this.findParent(id, questions)
        if (el) {
            const p = this.findParent(el.id, questions)
            if (p) {
                return [...Array.from(p)]
            } else {
                return [...Array.from(el)]
            }
        } else {
            return [...Array.from(el)]
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

    collectionHas(a, b) {
        for(let i = 0, len = a.length; i < len; i ++) {
            if(a[i] == b) return true;
        }
        return false;
    }

    findParentBySelector(elm, selector) {
        const all = document.querySelectorAll(selector);
        let cur = elm;
        while(cur && !this.collectionHas(all, cur)) { //keep going up until you find a match
            cur = cur.parentNode; //go up
        }
        return cur; //will return null if not found
    }

    display() {
        this.assistant.classList.remove('show')
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
            // console.log('event.target', event.target)
            const linkCard = this.findParentBySelector(event.target, 'a.assistant__card')
            // console.log('menuElement', linkCard)
            const id = linkCard.dataset.id
            // console.log('id', id)
            this.quess(id)
            event.stopPropagation()

        }, true))
    }
}


class Question {
    constructor(params) {
        this.quizQuestionTitle = params.quizQuestionTitle
        this.title = params.title
        this.display = params.display
        this.children = params.children
        this.linkPath = params.linkPath
        this.displayCard = params.displayCard
        this.displayForm = params.displayForm
    }
}


class Card {
    constructor(choice) {
        this.choice = choice
    }

    render(choice) {
        // console.log('choice', choice)
        return `
          <a class="assistant__card" data-id=${choice.id} data-card="true" style="display: ${choice.displayCard}">
          <div class="assistant__card-wrapper">
            <div class="assistant__card-content">${choice.title}</div>
            <div class="assistant__card-footer">
                  <span class="arrow-link" style="display: ${choice.display}">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 23.76 12"
                  >
                    <defs><path id="head" fill="#00293c"></path></defs>
                    <title>arrow-blue</title>
                    <g id="Слой_2" data-name="Слой 2">
                      <g id="Слой_1-2" data-name="Слой 1">
                        <g id="Слой_2-2" data-name="Слой 2">
                          <g id="Слой_1-2-2" data-name="Слой 1-2">
                            <polygon
                              class="cls-1"
                              points="9.55 6.04 6.04 12 7.49 12 11.29 6.18 11.29 5.88 7.49 0 6.04 0 9.55 6.04"
                            />
                            <polygon
                              class="cls-1"
                              points="0 0 3.51 6.04 0 12 1.46 12 5.26 6.18 5.26 5.88 1.46 0 0 0"
                            />
                            <polygon
                              class="cls-1"
                              points="22.01 6.04 18.5 12 19.96 12 23.76 6.18 23.76 5.88 19.96 0 18.5 0 22.01 6.04"
                            />
                            <polygon
                              class="cls-1"
                              points="15.97 6.04 12.46 12 13.92 12 17.72 6.18 17.72 5.88 13.92 0 12.46 0 15.97 6.04"
                            />
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                  перейти к услуге
                </span>
            </div>
          </div>
          </a>
        `
    }
}

const card = new Card()


// Data
let questions = [
    new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Земельный участок", display: "none", displayCard: "block", displayForm: "none", children: [
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно подготовить документы в гос. органы", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({quizQuestionTitle: "Последний шаг", title: "Нужен межевой план", display: "none", displayCard: "block", displayForm: "none", children: [
                            new Question({title: "Услуга 1", display: "block", linkPath:"https://yandex.ru"}),
                            new Question({title: "Услуга 2", display: "block", linkPath:"https://google.com"}),
                            new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                                    new Question({displayCard: "none", displayForm: "block"}),
                                ]}),
                        ]}),
                    new Question({title: "Нужен технический план", display: "none", displayCard: "block", displayForm: "none", linkPath:"https://yandex.ru"}),
                    new Question({title: "Нужен отчет об оценке", display: "none", displayCard: "block", displayForm: "none", linkPath:"https://www.amcharts.com/demos/"}),
                    new Question({title: "Нужна выписка ЕГРН", display: "none", displayCard: "block", displayForm: "none", linkPath:"https://www.mazars.com/"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу снизить налоги", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Слишком высокий налог", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Возросла КС", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Кадастрвоая стоимость превышает рыночную", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно оформить право собственности", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Я купил землю", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Досталась земля в наследство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу взять землю в аренду", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужна независимая оценка (Фадеева)", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Досталась земля в наследство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу продать землю", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу взять землю в аренду", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу поставить на баланс", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Изменить целевое назначение", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Хочу начать строительство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу привести в соответствии с фактическим использованием", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу вести бизнес на земельном участке", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу купить землю", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Хочу начать строительство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Для личного использования", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу вести бизнес", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу арендовать землю", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Владею нежилым зданием, находящимся на зем. участке", displayCard: "block", displayForm: "none"}),
                    new Question({title: "Хочу начать строительство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Для сдачи в аренду", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу вести бизнес", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу сделать межевание", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Поделить землю под продажу", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Поделить землю под аренду", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу начать строительство", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Купить земельный участок", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Взял в аренду земельный участок", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "достался в наследство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                            new Question({displayCard: "none", displayForm: "block"}),
                        ]}),
                ]}),
            new Question({quizQuestionTitle: "Нет моего варианта", title: "Здесь нет моего варианта", display: "none", displayCard: "block", displayForm: "block", children: [
                    new Question({displayCard: "none", displayForm: "block"}),
                ]}),
        ]}),


    new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Нежилая недвижимость", display: "none", displayCard: "block", displayForm: "none", children: [
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно подготовить документы в гос.органы", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Нужен технический план", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Нужно заключение эксперта для легализации самовольной постройки", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Нужен АГО/АГР", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Нужен кадастровый паспорт", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Нужна выписка ЕГРН", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Нужен Акт ввода в эксплуатацию", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", displayCard: "block", displayForm: "none", title: "Хочу снизить налоги", display: "none", children: [
                    new Question({title: "Слишком высокий налог", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Возросла КС", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Кадастровая стоиомсть превышает рыночную", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужно оформить право собственности", displayCard: "block", displayForm: "none", display: "none", children: [
                    new Question({title: "Я купил здание", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Здание досталось в наследство", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужна независимая оценка (Фадеева)", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Я купил недвижимость", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Недвижимость досталась в наследство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу взять недвижимость в аренду", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Хочу  продать недвижимость", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Поставить на баланс недвижимость", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Страхование недвижимости", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Взять кредит", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Внести в уставной капитал", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Оспорить КС", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Изъятие/раздел/выкуп", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу купить здание", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Для личного пользования", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Для ведения предпринимательской деятельности", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу арендовать здание", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Для ведения предпринимательской деятельности", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Хочу начать строительство здания)", displayCard: "block", displayForm: "none", display: "none", children: [
                    new Question({title: "Нужна проектная и исходно-разрешительная документация", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Не могу получить разрешение на строительство", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Нужно изменить целевое назначение участка", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Нужно изменить ТЭП"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Здание уже построено)", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Необходимо оформить право собственности", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Здание построено не по проекту", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Здание построено без разрешительной документации", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]})
        ]}),


    new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Машины и оборудование", display: "none", displayCard: "block", displayForm: "none", children: [
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужная оценка", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Страхование машин и оборудования", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Долгосрочная аренда, лизинг", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Переоценка основных средств", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Ввоз оборудования из-за рубежа", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Списание", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Постановка на баланс", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Внесение в устаной капитал", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Определение ущерба", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Судебные цели", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Ликвидация", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]})
        ]}),


    new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "Бизнес", display: "none", displayCard: "block", displayForm: "none", children: [
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Нужна оценка", displayCard: "block", displayForm: "none"}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Рестуктуризация предприятия", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Ликвидация предприятия", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Слияние/поглощение", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Банкротство", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Повышение эффективности предприятия", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Разработка бизнес-плана", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Маркетинговое исследование", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                    new Question({title: "Проверка кредитоспособности предприятия", displayCard: "block", displayForm: "none", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Переоценка основных фондов", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Оценка для МСФО", displayCard: "block", displayForm: "none", linkPath:"./index.html"}),
                ]})
        ]}),


    new Question({quizQuestionTitle: "Какая у Вас проблема?", title: "HMA", display: "none", displayCard: "block", displayForm: "none", children: [
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Товарный знак", children: [
                    new Question({title: "Поставить на баланс", linkPath:"./index.html"}),
                    new Question({title: "Заключить лицензионный договор", linkPath:"./index.html"}),
                    new Question({title: "Продать ТЗ", linkPath:"./index.html"}),
                    new Question({title: "Купить ТЗ", linkPath:"./index.html"}),
                    new Question({title: "Внести в уставной капитал", linkPath:"./index.html"}),
                    new Question({title: "Привлечь инвестора", linkPath:"./index.html"}),
                    new Question({title: "Получить кредит", linkPath:"./index.html"}),
                    new Question({title: "Роялти и лицензионные платежи", linkPath:"./index.html"}),
                    new Question({title: "Ущерб от незаконнного использования", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "Ноу-хау, патент, промышленный образец, программное обеспечение, авторское право", display: "none", displayCard: "block", displayForm: "none", children: [
                    new Question({title: "Привлечь инвестора", linkPath:"./index.html"}),
                    new Question({title: "поставить на баланс", linkPath:"./index.html"}),
                    new Question({title: "Инвентаризация", linkPath:"./index.html"}),
                    new Question({title: "Получить кредит", linkPath:"./index.html"}),
                    new Question({title: "Заключить лицензионный договор", linkPath:"./index.html"}),
                    new Question({title: "для налога на имущество", linkPath:"./index.html"}),
                    new Question({title: "Внести в уставной капитал", linkPath:"./index.html"})
                ]}),
            new Question({quizQuestionTitle: "Уточним Вашу проблему?", title: "ГудВилл", children: [
                    new Question({title: "Определение купли-продажи бренда", linkPath:"./index.html"}),
                    new Question({title: "Ущерб от незаконного использования", linkPath:"./index.html"}),
                    new Question({title: "Право использования", linkPath:"./index.html"}),
                    new Question({title: "Роялти и лицензионные платежи", linkPath:"./index.html"})
                ]})
        ]}),



]

// Create quiz
new Quiz(questions)
