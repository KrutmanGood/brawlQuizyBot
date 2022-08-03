import { Markup } from 'telegraf'

const buttons = {
    menuButtons: [
        [
            Markup.button.callback('🎯 Профиль', 'balanceButton'), Markup.button.callback('❓ Мои вопросы', 'questionButton'),
        ],
        [
            Markup.button.callback('⛳️ О боте', 'aboutBotButton'), Markup.button.callback('📩 Поддержка', 'supportButton'),
        ],
        [
            Markup.button.callback('✨ Помощь', 'aboutCommandsButton'),
        ],
    ],
    answerOptions: [
        [
            Markup.button.callback('Илкка Паананен', 'firstOption')
        ],
        [
            Markup.button.callback('Микко Кодисойя', 'secondOption')
        ],
    ],
    sendFirstQuestionBtn: [
        [
            Markup.button.callback('Ответить на первый вопрос', 'sendFirstQuestionBtn')
        ],
    ],
    answerAgain: [
        [
            Markup.button.callback('Ответить на первый вопрос', 'answerAgain')
        ]
    ],
    newUser: [
        [
            Markup.button.callback('Проверить подписку', 'newUser')
        ],
    ],
    adminFunctions: [
        [
            Markup.button.callback('📝 Создать вопрос', 'createQuestion'),
        ],
        [
            Markup.button.callback('🗑 Удалить вопросы', 'deleteMenu')
        ],
        [
            Markup.button.callback('📊 Статистика', 'statistic')
        ],
        [
            Markup.button.callback('Вернуться назад', 'cancel1'),
        ],
    ],
    cancelButton: [
        [
            Markup.button.callback('Отменить действие', 'cancel'),
        ]
    ],
    notNewUser: [
        [
            Markup.button.callback('Проверить подписку', 'notNewUser')
        ]
    ],
    
    deleteButtons: [
        [
            Markup.button.callback('🗑 Удалить последний вопрос', 'deleteMenu')
        ],
        [
            Markup.button.callback('🗑 Удалить все вопросы', 'deleteMenu')
        ],
        [
            Markup.button.callback('Отменить действие', 'cancel'),
        ],
    ],
}

export default buttons