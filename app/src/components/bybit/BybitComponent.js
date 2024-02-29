const {Gateway} = require('~/components/bybit/api//Gateway')

class BybitComponent {
  #gateway = null
  static DATE_FORMAT = 'YYYY-MM-DD'

  constructor() {
    this.#gateway = new Gateway()
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
