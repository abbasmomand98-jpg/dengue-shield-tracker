// Smoke test for Dengue Shield demo logic.
// Extracts the <script> from index.html, evals it in Node (DOM-guarded),
// then asserts the core logic: triage verdicts, risk bands, city data.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error("FAIL: no <script> block found"); process.exit(1); }

const sandbox = { console, Math, JSON };
vm.createContext(sandbox);
vm.runInContext(m[1], sandbox);

let pass = 0, fail = 0;
function eq(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name + " — got " + JSON.stringify(actual) + ", want " + JSON.stringify(expected)); }
}
function truthy(name, v) {
  if (v) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name + " — falsy"); }
}

console.log("— triage —");
eq("warning sign -> emergency", sandbox.triage({feverDays:2, rash:true, bleeding:true, severePain:false, vomiting:false, drowsy:false}).level, "emergency");
eq("severe pain -> emergency", sandbox.triage({feverDays:1, rash:false, bleeding:false, severePain:true, vomiting:false, drowsy:false}).level, "emergency");
eq("vomiting -> emergency", sandbox.triage({feverDays:0, rash:false, bleeding:false, severePain:false, vomiting:true, drowsy:false}).level, "emergency");
eq("drowsy -> emergency", sandbox.triage({feverDays:0, rash:false, bleeding:false, severePain:false, vomiting:false, drowsy:true}).level, "emergency");
eq("4-day fever, no warnings -> today", sandbox.triage({feverDays:4, rash:false, bleeding:false, severePain:false, vomiting:false, drowsy:false}).level, "today");
eq("5-day fever -> today", sandbox.triage({feverDays:5, rash:true, bleeding:false, severePain:false, vomiting:false, drowsy:false}).level, "today");
eq("1-day fever -> monitor", sandbox.triage({feverDays:1, rash:false, bleeding:false, severePain:false, vomiting:false, drowsy:false}).level, "monitor");
eq("no fever -> monitor", sandbox.triage({feverDays:0, rash:false, bleeding:false, severePain:false, vomiting:false, drowsy:false}).level, "monitor");
eq("emergency flags listed", sandbox.triage({feverDays:2, rash:false, bleeding:true, severePain:true, vomiting:false, drowsy:false}).flags.length, 2);
truthy("emergency title mentions TODAY", /TODAY/.test(sandbox.triage({feverDays:0, rash:false, bleeding:false, severePain:false, vomiting:false, drowsy:true}).title));

console.log("— risk bands —");
eq("78 -> HIGH", sandbox.riskBand(78).label, "HIGH RISK");
eq("72 -> HIGH", sandbox.riskBand(72).label, "HIGH RISK");
eq("54 -> MODERATE", sandbox.riskBand(54).label, "MODERATE RISK");
eq("38 -> MODERATE", sandbox.riskBand(38).label, "MODERATE RISK");
eq("12 -> LOW", sandbox.riskBand(12).label, "LOW RISK");
eq("band boundary 30", sandbox.riskBand(30).label, "MODERATE RISK");
eq("band boundary 60", sandbox.riskBand(60).label, "HIGH RISK");

console.log("— cities —");
eq("five cities", Object.keys(sandbox.CITIES).sort(), ["islamabad","karachi","lahore","peshawar","rawalpindi"]);
["lahore","rawalpindi","karachi","peshawar","islamabad"].forEach(k => {
  const c = sandbox.CITIES[k];
  truthy(k + " has name", !!c.name);
  truthy(k + " trend has 7 points", Array.isArray(c.trend) && c.trend.length === 7);
  truthy(k + " has hotspots", Array.isArray(c.hotspots) && c.hotspots.length >= 2);
  truthy(k + " has fogging note", !!c.fogging);
  truthy(k + " riskIndex 0-100", c.riskIndex >= 0 && c.riskIndex <= 100);
});
eq("lahore is high", sandbox.riskBand(sandbox.CITIES.lahore.riskIndex).label, "HIGH RISK");

console.log("— report validation —");
eq("empty report invalid", sandbox.validateReport({area:"", type:""}).ok, false);
eq("missing type invalid", sandbox.validateReport({area:"Johar Town", type:""}).ok, false);
eq("valid report ok", sandbox.validateReport({area:"Johar Town", type:"Open rooftop water tank"}).ok, true);
truthy("ref format", /^DS-2026-\d{4}$/.test(sandbox.makeRef()));

console.log("— static data —");
eq("checklist 8 items", sandbox.CHECKLIST.length, 8);
eq("6 repellents", sandbox.REPELLENTS.length, 6);
truthy("repellent PKR prices", sandbox.REPELLENTS.every(r => /Rs/.test(r.price)));
eq("5 donors", sandbox.DONORS.length, 5);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
