import { Telegraf, Markup } from 'telegraf'
import config from './config.js'
import { getTime } from './utils.js'

const bot = new Telegraf(config.reportBotToken)

bot.action(/.+/, async ctx => {
    if (ctx.update.callback_query.data.startsWith('error')) {
        const error = ctx.update.callback_query.data.split('/')[1]
        
        ctx.answerCbQuery(error, { show_alert: true })

        return
    }
})

bot.launch()

async function error(error, place, user) {
    const time = getTime()

    const errorButton = [
        [
            Markup.button.callback('Поподробнее', `error/${error}`)
        ]
    ]

    bot.telegram.sendMessage(config.myId, `У [Пользователя](tg://user?id=${user}) ошибка в «*${place}*»\n\nОшибка случилась в ${time} 🕓`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: errorButton }
    })
}

export default error