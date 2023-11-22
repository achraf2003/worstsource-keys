import { webcrack } from "webcrack"
import { Deobfuscator } from "deobfuscator"
import { writeFile } from "node:fs/promises"

let obfuscatedScript = await fetch("https://vidplay.lol/assets/mcloud/min/embed.js")
    .then(async (x) => await x.text())

// Phase 1: Webcrack
for (let run = 0; run < 5; run++) {
    try {
        const result = await webcrack(obfuscatedScript)
        if (result.code == "") break
        obfuscatedScript = result.code
    } catch (e) {
        break
    }
}

// Phase 2: Synchrony
const synchrony = new Deobfuscator()
let synchronyDeobfs = obfuscatedScript
for (let run = 0; run < 5; run++) {
    try {
        const result = await synchrony.deobfuscateSource(synchronyDeobfs)
        if (result == "") break
        synchronyDeobfs = result
    } catch (e) {
        break
    }
}

// Phase 3: Let's find the plaintext keys!
const start = synchronyDeobfs.substring(synchronyDeobfs.indexOf("<video />"))
const end = start.substring(0, start.indexOf(".replace"))
const keys = Array.from(end.matchAll(/'(\w+)'/g), x => x[1])

// Be happy!
await writeFile("keys.json", JSON.stringify(keys), "utf8")
