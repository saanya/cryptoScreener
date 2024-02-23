const {Telegraf} = require('telegraf')

class TelegramComponent {
  #botToken = null
  #botTelegraf = null

  constructor(botToken) {
    this.#botToken = botToken
    if (this.#botToken === undefined) {
      throw new Error('botToken must be provided!')
    }
    this.#botTelegraf = new Telegraf(this.#botToken)
  }

  getTelegraf() {
    return this.#botTelegraf
  }

  async sendMessage(text, chatId) {
    await this.#botTelegraf.telegram.sendMessage(chatId, text, {
      parse_mode: 'HTML',
    })
  }
}
exports.TelegramComponent = TelegramComponent
