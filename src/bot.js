import { Telegraf, Markup, session } from 'telegraf'
import error from './report.js'
import config from './config.js'
import User from './models/user.js'
import Question from './models/question.js'
import Count from './models/count.js'
import buttons from './buttons.js'
import { getTime } from './utils.js'

const bot = new Telegraf(config.brawlQuizyBotToken)
bot.use(session())

bot.start(async ctx => {
    const messageInfo = ctx.update.message
    ctx.session = ctx.session || {}

    try {
        const isStarted = await User.findOne({
            id: messageInfo.from.id
        })

        if (isStarted) {
            await ctx.telegram.sendMessage(messageInfo.from.id, `Перед использованием бота, тебе необходимо подписаться на канал @in_brawl.\n\nКак только подпишешься, нажми на кнопку ниже, чтобы мы могли убедиться в достоверности подписки.`, {
                reply_markup: { inline_keyboard: buttons.notNewUser },
            })

            return
        } else {
            await ctx.telegram.sendMessage(messageInfo.from.id, `Перед использованием бота, тебе необходимо подписаться на канал @in_brawl.\n\nКак только подпишешься, нажми на кнопку ниже, чтобы мы могли убедиться в достоверности подписки.`, {
                reply_markup: { inline_keyboard: buttons.newUser },
            })

            const correctCount = await Count.findOne({
                isCorrect: true,
            })
    
            const newCount = correctCount.count + 1
    
            await Count.updateOne({
                isCorrect: true,
            }, {
                count: newCount
            })

            return
        }
    } catch(e) {
        error(e, '/satrt', messageInfo.from.id)
    }
})

bot.command('admin', async ctx => {
    const messageInfo = ctx.update.message
    ctx.session = ctx.session || {}

    try {
        if (config.adminId.includes(messageInfo.from.id)) {
            await ctx.telegram.sendMessage(messageInfo.from.id, 'Выберите необходимую команду из списка ниже:', {
                reply_markup: { keyboard: buttons.adminFunctions, resize_keyboard: true }
            })
        }
    } catch(e) {
        error(e, '/admin', messageInfo.from.id)
    }
})

bot.command('creator', async ctx => {
    ctx.telegram.sendMessage(ctx.update.message.from.id, `Бота создал @krutman_good.\n\nПодробнее о его работах можно узнать тут: @krutmanProgramming.`)
})

bot.action(/.+/, async ctx => {
    const callbackInfo = ctx.update.callback_query
    ctx.session = ctx.session || {}

    const clicksButtons = ['firstOption', 'secondOption', 'secondOption', 'notNewUser', 'notDelete', 'sendFirstQuestionBtn', 'correctResultButton', 'notCorrectResultButton', 'want', 'notWant']

    if (ctx.session.buttonId === callbackInfo.data && clicksButtons.includes(ctx.session.buttonId)) {
        ctx.answerCbQuery('Не стоит кликать на кнопку так часто!', { show_alert: true })

        return
    } else {
        ctx.session.buttonId = callbackInfo.data

        const buttonsId = ['firstOption', 'secondOption', 'answerAgain', 'newUser', 'notNewUser', 'delete', 'notDelete', 'withdraw', 'sendFirstQuestionBtn', 'deleteLast', 'correctResultButton', 'notCorrectResultButton', 'want', 'notWant']

        if (buttonsId.includes(callbackInfo.data)) {
            try {
                if (callbackInfo.data === 'firstOption') {
                    answerToFirstQuestion(ctx)
    
                    return
                }
            } catch(e) {
                error(e, 'Илкка Паананен', callbackInfo.from.id)
            }
            
            try {
                if (callbackInfo.data === 'secondOption') {
                    answerToFirstQuestion(ctx)

                    return
                }
            } catch(e) {
                error(e, 'Микко Кодисойя', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'answerAgain') {
                    ctx.answerCbQuery('Ты уже ответил/а на этот вопрос!', { show_alert: true })
    
                    return
                }
            } catch(e) {
                error(e, 'Ответить на первый вопрос (снова)', callbackInfo.from)
            }

            try {
                if (callbackInfo.data === 'newUser') {
                    const follow = await ctx.telegram.getChatMember(config.sponsor, callbackInfo.from.id)
    
                    if (follow.status === 'member') {
                        ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
    
                        await ctx.telegram.sendMessage(callbackInfo.from.id, '👋')
                        await ctx.telegram.sendMessage(callbackInfo.from.id, `*Привет, Боец!*\n\nТут ты сможешь заработать гемы, отвечая на несложные вопросы по игре Brawl Stars.\n\nИтак, для начала давай введем тебя в курс дела:\n\nДля этого ответь на вопрос, нажав на кнопку ниже.`, {
                            parse_mode: 'Markdown',
                            reply_markup: { inline_keyboard: buttons.sendFirstQuestionBtn },
                        })
    
                        if (callbackInfo.from.username === undefined || callbackInfo.from.last_name === undefined || callbackInfo.from.username === undefined && callbackInfo.from.last_name === undefined) {
                            if (callbackInfo.from.last_name === undefined && callbackInfo.from.username === undefined) {
                                await User.create({
                                    first_name: callbackInfo.from.first_name,
                                    last_name: 'не указанo',
                                    username: 'не указанo',
                                    id: callbackInfo.from.id,
                                })
    
                                return
                            }
                            
                            if (callbackInfo.from.username === undefined) {
                                await User.create({
                                    first_name: callbackInfo.from.first_name,
                                    last_name: callbackInfo.from.last_name,
                                    username: 'не указан',
                                    id: callbackInfo.from.id,
                                })
    
                                return
                            }
    
                            if (callbackInfo.from.last_name === undefined) {
                                await User.create({
                                    first_name: callbackInfo.from.first_name,
                                    last_name: 'не указанo',
                                    username: callbackInfo.from.username,
                                    id: callbackInfo.from.id,
                                })
    
                                return
                            }
                        } else {
                            await User.create({
                                first_name: callbackInfo.from.first_name,
                                last_name: callbackInfo.from.last_name,
                                username: callbackInfo.from.username,
                                id: callbackInfo.from.id,
                            })
                        }
    
                        
                    } else {
                        ctx.answerCbQuery(`Вы не подписаны на канал!`, { show_alert: true })
                    }
    
                    return
                }
            } catch(e) {
                error(e, 'Проверить подписку (новый пользователь)', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'notNewUser') {
                    const follow = await ctx.telegram.getChatMember(config.sponsor, callbackInfo.from.id)

                    if (follow.status === 'member') {
                        ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
    
                        await ctx.telegram.sendMessage(callbackInfo.from.id, `Меню кнопок:`, {
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: buttons.menuButtons, resize_keyboard: true, },
                        })
                    } else {
                        ctx.answerCbQuery(`Вы не подписаны на канал!`, { show_alert: true })
                    }
    
                    return
                }
            } catch(e) {
                error(e, 'Проверить подписку (не новый пользователь)', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'delete') {
                    const questions = await Question.find({
                        isArchive: false
                    })
    
                    questions.forEach(async el => {
                        const questionId = el.questionId
    
                        await Question.updateOne({
                            questionId: questionId,
                        }, {
                            isArchive: true,
                        })
                    })
    
                    await ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
                    await ctx.answerCbQuery('Все вопросы успешно удалены!', { show_alert: true })
                    await ctx.telegram.sendMessage(callbackInfo.from.id, 'Выберите необходимую команду из списка ниже:', {
                        reply_markup: { keyboard: buttons.adminFunctions, resize_keyboard: true }
                    })
    
                    return
                }
            } catch(e) {
                error(e, '🗑 Удалить все вопросы -> Да', callbackInfo.from.id)


            }

            try {
                if (callbackInfo.data === 'deleteLast') {
                    const questions = await Question.find({
                        isArchive: false,
                    })

                    if (questions[0]) {
                        const questionId = questions.length - 1
                        const question = questions[questionId]

                        await Question.updateOne({
                            questionId: question.questionId
                        }, {
                            isArchive: true,
                        })
    
                        await ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
                        await ctx.answerCbQuery('Вопрос был успешно удален!', { show_alert: true })
                        await ctx.telegram.sendMessage(callbackInfo.from.id, 'Выберите необходимую команду из списка ниже:', {
                            reply_markup: { keyboard: buttons.adminFunctions, resize_keyboard: true }
                        })
                    } else {
                        await ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
                        await ctx.answerCbQuery('Последнего вопроса не найдено', { show_alert: true })
                    }
                
                    return
                }
            } catch(e) {
                error(e, '🗑 Удалить последний вопрос -> Да', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'notDelete') {
                    await ctx.telegram.sendMessage(callbackInfo.from.id, 'Действие отменено', {
                        reply_markup: { keyboard: buttons.adminFunctions, resize_keyboard: true }
                    })
                    await ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
    
                    return
                }
            } catch(e) {
                error(e, '🗑 Удалить последний вопрос -> Нет или 🗑 Удалить все вопросы -> Нет', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'withdraw') {
                    const user = await User.findOne({
                        id: callbackInfo.from.id
                    })
    
                    if (!user.isWithdraw) {
                        await User.updateOne({
                            id: callbackInfo.from.id
                        }, {
                            isWithdraw: true,
                        })
    
                        const writeToUser = [
                            [
                                Markup.button.url('Написать пользователю', `tg://user?id=${callbackInfo.from.id}`)
                            ], 
                            [
                                Markup.button.callback('☑️ Готово', `checkedWithdraw/${callbackInfo.from.id}`)
                            ]
                        ]
                        const time = getTime()
        
                        ctx.telegram.sendMessage(config.moderationGroupId, `Пользователь [${callbackInfo.from.first_name}](tg://user?id=${callbackInfo.from.id}) хочет вывести гемы со счета.\n\nЕго баланс: *${user.balance.toFixed(1)} гемов*.\nВремя отправки: ${time} 🕓`, {
                            parse_mode: 'Markdown',
                            reply_markup: { inline_keyboard: writeToUser },
                        })
        
                        ctx.answerCbQuery('Твоя заявка подана модератору на рассмотрение\n\nМодератор напишет тебе в лс по этому поводу, как только будет свободен', { show_alert: true })
                    } else {
                        ctx.answerCbQuery('Твоя заявка все еще проверяется, потерпи!', { show_alert: true })
                    }
    
                    return
                }
            } catch(e) {
                error(e, 'Вывести', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'sendFirstQuestionBtn') {
                    await ctx.telegram.editMessageReplyMarkup(callbackInfo.from.id, callbackInfo.message.message_id, callbackInfo.message.message_id, { inline_keyboard: buttons.answerAgain })
    
                    ctx.answerCbQuery('Подсказка: оба варианта верны', { show_alert: true })
    
                    const firstQuestionInfo = await ctx.telegram.sendPhoto(callbackInfo.from.id, config.firstQuestionImage, {
                        caption: '*Кто был основателем компании Supercell?*\n\nСтатус: #открыт\nНаграда: *0.1 гем*                        ',
                        parse_mode: 'Markdown',
                    })

                    ctx.answerCbQuery('Подсказка: оба варианта верны 1', { show_alert: true })

                    await ctx.telegram.editMessageReplyMarkup(callbackInfo.from.id, firstQuestionInfo.message_id, firstQuestionInfo.message_id, { inline_keyboard: buttons.answerOptions })

                    return
                }
            } catch(e) {
                error(e, 'Ответить на первый вопрос', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'correctResultButton') {
                    ctx.answerCbQuery('Ты ответил/а правильно!', { show_alert: true })
    
                    return
                }
            } catch(e) {
                error(e, '⏳ Результат (верный)', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'notCorrectResultButton') {
                    ctx.answerCbQuery('Ты не угадал/а с ответом :(', { show_alert: true })
    
                    return
                }
            } catch(e) {
                error(e, '⏳ Результат (не верный)', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'want') {
                    await ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
    
                    await User.updateOne({
                        id: callbackInfo.from.id
                    }, {
                        isNotifications: false,
                    })

                    console.log('1')
                    
                    await User.updateOne({
                        id: callbackInfo.from.id
                    }, {
                        notifications: true,
                    })
                    questions(ctx)
    
                    return
                }
            } catch(e) {
                error(e, 'Да (хочу получать уведомления)', callbackInfo.from.id)
            }

            try {
                if (callbackInfo.data === 'notWant') {
                    await ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.message.message_id)
    
                    await User.updateOne({
                        id: callbackInfo.from.id
                    }, {
                        isNotifications: false,
                    })
                    
                    await User.updateOne({
                        id: callbackInfo.from.id
                    }, {
                        notifications: false,
                    })
                    questions(ctx)
                    
                    return
                }
            } catch(e) {
                error(e, 'Нет (не хочу получать уведомления)', callbackInfo.from.id)
            }
        } else {
            const buttonElements = callbackInfo.data.split('/')

            if (buttonElements[1] && buttonElements[0] === 'checkedWithdraw') {
                try {
                    const messageId = callbackInfo.message.message_id
                    const time = getTime()
        
                    await User.updateOne({
                        id: buttonElements[1]
                    }, {
                        isWithdraw: false,
                    })
        
                    ctx.telegram.editMessageText(config.moderationGroupId, messageId, messageId, `*Заявка проверена успешно!*\n\nПроверено в ${time} 🕓`, {
                        parse_mode: 'Markdown',
                    })
        
                    return
                } catch(e) {
                    error(e, '☑️ Готово', callbackInfo.from.id)
                }
            } else {
                try {
                    const question = await Question.findOne({
                        questionId: +buttonElements[0] 
                    })
                    const user = await User.findOne({
                        id: callbackInfo.from.id
                    })
        
                    const answerType = buttonElements[1]

                    if (user.answeredQuestions.includes(question.questionId)) {
                        ctx.answerCbQuery('Вы уже отвечали на этот вопрос!', { show_alert: true })
                    } else {
                        if (question) {
                            if (answerType === '+') {
                                const correctResultButton = [
                                    [
                                        Markup.button.callback('⏳ Результат', 'correctResultButton'),
                                    ],
                                ]
            
                                const newBalance = +user.balance.toFixed(1) + +question.price
                                const newAnsweredQuestionsCount = user.answeredQuestionsCount + 1
                                const newArrayWithAnsweredQuestions = user.answeredQuestions
                                newArrayWithAnsweredQuestions.push(buttonElements[0])
            
                                await ctx.telegram.editMessageReplyMarkup(callbackInfo.from.id, callbackInfo.message.message_id, callbackInfo.message.message_id, { inline_keyboard: correctResultButton })
            
                                ctx.answerCbQuery(`Вы ответили правильно!\nНа ваш баланс зачислено +${question.price} гемов.\n\nВаш баланс: ${newBalance.toFixed(1)} гемов.`, { show_alert: true })
            
                                await User.updateOne({
                                    id: callbackInfo.from.id,
                                }, {
                                    balance: newBalance
                                })
                                await User.updateOne({
                                    id: callbackInfo.from.id,
                                }, {
                                    answeredQuestionsCount: newAnsweredQuestionsCount
                                })
                                await User.updateOne({
                                    id: callbackInfo.from.id,
                                }, {
                                    answeredQuestions: newArrayWithAnsweredQuestions,
                                })
                            }
            
                            if (answerType === '-') {
                                const notCorrectResultButton = [
                                    [
                                        Markup.button.callback('⏳ Результат', 'notCorrectResultButton'),
                                    ],
                                ]
            
                                const newAnsweredQuestionsCount = user.answeredQuestionsCount + 1
                                const newArrayWithAnsweredQuestions = user.answeredQuestions
                                newArrayWithAnsweredQuestions.push(buttonElements[0])
    
                                console.log(ctx.session.mesId)
            
                                await ctx.telegram.editMessageReplyMarkup(callbackInfo.from.id, callbackInfo.message.message_id, callbackInfo.message.message_id, { inline_keyboard: notCorrectResultButton })
                                    
                                ctx.answerCbQuery(`Ответ не верный!\n\nВаш баланс: ${user.balance.toFixed(1)} гемов.`, { show_alert: true })
            
                                await User.updateOne({
                                    id: callbackInfo.from.id,
                                }, {
                                    answeredQuestionsCount: newAnsweredQuestionsCount,
                                })
                                await User.updateOne({
                                    id: callbackInfo.from.id,
                                }, {
                                    answeredQuestions: newArrayWithAnsweredQuestions,
                                })
                            }
                        }
                    }

                    return
                } catch(e) {
                    error(e, 'Ответ на вопрос (кнопки с вариантами ответа)', callbackInfo.from.id)
                }
            }
        }
    }
})

bot.on('sticker', ctx => console.log(ctx.update.message))

bot.on('message', async ctx => {
    const messageInfo = ctx.update.message
    ctx.session = ctx.session || {}

    const buttonsNames = ['Ответить на первый вопрос', '⛳️ О боте', '📩 Поддержка', '❓ Мои вопросы', '🎯 Профиль', 'Отменить действие', '✨ Помощь', 'Вернуться назад', 'Да', 'Нет', '📊 Статистика']

    if (buttonsNames.includes(messageInfo.text)) {
        try {
            if (messageInfo.text === '⛳️ О боте') {
                ctx.telegram.sendMessage(messageInfo.chat.id, `*Единственный бот, в котором можно получить гемы за знания о игре Brawl Stars:* \n\n💰 За 1 правильный ответ можно получить *от 0,5 до 5 гемов*.\n\n🧩 Призы будут выдаваться автоматически на ваш баланс, вывод возможен только после пересечения количества в 30 гемов.\n\n📄 Вы сможете отвечать *до 3 вопросов в день*.\n\n⚡️ Раз в три дня, вы сможете ответить на сложный вопрос, за который вы сможете получить *призы покрупнее*.\n\n❗️ Как только на вашем балансе будет 30 гемов, вы сможете их вывести, написав для этого администрации бота.\n\n😼 Помимо вопросов, здесь могут быть и *другие задания*, выполнив которые, вы получить более крупные призы.\n\n🎉 Зовите друзей, чтобы повысить соревновательный дух и вместе собирать кристаллы!`, {
                    parse_mode: 'Markdown',
                })
    
                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }

        try {
            if (messageInfo.text === '📩 Поддержка') {
                ctx.telegram.sendMessage(messageInfo.chat.id, `*Возникли проблемы или вопросы?*\n\nПишите @stolknoveni.`, {
                    parse_mode: 'Markdown'
                })
    
                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }

        try {
            if (messageInfo.text === '📩 Поддержка') {
                ctx.telegram.sendMessage(messageInfo.chat.id, `*Возникли проблемы или вопросы?*\n\nПишите @stolknoveni.`, {
                    parse_mode: 'Markdown'
                })
    
                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }

        try {
            if (messageInfo.text === '❓ Мои вопросы') {
                const user = await User.findOne({
                    id: messageInfo.from.id
                })

                if (user.isNotifications === undefined) {
                    await User.updateOne({
                        id: messageInfo.from.id
                    }, {
                        isNotifications: true,
                    })

                    const notificationsButtons = [
                        [
                            Markup.button.callback('Да', 'want'), Markup.button.callback('Нет', 'notWant'),
                        ]
                    ]

                    await ctx.telegram.sendMessage(messageInfo.from.id, 'Ты хочешь получать оповещения, когда будут созданы новые вопросы?', {
                        reply_markup: { inline_keyboard: notificationsButtons }
                    })

                    return
                }

                if (user.isNotifications) {
                    ctx.telegram.sendMessage(messageInfo.from.id, 'Нужно ответить на вопрос об уведомлениях, чтобы получить доступ к вопросам.')

                    return
                }

                if (!user.isNotifications) {
                    questions(ctx, user)
                }
                
                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }

        try {
            if (messageInfo.text === '🎯 Профиль') {
                const withdraw = [
                    [
                        Markup.button.callback('Вывести', 'withdraw')
                    ]
                ]
    
                const user = await User.findOne({
                    id: messageInfo.from.id
                })
    
                const balance = user.balance.toFixed(1)
                const amountAnswer = user.answeredQuestionsCount
    
                if (balance < 30) {
                    await ctx.telegram.sendMessage(messageInfo.from.id, `Ваш баланс: *${+balance}* гемов.\nКоличество ответов: *${+amountAnswer}*\n\nМинимальная сумма вывода: *30*`, {
                        parse_mode: 'Markdown',
                    })
                } else {
                    await ctx.telegram.sendMessage(messageInfo.from.id, `Ваш баланс: *${+balance}* гемов.\nКоличество ответов: *${+amountAnswer}*\n\nМинимальная сумма вывода: *30*`, {
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: withdraw, resize_keyboard: true }
                    })
                }
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }

        try {
            if (messageInfo.text === 'Отменить действие') {
                await ctx.telegram.sendMessage(messageInfo.from.id, `Действие отменено`, {
                    parse_mode: 'Markdown',
                    reply_markup: { keyboard: buttons.adminFunctions, resize_keyboard: true }
                })
    
                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }
        
        try {
            if (messageInfo.text === 'Вернуться назад') {
                await ctx.telegram.sendMessage(messageInfo.from.id, `Готово`, {
                    parse_mode: 'Markdown',
                    reply_markup: { keyboard: buttons.menuButtons, resize_keyboard: true }
                })
    
                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }
        
        try {
            if (messageInfo.text === '✨ Помощь') {
                ctx.telegram.sendMessage(messageInfo.from.id, `*Функционал бота:*\n\n«🎯 Профиль» — состояние вашего профиля.\n«❓ Мои вопросы» — список доступных вопросов.\n«⛳️ О боте» — информация о боте, а именно в чем его суть, подробнее о вопросах и тд.\n«📩 Поддержка» — контакт для связи с поддержкой.`, {
                    parse_mode: 'Markdown'
                })
    
                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }
        
        try {
            if (messageInfo.text === '📊 Статистика' && config.adminId.includes(messageInfo.from.id)) {
                const correctCount = await Count.findOne({
                    isCorrect: true,
                })

                ctx.telegram.sendMessage(messageInfo.from.id, `Количество юзеров: ${correctCount.count}`)
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }
    } else {
        try {
            if (messageInfo.text === '🗑 Удалить вопросы' && config.adminId.includes(messageInfo.from.id)) {
                ctx.telegram.sendMessage(messageInfo.from.id, 'Выберите нужный пункт:', {
                    reply_markup: { keyboard: buttons.deleteButtons, resize_keyboard: true }
                })

                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }
        
        try {
            if (messageInfo.text === '🗑 Удалить все вопросы' && config.adminId.includes(messageInfo.from.id)) {
                const deleteOrNot = [
                    [
                        Markup.button.callback('Да', 'delete'), Markup.button.callback('Нет', 'notDelete'),
                    ]
                ]
    
                await ctx.telegram.sendMessage(messageInfo.from.id, 'Вы точно хотите удалить все вопросы?', {
                    reply_markup: { inline_keyboard: deleteOrNot }
                })
    

                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }
        
        try {
            if (messageInfo.text === '🗑 Удалить последний вопрос') {
                const deleteOrNot = [
                    [
                        Markup.button.callback('Да', 'deleteLast'), Markup.button.callback('Нет', 'notDelete'),
                    ]
                ]
    
                await ctx.telegram.sendMessage(messageInfo.from.id, 'Вы точно хотите удалить последний вопрос?', {
                    reply_markup: { inline_keyboard: deleteOrNot }
                })

                return
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }

        try {
            if (messageInfo.text === '📝 Создать вопрос' && config.adminId.includes(messageInfo.from.id)) {
                await ctx.telegram.sendMessage(messageInfo.from.id, 'Итак, для начала пришлите фото, которое будет отправляться вместе с вопросом:', {
                    reply_markup: { keyboard: buttons.cancelButton, resize_keyboard: true }
                })
    
                ctx.session.createQuestionStage1 = true
            } else {
                if (config.adminId.includes(messageInfo.from.id) && ctx.session.createQuestionStage1 === true) {
                    ctx.session.createQuestionStage1 = false
                    ctx.session.createQuestionStage2 = true
                    ctx.session.fileId = messageInfo.photo[2].file_id
    
                    await ctx.telegram.sendMessage(messageInfo.from.id, 'Отлично! Теперь пришлите сам вопрос:', {
                        reply_markup: { keyboard: buttons.cancelButton, resize_keyboard: true }
                    })
    
                    return
                }
                if (config.adminId.includes(messageInfo.from.id) && ctx.session.createQuestionStage2 === true) {
                    ctx.session.createQuestionStage2 = false
                    ctx.session.createQuestionStage3 = true
                    ctx.session.question = messageInfo.text
    
                    await ctx.telegram.sendMessage(messageInfo.from.id, 'Супер! Теперь введите сумму гемов, которую пользователи получат за правильный ответ:', {
                        reply_markup: { keyboard: buttons.cancelButton, resize_keyboard: true }
                    })
    
                    return
                }
    
                if (config.adminId.includes(messageInfo.from.id) && ctx.session.createQuestionStage3 === true) {
                    ctx.session.createQuestionStage3 = false
                    ctx.session.createQuestionStage4 = true
                    ctx.session.price = messageInfo.text
    
                    await ctx.telegram.sendMessage(messageInfo.from.id, 'Дело за малым! Введите варианты ответов в формате, как показано ниже:\n\nОбозначьте плюсом правильный, а минусом неправильный вариант ответа:\n\nПример:\nЭмз/-\nБарли/-\nБулл/-\nЭдгар/+', {
                        reply_markup: { keyboard: buttons.cancelButton, resize_keyboard: true }
                    })
    
                    return
                }
    
                if (config.adminId.includes(messageInfo.from.id) && ctx.session.createQuestionStage4 === true) {
                    const questions = await Question.find({
                        isQuestion: true,
                    })
                    let lastQuestionId  
    
                    if (questions[0] !== undefined) {
                        const questionId = questions.length - 1
                        lastQuestionId = questions[questionId].questionId
                    } else {
                        lastQuestionId = 0
                    }
                    const questionId = lastQuestionId + 1
    
                    ctx.session.createQuestionStage4 = false
                    ctx.session.options = messageInfo.text
                    const options = messageInfo.text
    
                    const namesButtons = []
                    const correctButtons = []
    
                    const startArray = options.split('\n')
    
                    startArray.forEach(el => {
                        const array = el.split('/')
    
                        namesButtons.push(array[0])
                        correctButtons.push(array[1])
                    })
    
                    
    
                    await Question.create({
                        file_id: ctx.session.fileId,
                        question: ctx.session.question,
                        price: +ctx.session.price,
                        questionId: +questionId,
                        options: [
                            [
                                Markup.button.callback(namesButtons[0], `${questionId}/${correctButtons[0]}`,), Markup.button.callback(namesButtons[1], `${questionId}/${correctButtons[1]}`,),
                            ],
                            [
                                Markup.button.callback(namesButtons[2], `${questionId}/${correctButtons[2]}`,), Markup.button.callback(namesButtons[3], `${questionId}/${correctButtons[3]}`,),
                            ],
                        ],
                    })
    
                    const users = await User.find({
                        notifications: true,
                    })
    
                    // users.forEach(el => {
                    //     ctx.telegram.sendMessage(el.id, 'Только что был создан новый вопрос, бегом отвечать!')
                    // })
    
                    await ctx.telegram.sendMessage(messageInfo.from.id, 'Готово!', {
                        reply_markup: { keyboard: buttons.menuButtons, resize_keyboard: true }
                    })
    
                    return
                }
            }
        } catch(e) {
            error(e, messageInfo.text, messageInfo.from.id)
        }
    }
})

bot.launch()

// Функции:

async function answerToFirstQuestion(ctx) {
    const callbackInfo = ctx.update.callback_query

    await User.updateOne({
        id: callbackInfo.from.id
    }, {
        balance: 0.1,
    })
    await User.updateOne({
        id: callbackInfo.from.id
    }, {
        answeredQuestionsCount: 1,
    })

    ctx.telegram.deleteMessage(callbackInfo.from.id, callbackInfo.from.id)
    ctx.answerCbQuery(`Ух ты!\nТы ответил правильно и заработал свои первые 0.1 гемов!\n\nТеперь изучи подробнее функционал бота, нажав на кнопку «✨ Помощь» в меню ниже.`, { show_alert: true })
    ctx.telegram.sendMessage(callbackInfo.from.id, 'Меню кнопок:', {
        reply_markup: { keyboard: buttons.menuButtons, resize_keyboard: true }
    })

    return
}

async function questions(ctx, user) {
    const questions = await Question.find({
        isArchive: false,
    })

    const notAnsweredQuestions = []

    questions.forEach(async el => {
        const questionId = el.questionId

        if (!user.answeredQuestions.includes(questionId)) {
            notAnsweredQuestions.push(el)
        }
    })

    if (!notAnsweredQuestions.length) {
        await ctx.telegram.sendMessage(user.id, 'На данный момент нет доступных вопросов.', {
            reply_markup: { keyboard: buttons.menuButtons, resize_keyboard: true }
        })

        return
    }

    notAnsweredQuestions.forEach(async (question) => {
        const questionPhoto = await ctx.telegram.sendPhoto(user.id, question.file_id, {
            caption: `*${question.question}*\n\nСтатус: #открыт\nНаграда: *${question.price} гемов*`,
            parse_mode: 'Markdown',
        })

        const options = question.options

        await ctx.telegram.editMessageReplyMarkup(user.id, questionPhoto.message_id, questionPhoto.message_id, { inline_keyboard: options })
    })

    return
}