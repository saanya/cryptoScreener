class Gateway {
  FAPI_URL = 'https://fapi.binance.com'
  BASE_API = 'https://api.binance.com'

  async getAllUsdtSymbols() {
    let result = []

    const exchangeInfoResult = await fetch(
      `${this.BASE_API}/api/v1/exchangeInfo`,
    )
    if (exchangeInfoResult.ok) {
      const data = await exchangeInfoResult.json()
      result = data.symbols
        .filter((item) => item.symbol.includes('USDT'))
        .map((item) => item.symbol)
    } else {
      console.log(exchangeInfoResult)
    }

    return result
  }

  async getOpenInterestsHistory(symbol, period = '5m', limit = 4) {
    let result = []

    const openInterestsResult = await fetch(
      `${this.FAPI_URL}/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`,
    )
    if (openInterestsResult.ok) {
      result = await openInterestsResult.json()
    } else {
      console.log(openInterestsResult.statusText)
    }

    return result
  }

  async getBasis(symbol, period = '5m', limit = 4, contractType = 'PERPETUAL') {
    let result = []

    const basisResult = await fetch(
      `${this.FAPI_URL}/futures/data/basis?pair=${symbol}&period=${period}&limit=${limit}&contractType=${contractType}`,
    )
    if (basisResult.ok) {
      result = await basisResult.json()
    } else {
      console.log(basisResult)
    }

    return result
  }

  async getOpenInterest(symbol) {
    let result = null

    const openInterest = await fetch(
      `${this.FAPI_URL}/fapi/v1/openInterest?symbol=${symbol}`,
    )
    if (openInterest.ok) {
      result = await openInterest.json()
    } else {
      // console.log(`symbol: ${symbol}`, openInterest.statusText)
    }

    return result
  }

  async getAllPairPrice() {
    let result = []

    const prices = await fetch(`${this.FAPI_URL}/fapi/v1/ticker/price`)
    if (prices.ok) {
      result = await prices.json()
    } else {
      console.log(prices.statusText)
    }

    return result
  }
}

exports.Gateway = Gateway
