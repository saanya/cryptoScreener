const {Gateway} = require('~/components/bybit/api//Gateway')
const {TelegramComponent} = require('~/components/TelegramComponent')
const {telegram} = require('~/configs/telegram')

class BybitComponent {
  #gateway = null
  #telegram = null
  #userModel = null
  #userSettingsModel = null
  #currencyPairModel = null
  #openInterestModel = null
  #pairPriceModel = null
  #userSignalModel = null
  #userExchangeModel = null
  static DATE_FORMAT = 'YYYY-MM-DD'

  constructor() {
    this.#gateway = new Gateway()
    this.#telegram = new TelegramComponent(telegram.botToken)
    // this.#userModel = new UserModel()
    // this.#userSettingsModel = new UserSettingsModel()
    // this.#currencyPairModel = new CurrencyPairModel()
    // this.#openInterestModel = new OpenInterestModel()
    // this.#pairPriceModel = new PairPriceModel()
    // this.#userSignalModel = new UserSignalModel()
    // this.#userExchangeModel = new UserExchangeModel()
  }

  async getTickers() {
    return await this.#gateway.getTickers()
  }

  async getAllUsdtSymbols(tickersData) {
    let result = tickersData
      .filter((item) => item.symbol.includes('USDT'))
      .map((item) => item.symbol)

    return result
  }
}

exports.BybitComponent = BybitComponent
