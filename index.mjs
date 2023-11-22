import { webcrack } from "webcrack"
import { Deobfuscator } from "deobfuscator"
import { writeFile } from "node:fs/promises"
import { assert } from "node:console"

async function deobfuscate(obfuscatedScript) {
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

    return synchronyDeobfs
}

// Lazyness moment
async function getValidScript() {
    for (let attempts = 0; attempts < 5; attempts++) {
        const obfuscatedScript = await fetch("https://vidplay.lol/assets/mcloud/min/embed.js", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/118.0"
            }
        }).then(async (x) => await x.text())

        const deobfuscated = await deobfuscate(obfuscatedScript)
        if (deobfuscated.includes("<video />")) return deobfuscated
    }
    throw Error("My condolences")
}

const deobfuscated = await getValidScript() 
// Phase 3: Let's find the plaintext keys!
const start = deobfuscated.substring(deobfuscated.indexOf("<video />"))
const end = start.substring(0, start.indexOf(".replace"))
const keys = Array.from(end.matchAll(/'(\w+)'/g), x => x[1])
assert(keys.length == 2, "Invalid array length!")

// Be happy!
await writeFile("keys.json", JSON.stringify(keys), "utf8")
