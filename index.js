const crypto = require('crypto')
const util = require('util')
const Koa = require('koa')
const Router = require('koa-router')
const koaStatic = require('koa-static')
const superagent = require('superagent')
const config = require('./config')

const app = new Koa()

const router = new Router()

const staticMiddleware = koaStatic('static')

router.get('/api', async (ctx, next) => {
  let q = ctx.request.query.q
  if(!q) {
    return next()
  }

  q = q
  const salt =  Math.random() * 10000 | 0
  const signStr = await sign({
    appkey: config.appKey,
    q,
    salt,
    secretKey: config.secretKey
  })
  const params = {
    q,
    from: 'auto',
    to: 'auto',
    appKey: config.appKey,
    salt,
    sign: signStr
  }

  const result = await superagent
                   .get(config.apiAddr)
                   .set({
                     timeout: 10000
                   })
                   .query(params)
  console.log(params)
  ctx.body = result.text
  next()
})

router.get('/', staticMiddleware)

app.use(router.routes())

app.listen(8082, () => {
  console.log('app listen at 8082')
})

async function sign({ appkey, q, salt, secretKey }) {
  const str = '' + appkey + q + salt + secretKey
  const hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex').toUpperCase()
}
