const {telegram} = require('~/configs/telegram')

class Settings {
  #chatId = null
  #botToken = null

  constructor() {
    this.#chatId = telegram.chatId
    this.#botToken = telegram.botToken
  }

  getChatId() {
    return this.#chatId
  }

  getBotToken() {
    return this.#botToken
  }
}

exports.Settings = Settings
