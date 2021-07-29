import { Application, send, Context } from "https://deno.land/x/oak@v8.0.0/mod.ts"

import { getTimestamp } from "./functions/gettimestamp.ts"
import datafeedRouter from "./routes/datafeed.ts"
import { cronUpdate } from "./functions/cronupdate.ts"

const env = Deno.env.toObject()

const port = parseInt(env.PORT) || 8000
const app = new Application()

cronUpdate()

// Logger
app.use(async (ctx: Context, next) => {
    await next()
    const rt = ctx.response.headers.get("X-Response-Time")
    console.log(`[_API] [${getTimestamp()}] ${ctx.request.method} ${ctx.request.url} - ${rt}`)
})

// Timing
app.use(async (ctx: Context, next) =>{
    const start = Date.now();
    await next()
    const ms = Date.now() - start
    ctx.response.headers.set("X-Response-Time", `${ms}ms`)
    ctx.response.headers.append("Access-Control-Allow-Origin", "*")
})

app.use(datafeedRouter.routes())
app.use(datafeedRouter.allowedMethods())

// serve static
app.use(async (ctx: Context, next) => {
    await next()
    await send(ctx, ctx.request.url.pathname, {
        root: `${Deno.cwd()}/static`,
        index: "index.html",
    })
})

// Listening
app.addEventListener("listen", ({ secure, hostname, port }: { secure: boolean, hostname?: string, port: number }) => {
    const protocol = secure ? "https://" : "http://"
    const url = `${protocol}${hostname ?? "localhost"}:${port}`
    console.log(`[_API] [${getTimestamp()}] Listening on : ${url}`)
})

await app.listen({ port: port })
