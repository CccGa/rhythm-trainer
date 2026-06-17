import fs from "fs";
let content = fs.readFileSync("src/App.vue", "utf-8");
content = content.replace("    const x = 12 + col * measureWidth\r\n    const y = 36 + row * rowHeight\r\n    const stave = new Stave(x, y, measureWidth)", 
`    const rawW = Math.max(80, Math.min(350, 80 + bar.length * 22))
    const rowTotal = rm[row]
    const mw = Math.round(rawW / rowTotal * fixedRowWidth)
    let prevW = 0
    for (let ci = 0; ci < col; ci++) {
      const ciRaw = Math.max(80, Math.min(350, 80 + measures[row * measuresPerRow + ci].length * 22))
      prevW += Math.round(ciRaw / rowTotal * fixedRowWidth)
    }
    const x = 12 + prevW
    const y = 36 + row * rowHeight
    const stave = new Stave(x, y, mw)`);
fs.writeFileSync("src/App.vue", content, "utf-8");
console.log("????: " + (content.indexOf("const rawW") >= 0 ? "??" : "??"));
