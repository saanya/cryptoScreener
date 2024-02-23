class Gateway {
  API_URL = 'https://api.bybit.com'

  async getTickers() {
    let result = []

    const tickersInfoResult = await fetch(
      `${this.API_URL}/derivatives/v3/public/tickers`,
    )
    if (tickersInfoResult.ok) {
      const data = await tickersInfoResult.json()
      if (data.retMsg === 'Too many visits!') {
        console.log('Too many visits!!!!!')
        return result
      }

      result = data.result.list
    } else {
      console.log(tickersInfoResult)
    }

    return result
  }
}

exports.Gateway = Gateway
