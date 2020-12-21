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

        this.progressbarLevel++


        if (this.currentQuestion && this.currentQuestion.children) {
            this.arrayLinks.push(this.currentQuestion)
            this.choiceQuizTitleQuestion(this.currentQuestion)
            this.display()
            this.showLinks(this.currentQuestion)
            if (this.currentQuestion.displayForm === 'block') {
                this.assistant.classList.add('show')
                this.inputHiddenValue = this.arrayLinks
                this.inputHidden.value= this.inputHiddenValue.map(el => el.title).join(', ')
            }
        } else {
            // alert('finish, go to next page, last question id is' + id);
            // this.currentQuestion = lcq  // сделано чтобы работала навигация после окончания вопросов. в реальной версии можно убрать
            location.href = this.currentQuestion.linkPath
        }
    }

    showLinks() {
        let linkQuestion = this.arrayLinks.map(link => `<span data-type="breadcrumbs" data-id="${link.id}" data-pbar=${link.progressbarLevel}>${link.title}</span>`)
        this.links.innerHTML = linkQuestion.join('').toString()

        document.querySelectorAll("[data-type='breadcrumbs']").forEach(el => el.addEventListener('click',e => {
            this.currentQuestion = this.findParent(e.target.dataset.id,this.questions) //this.findQuestion(e.target.dataset.id,this.questions)
            console.log('this.currentQuestion', this.currentQuestion) //null приходит
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
        quizQuestionTitle ? this.quizQuestionTitle.innerHTML = quizQuestionTitle : this.quizQuestionTitle.innerHTML = 'что у вас?'
    }

    findParent(id,questions) {
        let p = null
        let q = null
        let cQ = []
        for (let i = 0; i < questions.length; i++) {
            q = questions[i]
            if (q.children) {
                p = q.children.find(q => q.id === id)
                if (p) break
                cQ = cQ.concat(q.children)
            }
        }
        if (p) return q
        else if (cQ.length) return this.findParent(id, cQ)
        else return null
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
            if (q.id === id) return q;
            if (q.children) {
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
        const assistantCards = document.querySelector('.assistant__cards')

        this.$progressbar.style.width = (this.progressbarLevel / this.progressbarMaxLevel * 100) + "%"
        assistantCards.innerHTML = ''

        for (let i = 0; i < questions.length; i++) {
            assistantCards.insertAdjacentHTML('beforeend', card.render(questions[i]))
        }

        assistantCards.querySelectorAll("a").forEach(el => el.addEventListener('click', event => {
            const linkCard = this.findParentBySelector(event.target, 'a.assistant__card')
            const id = linkCard.dataset.id
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

  new Question({
    quizQuestionTitle: 'Какая у Вас проблема?',
    title: 'Земельный участок',
    display: 'none',
    displayCard: 'block',
    displayForm: 'none',
    children: [
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему',
        title: 'Нужно подготовить документы в гос. органы',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен межевой план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен технический план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен отчёт об оценке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужна выписка ЕГРН',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу снизить налоги',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Слишком высокий налог',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Возросла КС',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Кадастровая стоимость превышает рыночную',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужно оформить право собственности',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Я купил землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужна независимая оценка',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу продать землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу поставить на баланс',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Изменить целевое назначение',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Хочу привести в соответствие с фактическим использованием',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу купить землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для личного пользования',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу арендовать землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Владею нежилым зданием, находящимся на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),

          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для сдачи в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу сделать межевание',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под продажу',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу начать строительство',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Купил земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Сопровождение получения ГПЗУ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Вывод из особо ценных земель',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Взял в аренду земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталось в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Нет моего варианта',
        title: 'Здесь нет моего варианта',
        display: 'none',
        displayCard: 'block',
        displayForm: 'block',
        children: [
          new Question({displayCard: 'none', displayForm: 'block'}),
        ],
      }),
    ],
  }),

  new Question({
    quizQuestionTitle: 'Какая у Вас проблема?',
    title: 'Нежилая недвижимость',
    display: 'none',
    displayCard: 'block',
    displayForm: 'none',
    children: [
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему',
        title: 'Нужно подготовить документы в гос. органы',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен технический план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужно заключение эксперта для легализации самовольной постройки',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Экспертиза зданий и сооружений',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен АГО/АГР',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Разработка Архитектурно-градостроительного решения (АГР) и (АГО)',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен кадастровый паспорт',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужна выписка ЕГРН',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен Акт ввода в эксплуатацию',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Экспертиза зданий и сооружений',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу снизить налоги',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Слишком высокий налог',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Вывод 700-ПП',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Возросла КС',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Кадастровая стоимость превышает рыночную',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужно оформить право собственности',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Я купил здание',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в договор аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Здание досталось в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в договор аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужна независимая оценка',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Внести в уставной капитал',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Взять кредит',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Экспертиза зданий и сооружений',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Я купил недвижимость',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Недвижимость досталась в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Оспорить КС',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Экспертиза зданий и сооружений',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Независимая оценка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять недвижимость в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Независимая оценка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу продать недвижимость',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Независимая оценка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поставить на баланс недвижимость',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Независимая оценка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Страхование недвижимости',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Независимая оценка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Изъятие/раздел/выкуп',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Независимая оценка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка арендной ставки',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оценка земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу купить здание',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для личного пользования',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для ведения предпринимательской деятельности',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу арендовать здание',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для ведения предпринимательской деятельности',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в договор аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу начать строительство здания',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Нужно изменить целевое назначение участка',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Не могу получить разрешение на строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Экспертиза зданий и сооружений',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительства',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужна проектная и исходно-разрешительная документация',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Разработка Архитектурно-Градостроительного Решения (АГР) и (АГО)',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужно изменить ТЭП',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Здание уже построено',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Здание построено без разрешительной документации',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Экспертиза зданий и сооружений',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Разработка Архитектурно-Градостроительного Решения (АГР) и (АГО)',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в договор аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Необходимо оформить право собственности',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в договор аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Здание построено не по проекту',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Ввод объекта в эксплуатацию, получение заключения о соответствии',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Экспертиза зданий и сооружений',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Разработка Архитектурно-Градостроительного решения (АГР) и (АГО)',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в договор аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Нет моего варианта',
        title: 'Здесь нет моего варианта',
        display: 'none',
        displayCard: 'block',
        displayForm: 'block',
        children: [
          new Question({displayCard: 'none', displayForm: 'block'}),
        ],
      }),
    ],
  }),

  new Question({
    quizQuestionTitle: 'Какая у Вас проблема?',
    title: 'Машины и оборудование',
    display: 'none',
    displayCard: 'block',
    displayForm: 'none',
    children: [
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему',
        title: 'Нужно подготовить документы в гос. органы',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен межевой план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен технический план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен отчёт об оценке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужна выписка ЕГРН',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу снизить налоги',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Слишком высокий налог',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Возросла КС',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Кадастровая стоимость превышает рыночную',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужно оформить право собственности',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Я купил землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужна независимая оценка',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу продать землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу поставить на баланс',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Изменить целевое назначение',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Хочу привести в соответствие с фактическим использованием',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу купить землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для личного пользования',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу арендовать землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Владею нежилым зданием, находящимся на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),

          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для сдачи в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу сделать межевание',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под продажу',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу начать строительство',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Купил земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Сопровождение получения ГПЗУ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Вывод из особо ценных земель',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Взял в аренду земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталось в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Нет моего варианта',
        title: 'Здесь нет моего варианта',
        display: 'none',
        displayCard: 'block',
        displayForm: 'block',
        children: [
          new Question({displayCard: 'none', displayForm: 'block'}),
        ],
      }),
    ],
  }),

  new Question({
    quizQuestionTitle: 'Какая у Вас проблема?',
    title: 'Бизнес',
    display: 'none',
    displayCard: 'block',
    displayForm: 'none',
    children: [
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему',
        title: 'Нужно подготовить документы в гос. органы',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен межевой план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен технический план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен отчёт об оценке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужна выписка ЕГРН',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу снизить налоги',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Слишком высокий налог',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Возросла КС',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Кадастровая стоимость превышает рыночную',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужно оформить право собственности',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Я купил землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужна независимая оценка',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу продать землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу поставить на баланс',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Изменить целевое назначение',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Хочу привести в соответствие с фактическим использованием',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу купить землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для личного пользования',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу арендовать землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Владею нежилым зданием, находящимся на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),

          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для сдачи в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу сделать межевание',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под продажу',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу начать строительство',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Купил земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Сопровождение получения ГПЗУ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Вывод из особо ценных земель',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Взял в аренду земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталось в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Нет моего варианта',
        title: 'Здесь нет моего варианта',
        display: 'none',
        displayCard: 'block',
        displayForm: 'block',
        children: [
          new Question({displayCard: 'none', displayForm: 'block'}),
        ],
      }),
    ],
  }),

  new Question({
    quizQuestionTitle: 'Какая у Вас проблема?',
    title: 'HMA',
    display: 'none',
    displayCard: 'block',
    displayForm: 'none',
    children: [
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему',
        title: 'Нужно подготовить документы в гос. органы',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен межевой план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен технический план',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужен отчёт об оценке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Нужна выписка ЕГРН',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу снизить налоги',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Слишком высокий налог',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Возросла КС',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Кадастровая стоимость превышает рыночную',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужно оформить право собственности',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Я купил землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Легализация самовольных построек',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Нужна независимая оценка',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталась земля в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу продать землю',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу взять землю в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу поставить на баланс',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Оценка недвижимости',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Оспаривание КС',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Изменить целевое назначение',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Хочу привести в соответствие с фактическим использованием',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу купить землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для личного пользования',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смена Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу арендовать землю',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title:
              'Владею нежилым зданием, находящимся на земельном участке',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу начать строительство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),

          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Для сдачи в аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Хочу вести бизнес',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Сопровождение предоставления земельных участков, в аренду/собственность, в том числе на торгах',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу сделать межевание',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под продажу',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Поделить землю под аренду',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Уточним Вашу проблему?',
        title: 'Хочу начать строительство',
        display: 'none',
        displayCard: 'block',
        displayForm: 'none',
        children: [
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Купил земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Кадастровые работы',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Смена ВРИ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в договор аренды земельного участка',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Сопровождение получения ГПЗУ',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Продление договора аренды',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Вывод из особо ценных земель',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Взял в аренду земельный участок',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Градостроительный аудит',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Перераспределение земельных участков, находящихся в государственной/частной собственности',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Вам будут полезны эти услуги',
            title: 'Досталось в наследство',
            display: 'none',
            displayCard: 'block',
            displayForm: 'none',
            children: [
              new Question({
                title: 'Внесение изменений в ЕГРН',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Постановка на кадастровый учет',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title:
                  'Внесение изменений в ПЗЗ, в части смены Технико-Экономических Показателей',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                title: 'Снятие запрета на строительство',
                display: 'block',
                linkPath: 'https://google.com',
              }),
              new Question({
                quizQuestionTitle: 'Нет моего варианта',
                title: 'Здесь нет моего варианта',
                display: 'none',
                displayCard: 'block',
                displayForm: 'block',
                children: [
                  new Question({
                    displayCard: 'none',
                    displayForm: 'block',
                  }),
                ],
              }),
            ],
          }),
          new Question({
            quizQuestionTitle: 'Нет моего варианта',
            title: 'Здесь нет моего варианта',
            display: 'none',
            displayCard: 'block',
            displayForm: 'block',
            children: [
              new Question({displayCard: 'none', displayForm: 'block'}),
            ],
          }),
        ],
      }),
      new Question({
        quizQuestionTitle: 'Нет моего варианта',
        title: 'Здесь нет моего варианта',
        display: 'none',
        displayCard: 'block',
        displayForm: 'block',
        children: [
          new Question({displayCard: 'none', displayForm: 'block'}),
        ],
      }),
    ],
  }),
]

// Create quiz
new Quiz(questions)
